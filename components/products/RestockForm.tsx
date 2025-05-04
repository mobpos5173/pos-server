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
import { Product } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface RestockFormData {
    quantity: number;
    expirationDate?: string;
    notes?: string;
}

interface RestockFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: RestockFormData) => Promise<void>;
    product: Product | null;
    isLoading?: boolean;
}

export function RestockForm({
    open,
    onOpenChange,
    onSubmit,
    product,
    isLoading = false,
}: RestockFormProps) {
    const [formData, setFormData] = useState<RestockFormData>({
        quantity: 0,
        expirationDate: "",
        notes: "",
    });

    useEffect(() => {
        if (product) {
            setFormData({
                quantity: 0,
                expirationDate: product.expirationDate || "",
                notes: "",
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        setFormData({ quantity: 0, expirationDate: "", notes: "" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Restock Product</DialogTitle>
                        <DialogDescription>
                            {product && (
                                <div className="mt-2">
                                    <p>
                                        <strong>Product:</strong> {product.name}
                                    </p>
                                    <p>
                                        <strong>Current Stock:</strong>{" "}
                                        {product.stock}
                                    </p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        quantity: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="col-span-3"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="expirationDate"
                                className="text-right"
                            >
                                Expiration Date
                            </Label>
                            <Input
                                id="expirationDate"
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        expirationDate: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                placeholder="Add any notes about this restock"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Spinner className="mr-2" size="sm" />
                            ) : null}
                            Restock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
