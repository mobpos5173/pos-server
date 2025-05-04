"use client";

import { useAuth } from "@clerk/nextjs";
import ProductList from "@/components/products/ProductList";

export default function ProductsPage() {
    const { userId } = useAuth();

    if (!userId) {
        return <div>Please sign in to view products</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products</h1>
                {/* Add New Product button can be added here */}
            </div>
            <ProductList options={{ type: "products" }} />
        </div>
    );
}
