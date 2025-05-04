import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { db } from "@/lib/db";
import { orders, products, transactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: any }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactionId = parseInt(params.id);

    // Get transaction details
    const transactionData = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.clerkId, userId)
        )
      )
      .limit(1);

    if (!transactionData.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Get order items with product details
    const orderItems = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        quantity: orders.quantity,
        refundedQuantity: orders.refundedQuantity,
        refundStatus: orders.refundStatus,
        transactionId: orders.transactionId,
        productName: products.name,
        productSellPrice: products.sellPrice,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(
        and(eq(orders.transactionId, transactionId), eq(orders.clerkId, userId))
      );

    // Format the response
    const refundableItems = orderItems.map((item) => ({
      orderId: item.id,
      productId: item.productId,
      productName: item.productName,
      originalQuantity: item.quantity,
      refundedQuantity: item.refundedQuantity || 0,
      availableQuantity: item.quantity - (item.refundedQuantity || 0),
      quantityToRefund: 0,
      unitPrice: item.productSellPrice,
      totalRefund: 0,
      refundStatus: item.refundStatus || "none",
    }));

    return NextResponse.json({
      transaction: transactionData[0],
      items: refundableItems,
    });
  } catch (error) {
    console.error("Error fetching refundable items:", error);
    return NextResponse.json(
      { error: "Failed to fetch refundable items" },
      { status: 500 }
    );
  }
}
