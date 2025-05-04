import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function ViewDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
}: ViewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="space-y-4">{children}</div>
            </DialogContent>
        </Dialog>
    );
}

export function ViewField({
    label,
    value,
    className,
}: {
    label: string;
    value: string | number | null | undefined;
    className?: string;
}) {
    return (
        <div className={className}>
            <div className="text-sm font-medium text-muted-foreground">
                {label}
            </div>
            <div className="mt-1">{value || "N/A"}</div>
        </div>
    );
}
