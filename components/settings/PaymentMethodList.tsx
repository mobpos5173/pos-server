import { useState } from "react";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { PaymentMethod } from "@/types";

export function PaymentMethodList() {
    const { paymentMethods, loading, error, deletePaymentMethod } =
        usePaymentMethods();
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
        null
    );
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this payment method?")) {
            try {
                await deletePaymentMethod(id);
            } catch (error) {
                console.error("Error deleting payment method:", error);
            }
        }
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setOpenEditDialog(true);
    };

    if (loading) return <div>Loading payment methods...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {paymentMethods.map((method) => (
                <TableRow key={method.id}>
                    <TableCell>{method.name}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(method)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(method.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ))}

            {editingMethod && (
                <PaymentMethodForm
                    open={openEditDialog}
                    onOpenChange={setOpenEditDialog}
                    onSubmit={async (data) => {
                        try {
                            const response = await fetch(
                                `/api/settings/payment-methods/${editingMethod.id}`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(data),
                                }
                            );
                            if (!response.ok)
                                throw new Error(
                                    "Failed to update payment method"
                                );
                            setOpenEditDialog(false);
                            setEditingMethod(null);
                        } catch (error) {
                            console.error(
                                "Error updating payment method:",
                                error
                            );
                        }
                    }}
                    mode="edit"
                    initialData={editingMethod}
                />
            )}
        </>
    );
}
