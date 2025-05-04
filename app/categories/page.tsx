"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TableLoading } from "@/components/ui/table-loading";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryViewDialog } from "@/components/categories/CategoryViewDialog";
import { useCategories } from "@/hooks/use-categories";
import { Category } from "@/types";
import { Pencil, Trash2, Eye, ChevronRight, ChevronDown } from "lucide-react";

export default function CategoriesPage() {
    const { userId } = useAuth();
    const { categories, loading, error, refreshCategories } = useCategories();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );
    const [viewingCategory, setViewingCategory] = useState<Category | null>(
        null
    );
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const handleCreate = () => {
        setEditingCategory(null);
        setOpenDialog(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setOpenDialog(true);
    };

    const handleView = (category: Category) => {
        setViewingCategory(category);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                setIsActionLoading(true);
                const response = await fetch(`/api/categories/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete category");
                refreshCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Organize categories into a hierarchy
    const organizeCategories = (categories: Category[]): Category[] => {
        const categoryMap = new Map<number, Category>();
        const rootCategories: Category[] = [];

        // First pass: Create a map of all categories
        categories.forEach((category) => {
            categoryMap.set(category.id, { ...category, subcategories: [] });
        });

        // Second pass: Organize into hierarchy
        categories.forEach((category) => {
            const currentCategory = categoryMap.get(category.id)!;
            if (category.parentId) {
                const parentCategory = categoryMap.get(category.parentId);
                if (parentCategory) {
                    parentCategory.subcategories =
                        parentCategory.subcategories || [];
                    parentCategory.subcategories.push(currentCategory);
                }
            } else {
                rootCategories.push(currentCategory);
            }
        });

        return rootCategories;
    };

    const renderCategoryRow = (category: Category, level: number = 0) => {
        const isExpanded = expandedCategories.includes(category.id);
        const hasSubcategories =
            category.subcategories && category.subcategories.length > 0;

        return (
            <>
                <TableRow key={category.id}>
                    <TableCell>
                        <div
                            className="flex items-center"
                            style={{ paddingLeft: `${level * 24}px` }}
                        >
                            {hasSubcategories && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => toggleExpand(category.id)}
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            {!hasSubcategories && <div className="w-6" />}
                            {category.name}
                        </div>
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(category)}
                                disabled={isActionLoading}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(category)}
                                disabled={isActionLoading}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(category.id)}
                                disabled={isActionLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {isExpanded &&
                    category.subcategories?.map((subcategory: any): any =>
                        renderCategoryRow(subcategory, level + 1)
                    )}
            </>
        );
    };

    if (!userId) {
        return <div>Please sign in to view categories</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const hierarchicalCategories = organizeCategories(categories);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button onClick={handleCreate} disabled={isActionLoading}>
                    Add Category
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading || isActionLoading ? (
                            <TableLoading columns={3} />
                        ) : hierarchicalCategories.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center py-4"
                                >
                                    No categories found
                                </TableCell>
                            </TableRow>
                        ) : (
                            hierarchicalCategories.map((category) =>
                                renderCategoryRow(category)
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryForm
                open={openDialog}
                onOpenChange={setOpenDialog}
                onSubmit={async (data) => {
                    try {
                        setIsActionLoading(true);
                        const url = editingCategory
                            ? `/api/categories/${editingCategory.id}`
                            : "/api/categories";
                        const method = editingCategory ? "PUT" : "POST";

                        const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                        });
                        if (!response.ok)
                            throw new Error("Failed to save category");
                        setOpenDialog(false);
                        refreshCategories();
                    } catch (error) {
                        console.error("Error saving category:", error);
                    } finally {
                        setIsActionLoading(false);
                    }
                }}
                initialData={editingCategory}
                mode={editingCategory ? "edit" : "create"}
                isLoading={isActionLoading}
            />

            {viewingCategory && (
                <CategoryViewDialog
                    open={!!viewingCategory}
                    onOpenChange={(open) => !open && setViewingCategory(null)}
                    category={viewingCategory}
                />
            )}
        </div>
    );
}
