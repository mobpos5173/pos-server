import { useCallback, useEffect, useState } from "react";
import { Product } from "@/types";

// interface Product {
//     id: number;
//     name: string;
//     code: string;
//     description: string | null;
//     image: string | null;
//     buyPrice: number;
//     sellPrice: number;
//     stock: number;
//     lowStockLevel: number | null;
//     expirationDate: string | null;
//     unitMeasurementsId: number | null;
//     clerkId: string;
// }

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch products"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = useCallback(
        async (product: Omit<Product, "id">) => {
            try {
                const response = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(product),
                });
                if (!response.ok) {
                    throw new Error("Failed to create product");
                }
                await fetchProducts();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to create product"
                );
            }
        },
        [fetchProducts]
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        createProduct,
        refreshProducts: fetchProducts,
    };
}
