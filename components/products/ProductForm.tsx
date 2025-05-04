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
import { Product, ProductFormData } from "@/types";
import { useCategories } from "@/hooks/use-categories";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductFormData) => void;
    initialData?: Product | null;
    mode: "create" | "edit";
    isLoading?: boolean;
}

const defaultFormData: ProductFormData = {
    name: "",
    code: "",
    description: "",
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    lowStockLevel: 0,
    expirationDate: "",
    categoryId: 0,
    unitMeasurement: "",
    image: "",
};

export function ProductForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
    isLoading = false,
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
    const [uploading, setUploading] = useState(false);
    const { categories } = useCategories();
    const [selectedParentCategory, setSelectedParentCategory] =
        useState<string>("none");

    const parentCategories = categories.filter((cat) => !cat.parentId);
    const getSubcategories = (parentId: number) =>
        categories.filter((cat) => cat.parentId === parentId);

    useEffect(() => {
        if (initialData) {
            const category = categories.find(
                (c) => c.id === initialData.categoryId
            );
            if (category) {
                if (category.parentId) {
                    setSelectedParentCategory(category.parentId.toString());
                } else {
                    setSelectedParentCategory(category.id.toString());
                }
            }

            setFormData({
                name: initialData.name,
                code: initialData.code,
                description: initialData.description || "",
                buyPrice: initialData.buyPrice,
                sellPrice: initialData.sellPrice,
                stock: initialData.stock,
                lowStockLevel: initialData.lowStockLevel || 0,
                expirationDate: initialData.expirationDate || "",
                categoryId: initialData.categoryId || 0,
                unitMeasurement: initialData.unitMeasurement || "",
                imageUrl: initialData.imageUrl || "",
            });
        } else {
            setFormData(defaultFormData);
            setSelectedParentCategory("none");
        }
    }, [initialData, open, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        if (mode === "create") {
            setFormData(defaultFormData);
            setSelectedParentCategory("none");
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const blob = await response.json();
            setFormData((prev) => ({ ...prev, imageUrl: blob.url }));
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
    };

    const subcategories =
        selectedParentCategory !== "none"
            ? getSubcategories(parseInt(selectedParentCategory))
            : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "Add Product" : "Edit Product"}
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the product details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {formData.imageUrl && (
                            <div className="relative w-full aspect-video">
                                <Image
                                    src={formData.imageUrl}
                                    alt="Product image"
                                    fill
                                    className="object-contain rounded-md"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={removeImage}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">
                                Image
                            </Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading || isLoading}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={selectedParentCategory}
                                    onValueChange={(value) => {
                                        setSelectedParentCategory(value);
                                        // If selecting a parent category with no subcategories,
                                        // set it as the category
                                        const hasSubcategories =
                                            getSubcategories(parseInt(value))
                                                .length > 0;
                                        if (
                                            !hasSubcategories &&
                                            value !== "none"
                                        ) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                categoryId: parseInt(value),
                                            }));
                                        } else {
                                            setFormData((prev) => ({
                                                ...prev,
                                                categoryId: 0,
                                            }));
                                        }
                                    }}
                                    required
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Select Category
                                        </SelectItem>
                                        {parentCategories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {subcategories.length > 0 && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="subcategory"
                                    className="text-right"
                                >
                                    Subcategory
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={formData.categoryId?.toString()}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                categoryId: parseInt(value),
                                            })
                                        }
                                        required
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="brand" className="text-right">
                                Brand
                            </Label>
                            <Input
                                id="brand"
                                value={formData.brand || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        brand: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                placeholder="Enter brand name"
                                disabled={isLoading}
                            />
                        </div>

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
                            <Label htmlFor="code" className="text-right">
                                Code
                            </Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        code: e.target.value,
                                    })
                                }
                                className="col-span-3"
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
                            <Label
                                htmlFor="unitMeasurement"
                                className="text-right"
                            >
                                Unit
                            </Label>
                            <Input
                                id="unitMeasurement"
                                value={formData.unitMeasurement}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unitMeasurement: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                placeholder="e.g., kg, pcs, box"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="buyPrice" className="text-right">
                                Buy Price
                            </Label>
                            <Input
                                id="buyPrice"
                                type="number"
                                step="0.01"
                                value={formData.buyPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        buyPrice: parseFloat(e.target.value),
                                    })
                                }
                                className="col-span-3"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sellPrice" className="text-right">
                                Sell Price
                            </Label>
                            <Input
                                id="sellPrice"
                                type="number"
                                step="0.01"
                                value={formData.sellPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sellPrice: parseFloat(e.target.value),
                                    })
                                }
                                className="col-span-3"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stock: parseInt(e.target.value),
                                    })
                                }
                                className="col-span-3"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="lowStockLevel"
                                className="text-right"
                            >
                                Low Stock Level
                            </Label>
                            <Input
                                id="lowStockLevel"
                                type="number"
                                value={formData.lowStockLevel}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lowStockLevel: parseInt(e.target.value),
                                    })
                                }
                                className="col-span-3"
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
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || uploading}>
                            {isLoading ? (
                                <Spinner className="mr-2" size="sm" />
                            ) : null}
                            {mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
