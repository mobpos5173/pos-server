import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { TableLoading } from "@/components/ui/table-loading";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRefunds } from "@/hooks/use-refunds";
import { RefundFormData, RefundItem, RefundType, Transaction } from "@/types";

interface RefundFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: RefundFormData) => Promise<void>;
    transactionId: number;
    isLoading?: boolean;
}

export function RefundForm({
    open,
    onOpenChange,
    onSubmit,
    transactionId,
    isLoading = false,
}: RefundFormProps) {
    const { getRefundableItems } = useRefunds();
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [items, setItems] = useState<RefundItem[]>([]);
    const [reason, setReason] = useState("");
    const [refundType, setRefundType] = useState<RefundType>("partial");
    const [totalRefund, setTotalRefund] = useState(0);

    useEffect(() => {
        if (open && transactionId) {
            setLoading(true);
            getRefundableItems(transactionId)
                .then((data) => {
                    setTransaction(data.transaction);
                    setItems(data.items);
                    // If all items are fully refunded, disable the form
                    const allFullyRefunded = data.items.every(
                        (item: RefundItem) => item.refundStatus === "full"
                    );
                    if (allFullyRefunded) {
                        setRefundType("partial");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching refundable items:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, transactionId, getRefundableItems]);

    // When refund type changes, update quantities
    useEffect(() => {
        if (refundType === "full") {
            // Set all quantities to max available
            const updatedItems = items.map((item) => ({
                ...item,
                quantityToRefund: item.availableQuantity,
                totalRefund: item.availableQuantity * item.unitPrice,
            }));
            setItems(updatedItems);
        } else {
            // Reset all quantities to 0
            const updatedItems = items.map((item) => ({
                ...item,
                quantityToRefund: 0,
                totalRefund: 0,
            }));
            setItems(updatedItems);
        }
    }, [refundType]);

    // Calculate total refund amount
    useEffect(() => {
        const total = items.reduce((sum, item) => sum + item.totalRefund, 0);
        setTotalRefund(total);
    }, [items]);

    const handleQuantityChange = (index: number, value: number) => {
        const updatedItems = [...items];
        const item = updatedItems[index];

        // Ensure quantity is within valid range
        const quantity = Math.min(Math.max(0, value), item.availableQuantity);

        item.quantityToRefund = quantity;
        item.totalRefund = quantity * item.unitPrice;

        setItems(updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that at least one item has a quantity to refund
        const hasItemsToRefund = items.some(
            (item) => item.quantityToRefund > 0
        );
        if (!hasItemsToRefund) {
            alert("Please select at least one item to refund");
            return;
        }

        const formData: RefundFormData = {
            transactionId,
            reason,
            type: refundType,
            items,
            totalAmount: totalRefund,
        };

        await onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                        <DialogDescription>
                            {transaction && (
                                <div className="mt-2">
                                    <p>
                                        <strong>Transaction ID:</strong>{" "}
                                        {transaction.id}
                                    </p>
                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {format(
                                            new Date(
                                                transaction.dateOfTransaction
                                            ),
                                            "MMM dd, yyyy HH:mm"
                                        )}
                                    </p>
                                    <p>
                                        <strong>Total Amount:</strong> PHP{" "}
                                        {transaction.totalPrice.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="py-4">
                            Loading transaction details...
                        </div>
                    ) : (
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="refundType">Refund Type</Label>
                                <RadioGroup
                                    id="refundType"
                                    value={refundType}
                                    onValueChange={(value) =>
                                        setRefundType(value as RefundType)
                                    }
                                    className="flex space-x-4"
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="full"
                                            id="full"
                                        />
                                        <Label htmlFor="full">
                                            Full Refund
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="partial"
                                            id="partial"
                                        />
                                        <Label htmlFor="partial">
                                            Partial Refund
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason for Refund
                                </Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for refund"
                                    className="min-h-[80px]"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Items to Refund</Label>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">
                                                    Original Qty
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Already Refunded
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Available
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Unit Price
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Qty to Refund
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Refund Amount
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableLoading columns={8} />
                                            ) : items.length > 0 ? (
                                                items.map((item, index) => (
                                                    <TableRow
                                                        key={item.orderId}
                                                    >
                                                        <TableCell>
                                                            {item.productName}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {
                                                                item.originalQuantity
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {
                                                                item.refundedQuantity
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {
                                                                item.availableQuantity
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            PHP{" "}
                                                            {item.unitPrice.toFixed(
                                                                2
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={
                                                                    item.availableQuantity
                                                                }
                                                                value={
                                                                    item.quantityToRefund
                                                                }
                                                                onChange={(e) =>
                                                                    handleQuantityChange(
                                                                        index,
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0
                                                                    )
                                                                }
                                                                className="w-20 text-right"
                                                                disabled={
                                                                    item.availableQuantity ===
                                                                        0 ||
                                                                    refundType ===
                                                                        "full" ||
                                                                    isLoading
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            PHP{" "}
                                                            {item.totalRefund.toFixed(
                                                                2
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.refundStatus ===
                                                            "full" ? (
                                                                <span className="text-green-500">
                                                                    Fully
                                                                    Refunded
                                                                </span>
                                                            ) : item.refundStatus ===
                                                              "partial" ? (
                                                                <span className="text-amber-500">
                                                                    Partially
                                                                    Refunded
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">
                                                                    Not Refunded
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={8}
                                                        className="text-center py-4"
                                                    >
                                                        No refundable items
                                                        available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 items-center">
                                <Label className="font-bold">
                                    Total Refund Amount:
                                </Label>
                                <span className="text-xl font-bold">
                                    PHP {totalRefund.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || isLoading || totalRefund <= 0}
                        >
                            {isLoading && (
                                <Spinner className="mr-2" size="sm" />
                            )}
                            Process Refund
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
