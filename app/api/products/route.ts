import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/api/products";
import { getCurrentUserId } from "@/lib/api/base";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const productsList = await getProducts(userId);
        return NextResponse.json(productsList);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('si >', body);
        const newProduct = await createProduct(body, userId);
        return NextResponse.json(newProduct);
    } catch (error) {
        console.error("Error create products:", error);
        return NextResponse.json(
            { error: "Failed to create product"},
            { status: 500 }
        );
    }
}