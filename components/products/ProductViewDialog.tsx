import { Product } from "@/types";
import { ViewDialog, ViewField } from "@/components/ui/view-dialog";
import { format } from "date-fns";
import Image from "next/image";
import { Package } from "lucide-react";

interface ProductViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    categoryName?: string;
}

export function ProductViewDialog({
    open,
    onOpenChange,
    product,
    categoryName,
}: ProductViewDialogProps) {
    return (
        <ViewDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Product Details"
            description={`Details for ${product.name}`}
        >
            {product.imageUrl ? (
                <div className="relative w-full aspect-video">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain rounded-md"
                    />
                </div>
            ) : (
                <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <ViewField label="Name" value={product.name} />
                <ViewField label="Code" value={product.code} />
                <ViewField label="Brand" value={product.brand} />
                <ViewField
                    label="Category"
                    value={categoryName || "Uncategorized"}
                />
                <ViewField label="Stock" value={product.stock} />
                <ViewField
                    label="Buy Price"
                    value={`PHP ${product.buyPrice.toFixed(2)}`}
                />
                <ViewField
                    label="Sell Price"
                    value={`PHP ${product.sellPrice.toFixed(2)}`}
                />
                <ViewField
                    label="Low Stock Level"
                    value={product.lowStockLevel}
                />
                <ViewField
                    label="Expiration Date"
                    value={
                        product.expirationDate
                            ? format(
                                  new Date(product.expirationDate),
                                  "MMM dd, yyyy"
                              )
                            : null
                    }
                />
                <ViewField
                    label="Description"
                    value={product.description}
                    className="col-span-2"
                />
            </div>
        </ViewDialog>
    );
}
