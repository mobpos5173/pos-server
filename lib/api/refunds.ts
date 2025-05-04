import { db } from "@/lib/db";
import {
    refunds,
    refundItems,
    orders,
    products,
    transactions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { RefundFormData } from "@/types";

export async function createRefund(data: RefundFormData, userId: string) {
    try {
        // Start a transaction to ensure all operations succeed or fail together
        return await db.transaction(async (tx) => {
            const date = new Date();
            const phDate = new Date(
                date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
            );
            const dateOfRefund = `${phDate.getFullYear()}-${String(
                phDate.getMonth() + 1
            ).padStart(2, "0")}-${String(phDate.getDate()).padStart(
                2,
                "0"
            )} ${String(phDate.getHours()).padStart(2, "0")}:${String(
                phDate.getMinutes()
            ).padStart(2, "0")}:${String(phDate.getSeconds()).padStart(
                2,
                "0"
            )}`;

            // 1. Create the refund record
            const newRefund = await tx.insert(refunds).values({
                transactionId: data.transactionId,
                dateOfRefund,
                totalAmount: data.totalAmount,
                reason: data.reason,
                type: data.type,
                clerkId: userId,
            });

            const refundId = parseInt(
                newRefund.lastInsertRowid?.toString() ?? "0"
            );

            // 2. Process each refund item
            for (const item of data.items) {
                if (item.quantityToRefund <= 0) continue;

                // Update order refund status
                const order = await tx
                    .select()
                    .from(orders)
                    .where(eq(orders.id, item.orderId))
                    .then((rows) => rows[0]);

                if (!order) {
                    throw new Error(`Order ${item.orderId} not found`);
                }

                const newRefundedQuantity =
                    (order.refundedQuantity || 0) + item.quantityToRefund;
                let refundStatus = "partial";

                if (newRefundedQuantity >= order.quantity) {
                    refundStatus = "full";
                }

                await tx
                    .update(orders)
                    .set({
                        refundedQuantity: newRefundedQuantity,
                        refundStatus,
                    })
                    .where(eq(orders.id, item.orderId));

                // Create refund item record
                await tx.insert(refundItems).values({
                    refundId,
                    orderId: item.orderId,
                    productId: item.productId,
                    quantity: item.quantityToRefund,
                    amount: item.quantityToRefund * item.unitPrice,
                    clerkId: userId,
                });

                // Update product stock
                const product = await tx
                    .select()
                    .from(products)
                    .where(eq(products.id, item.productId))
                    .then((rows) => rows[0]);

                if (product) {
                    await tx
                        .update(products)
                        .set({
                            stock: product.stock + item.quantityToRefund,
                        })
                        .where(eq(products.id, item.productId));
                }
            }

            // 3. Update transaction status to refunded
            if (data.type === "full") {
                // For full refunds, set the transaction status to refunded
                await tx
                    .update(transactions)
                    .set({
                        status: "refunded",
                    })
                    .where(eq(transactions.id, data.transactionId));
            } else {
                // For partial refunds, check if all items are fully refunded
                const allOrders = await tx
                    .select()
                    .from(orders)
                    .where(eq(orders.transactionId, data.transactionId));

                const allFullyRefunded = allOrders.every(
                    (order) =>
                        order.refundStatus === "full" ||
                        (order.refundedQuantity &&
                            order.refundedQuantity >= order.quantity)
                );

                if (allFullyRefunded) {
                    await tx
                        .update(transactions)
                        .set({
                            status: "refunded",
                        })
                        .where(eq(transactions.id, data.transactionId));
                } else {
                    // If not all items are fully refunded, set status to partially_refunded
                    await tx
                        .update(transactions)
                        .set({
                            status: "partially_refunded",
                        })
                        .where(eq(transactions.id, data.transactionId));
                }
            }

            return { success: true, refundId };
        });
    } catch (error) {
        console.error("Error creating refund:", error);
        throw error;
    }
}

export async function getRefunds(userId: string) {
    return db
        .select()
        .from(refunds)
        .where(eq(refunds.clerkId, userId))
        .orderBy(refunds.dateOfRefund);
}

export async function getRefundById(refundId: number, userId: string) {
    const refundData = await db
        .select()
        .from(refunds)
        .where(and(eq(refunds.id, refundId), eq(refunds.clerkId, userId)))
        .limit(1);

    if (!refundData.length) {
        return null;
    }

    const refundItemsData = await db
        .select({
            id: refundItems.id,
            refundId: refundItems.refundId,
            orderId: refundItems.orderId,
            productId: refundItems.productId,
            quantity: refundItems.quantity,
            amount: refundItems.amount,
            productName: products.name,
        })
        .from(refundItems)
        .leftJoin(products, eq(refundItems.productId, products.id))
        .where(eq(refundItems.refundId, refundId));

    return {
        ...refundData[0],
        items: refundItemsData,
    };
}

export async function getRefundsByTransactionId(
    transactionId: number,
    userId: string
) {
    return db
        .select()
        .from(refunds)
        .where(
            and(
                eq(refunds.transactionId, transactionId),
                eq(refunds.clerkId, userId)
            )
        )
        .orderBy(refunds.dateOfRefund);
}
