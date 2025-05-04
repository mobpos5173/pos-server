import { useProducts } from "@/hooks/use-products";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TableLoading } from "@/components/ui/table-loading";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";
import { RestockForm } from "./RestockForm";
import { useState } from "react";
import {
    Pencil,
    Trash2,
    AlertTriangle,
    PackagePlus,
    FileDown,
    Package,
    Search,
    Eye,
} from "lucide-react";
import { Product, ProductFormData, Category } from "@/types";
import { ProductSummary } from "./ProductSummary";
import { useCategories } from "@/hooks/use-categories";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDateToPH } from "@/lib/utils/date";
import { ProductViewDialog } from "./ProductViewDialog";

type Options = {
    type: "products" | "inventory";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmit?: (data: ProductFormData) => void;
    initialData?: Product | null;
    mode?: "create" | "edit";
};

interface ProductListProps {
    options: Options;
}

export default function ProductList({ options }: ProductListProps) {
    const { products, loading, error, createProduct, refreshProducts } =
        useProducts();
    const { categories } = useCategories();
    const [openDialog, setOpenDialog] = useState(false);
    const [openRestockDialog, setOpenRestockDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(
        null
    );
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParentCategory, setSelectedParentCategory] =
        useState<string>("all");
    const [selectedSubcategory, setSelectedSubcategory] =
        useState<string>("all");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

    // Organize categories into a hierarchy
    const organizeCategories = (categories: Category[]) => {
        const parentCategories = categories.filter((cat) => !cat.parentId);
        const getSubcategories = (parentId: number) =>
            categories.filter((cat) => cat.parentId === parentId);
        return { parentCategories, getSubcategories };
    };

    const { parentCategories, getSubcategories } =
        organizeCategories(categories);
    const subcategories =
        selectedParentCategory !== "all"
            ? getSubcategories(parseInt(selectedParentCategory))
            : [];

    const handleCreate = () => {
        setMode("create");
        setEditingProduct(null);
        setOpenDialog(true);
    };

    const handleEdit = (product: Product) => {
        setMode("edit");
        setEditingProduct(product);
        setOpenDialog(true);
    };

    const handleView = (product: Product) => {
        setViewingProduct(product);
    };

    const handleRestock = (product: Product) => {
        setRestockingProduct(product);
        setOpenRestockDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                setIsActionLoading(true);
                const response = await fetch(`/api/products/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete product");
                refreshProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handleSubmit = async (data: ProductFormData) => {
        try {
            setIsActionLoading(true);
            const processedData = {
                ...data,
                description: data.description || undefined,
                image: data.image || undefined,
                imageUrl: data.imageUrl || undefined,
                expirationDate: data.expirationDate || undefined,
                unitMeasurementsId: data.unitMeasurementsId || undefined,
                categoryId: data.categoryId,
                clerkId: data.clerkId || "",
                buyPrice: parseFloat(data.buyPrice.toString()),
                sellPrice: parseFloat(data.sellPrice.toString()),
                stock: parseInt(data.stock.toString()),
                lowStockLevel: data.lowStockLevel
                    ? parseInt(data.lowStockLevel.toString())
                    : undefined,
            };

            if (mode === "create") {
                await createProduct(processedData);
            } else if (editingProduct) {
                const response = await fetch(
                    `/api/products/${editingProduct.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(processedData),
                    }
                );
                if (!response.ok) throw new Error("Failed to update product");
                await refreshProducts();
            }
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRestockSubmit = async (data: {
        quantity: number;
        expirationDate?: string;
        notes?: string;
    }) => {
        if (!restockingProduct) return;

        try {
            setIsActionLoading(true);
            const response = await fetch(
                `/api/products/${restockingProduct.id}/restock`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) throw new Error("Failed to restock product");

            setOpenRestockDialog(false);
            refreshProducts();
        } catch (error) {
            console.error("Error restocking product:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleExportRestock = async () => {
        try {
            setIsActionLoading(true);
            const response = await fetch("/api/products/restock/export");
            if (!response.ok)
                throw new Error("Failed to export restock history");

            window.location.href = "/api/products/restock/export";
            const data = await response.json();
            if (data.success) {
                console.log("Restock history exported successfully");
            }
        } catch (error) {
            console.error("Error exporting restock history:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const isExpired = (product: Product) => {
        if (!product.expirationDate) return false;
        const expirationDate = new Date(product.expirationDate);
        return expirationDate < new Date();
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Uncategorized";
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : "Uncategorized";
    };

    // Filter products based on search term and category selections
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

        const category = categories.find((c) => c.id === product.categoryId);
        const matchesCategory =
            selectedParentCategory === "all" ||
            (category?.parentId
                ? category.parentId.toString() === selectedParentCategory
                : category?.id.toString() === selectedParentCategory);

        const matchesSubcategory =
            selectedSubcategory === "all" ||
            product.categoryId?.toString() === selectedSubcategory;

        return matchesSearch && matchesCategory && matchesSubcategory;
    });

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <ProductSummary products={products} />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, code, or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select
                        value={selectedParentCategory}
                        onValueChange={(value) => {
                            setSelectedParentCategory(value);
                            setSelectedSubcategory("all");
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
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

                    {subcategories.length > 0 && (
                        <Select
                            value={selectedSubcategory}
                            onValueChange={setSelectedSubcategory}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Subcategories
                                </SelectItem>
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
                    )}
                </div>

                <div
                    className={`${
                        options.type === "inventory" ? "hidden" : ""
                    } flex gap-4 items-center`}
                >
                    <Button
                        variant="outline"
                        onClick={handleExportRestock}
                        className="flex items-center gap-2"
                        disabled={isActionLoading}
                    >
                        <FileDown className="h-4 w-4" />
                        Export Restock History
                    </Button>
                    <Button onClick={handleCreate} disabled={isActionLoading}>
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Buy Price</TableHead>
                            <TableHead>Sell Price</TableHead>
                            <TableHead>Expiration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading || isActionLoading ? (
                            <TableLoading columns={11} />
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={11}
                                    className="text-center py-4"
                                >
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.imageUrl ? (
                                            <div className="relative w-12 h-12">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.code}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        {product.brand || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {getCategoryName(product.categoryId)}
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        PHP{product.buyPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        PHP{product.sellPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {product.expirationDate ? (
                                            <span
                                                className={
                                                    isExpired(product)
                                                        ? "text-red-500"
                                                        : ""
                                                }
                                            >
                                                {formatDateToPH(
                                                    product.expirationDate,
                                                    "MMM dd, yyyy"
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                N/A
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isExpired(product) ? (
                                            <span className="text-red-500 flex items-center gap-1">
                                                <AlertTriangle className="h-4 w-4" />
                                                Expired
                                            </span>
                                        ) : product.stock <=
                                          (product.lowStockLevel || 0) ? (
                                            <span className="text-amber-500">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="text-green-500">
                                                In Stock
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleView(product)
                                                }
                                                disabled={isActionLoading}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                className={`${
                                                    options.type === "inventory"
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRestock(product)
                                                }
                                                disabled={isActionLoading}
                                            >
                                                <PackagePlus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                className={`${
                                                    options.type === "inventory"
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                disabled={isActionLoading}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                className={`${
                                                    options.type === "inventory"
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                disabled={isActionLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProductForm
                open={openDialog}
                onOpenChange={setOpenDialog}
                onSubmit={handleSubmit}
                initialData={editingProduct}
                mode={mode}
                isLoading={isActionLoading}
            />

            <RestockForm
                open={openRestockDialog}
                onOpenChange={setOpenRestockDialog}
                onSubmit={handleRestockSubmit}
                product={restockingProduct}
                isLoading={isActionLoading}
            />

            {viewingProduct && (
                <ProductViewDialog
                    open={!!viewingProduct}
                    onOpenChange={(open) => !open && setViewingProduct(null)}
                    product={viewingProduct}
                    categoryName={getCategoryName(viewingProduct.categoryId)}
                />
            )}
        </div>
    );
}
