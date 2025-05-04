import { PaymentMethod } from "@/types";
import { ViewDialog, ViewField } from "@/components/ui/view-dialog";

interface PaymentMethodViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethod: PaymentMethod;
}

export function PaymentMethodViewDialog({
    open,
    onOpenChange,
    paymentMethod,
}: PaymentMethodViewDialogProps) {
    return (
        <ViewDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Payment Method Details"
            description={`Details for ${paymentMethod.name}`}
        >
            <ViewField label="Name" value={paymentMethod.name} />
        </ViewDialog>
    );
}
