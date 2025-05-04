import { Category } from "@/types";
import { ViewDialog, ViewField } from "@/components/ui/view-dialog";
import { useCategories } from "@/hooks/use-categories";

interface CategoryViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category;
}

export function CategoryViewDialog({
    open,
    onOpenChange,
    category,
}: CategoryViewDialogProps) {
    const { categories } = useCategories();

    const getParentCategory = (parentId?: number) => {
        if (!parentId) return null;
        return categories.find((cat) => cat.id === parentId);
    };

    const parentCategory = getParentCategory(category.parentId);

    return (
        <ViewDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Category Details"
            description={`Details for ${category.name}`}
        >
            <div className="grid gap-4">
                <ViewField label="Name" value={category.name} />
                <ViewField label="Description" value={category.description} />
                <ViewField
                    label="Parent Category"
                    value={parentCategory ? parentCategory.name : "None"}
                />
            </div>
        </ViewDialog>
    );
}
