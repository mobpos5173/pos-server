import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { db } from "@/lib/db";
import { products, restockHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request, { params }: any) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { quantity, expirationDate, notes } = body;

        // Get current product details
        const product = await db
            .select()
            .from(products)
            .where(
                and(
                    eq(products.id, parseInt(params.id)),
                    eq(products.clerkId, userId)
                )
            )
            .limit(1);

        if (!product.length) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const currentProduct = product[0];
        const newStock = currentProduct.stock + quantity;

        // Get current timestamp
        const date = new Date();
        const phDate = new Date(
            date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );
        const dateOfRestock = `${phDate.getFullYear()}-${String(
            phDate.getMonth() + 1
        ).padStart(2, "0")}-${String(phDate.getDate()).padStart(
            2,
            "0"
        )} ${String(phDate.getHours()).padStart(2, "0")}:${String(
            phDate.getMinutes()
        ).padStart(2, "0")}:${String(phDate.getSeconds()).padStart(2, "0")}`;

        // Start a transaction
        await db.transaction(async (tx) => {
            // Update product stock and expiration date
            await tx
                .update(products)
                .set({
                    stock: newStock,
                    expirationDate:
                        expirationDate || currentProduct.expirationDate,
                })
                .where(eq(products.id, parseInt(params.id)));

            // Create restock history record
            await tx.insert(restockHistory).values({
                productId: parseInt(params.id),
                quantity,
                previousStock: currentProduct.stock,
                newStock,
                previousExpirationDate: currentProduct.expirationDate,
                newExpirationDate:
                    expirationDate || currentProduct.expirationDate,
                dateOfRestock,
                notes,
                clerkId: userId,
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error restocking product:", error);
        return NextResponse.json(
            { error: "Failed to restock product" },
            { status: 500 }
        );
    }
}
