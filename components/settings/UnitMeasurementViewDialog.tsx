import { UnitMeasurement } from "@/types";
import { ViewDialog, ViewField } from "@/components/ui/view-dialog";

interface UnitMeasurementViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitMeasurement: UnitMeasurement;
}

export function UnitMeasurementViewDialog({
    open,
    onOpenChange,
    unitMeasurement,
}: UnitMeasurementViewDialogProps) {
    return (
        <ViewDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Unit Measurement Details"
            description={`Details for ${unitMeasurement.name}`}
        >
            <div className="grid grid-cols-2 gap-4">
                <ViewField label="Name" value={unitMeasurement.name} />
                <ViewField label="Symbol" value={unitMeasurement.description} />
            </div>
        </ViewDialog>
    );
}
