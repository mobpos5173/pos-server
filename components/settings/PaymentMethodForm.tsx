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
import { PaymentMethod } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface PaymentMethodFormData {
    name: string;
}

interface PaymentMethodFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: PaymentMethodFormData) => void;
    initialData?: PaymentMethod | null;
    mode: "create" | "edit";
    isLoading?: boolean;
}

export function PaymentMethodForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    isLoading = false,
}: PaymentMethodFormProps) {
    const [formData, setFormData] = useState<PaymentMethodFormData>({
        name: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name });
        } else {
            setFormData({ name: "" });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create"
                                ? "Add Payment Method"
                                : "Edit Payment Method"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the name for the payment method.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Spinner className="mr-2" size="sm" />
                            )}
                            {mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
