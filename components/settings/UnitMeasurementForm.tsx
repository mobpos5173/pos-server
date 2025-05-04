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
import { Spinner } from "@/components/ui/spinner";

interface UnitMeasurementFormData {
    name: string;
    description: string;
}

interface UnitMeasurementFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UnitMeasurementFormData) => void;
    initialData?: UnitMeasurementFormData | null;
    mode: "create" | "edit";
    isLoading?: boolean;
}

export function UnitMeasurementForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    isLoading = false,
}: UnitMeasurementFormProps) {
    const [formData, setFormData] = useState<UnitMeasurementFormData>({
        name: "",
        description: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
            });
        } else {
            setFormData({ name: "", description: "" });
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
                                ? "Add Unit Measurement"
                                : "Edit Unit Measurement"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the details for the unit measurement.
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
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
