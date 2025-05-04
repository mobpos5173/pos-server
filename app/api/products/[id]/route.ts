import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
import { getCurrentUserId } from "@/lib/api/base";
import { updateProduct, deleteProduct } from "@/lib/api/products";

export async function PUT(request: Request, { params }: { params: any }) {
    // const { userId } = auth();
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const updatedProduct = await updateProduct(
            parseInt(params.id),
            body,
            userId
        );

        if (!updatedProduct.length) {
            return NextResponse.json(
                { error: "Product not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: any }) {
    // const { userId } = auth();
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deleteProduct(parseInt(params.id), userId);

        if (!result) {
            return NextResponse.json(
                { error: "Product not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
