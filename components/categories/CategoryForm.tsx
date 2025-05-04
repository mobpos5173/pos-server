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
import { Category } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "@/hooks/use-categories";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CategoryFormData {
    name: string;
    description: string;
    parentId?: number;
}

interface CategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CategoryFormData) => void;
    initialData?: Category | null;
    mode: "create" | "edit";
    isLoading?: boolean;
}

const defaultFormData: CategoryFormData = {
    name: "",
    description: "",
};

export function CategoryForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    isLoading = false,
}: CategoryFormProps) {
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
    const { categories, refreshCategories } = useCategories();

    // Filter out the current category and its subcategories to prevent circular references
    const availableParentCategories = categories.filter((category) => {
        if (!initialData) return true;
        return category.id !== initialData.id;
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || "",
                parentId: initialData.parentId,
            });
        } else {
            setFormData(defaultFormData);
        }

        refreshCategories();
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        if (mode === "create") {
            setFormData(defaultFormData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create"
                                ? "Add Category"
                                : "Edit Category"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the category details below.
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
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parentId" className="text-right">
                                Parent Category
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={
                                        formData.parentId?.toString() || "none"
                                    }
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            parentId:
                                                value === "none"
                                                    ? undefined
                                                    : parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        {availableParentCategories.map(
                                            (category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
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
