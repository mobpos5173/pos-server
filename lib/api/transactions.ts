import { db } from "@/lib/db";
import {
    transactions,
    orders,
    payments,
    products,
    refunds,
} from "@/lib/db/schema";
import { eq, sql, getTableColumns, and } from "drizzle-orm";

type TransactionFromApp = {
    id: number;
    date_of_transaction: string;
    total_price: string;
    payment_method_id: string;
    status: string;
    cash_received: string;
    email_to?: string;
    clerk_id?: string;
    reference_number?: string;
};

type TransactionItemFromApp = {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    clerk_id: string;
};

export async function getTransactions(userId: string) {
    return db
        .select({
            ...getTableColumns(transactions),
            items: sql`(
                SELECT json_group_array(json_object(
                    'id', ${orders.id},
                    'productId', ${products.id},
                    'productName', ${products.name},
                    'productSellPrice', ${products.sellPrice},
                    'productBuyPrice', ${products.buyPrice},
                    'quantity', ${orders.quantity}
                ))
                FROM ${orders}
                JOIN ${products} ON ${orders.productId} = ${products.id}
                WHERE ${orders.transactionId} = ${transactions.id}
            )`.as("items"),
            refundedItems: sql`(
                SELECT json_group_array(json_object(
                    'id', ${refunds.id},
                    'productId', ri.product_id,
                    'productName', ${products.name},
                    'quantity', ri.quantity,
                    'amount', ri.amount,
                    'reason', ${refunds.reason}
                ))
                FROM ${refunds}
                LEFT JOIN refund_items ri ON ${refunds.id} = ri.refund_id
                LEFT JOIN ${products} ON ri.product_id = ${products.id}
                WHERE ${refunds.transactionId} = ${transactions.id}
                GROUP BY ${refunds.transactionId}
            )`.as("refundedItems"),
            paymentMethodName: payments.name,
            totalRefund: sql`(
                SELECT COALESCE(SUM(${refunds.totalAmount}), 0)
                FROM ${refunds}
                WHERE ${refunds.transactionId} = ${transactions.id}
            )`.as("totalRefund"),
            refundReasons: sql`(
                SELECT GROUP_CONCAT(${refunds.reason}, '; ')
                FROM ${refunds}
                WHERE ${refunds.transactionId} = ${transactions.id}
                AND ${refunds.reason} IS NOT NULL
            )`.as("refundReasons"),
            totalCost: sql`(
                SELECT COALESCE(SUM(${products.buyPrice} * ${orders.quantity}), 0)
                FROM ${orders}
                JOIN ${products} ON ${orders.productId} = ${products.id}
                WHERE ${orders.transactionId} = ${transactions.id}
            )`.as("totalCost"),
        })
        .from(transactions)
        .leftJoin(payments, eq(transactions.paymentMethodId, payments.id))
        .where(eq(transactions.clerkId, userId));
}

export async function createTransaction(
    data: TransactionFromApp,
    items: TransactionItemFromApp[],
    userId: string
) {
    try {
        const date = new Date(data.date_of_transaction);
        const phDate = new Date(
            date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );

        const dateOfTransaction = `${phDate.getFullYear()}-${String(
            phDate.getMonth() + 1
        ).padStart(2, "0")}-${String(phDate.getDate()).padStart(
            2,
            "0"
        )} ${String(phDate.getHours()).padStart(2, "0")}:${String(
            phDate.getMinutes()
        ).padStart(2, "0")}:${String(phDate.getSeconds()).padStart(2, "0")}`;

        // Start a transaction to ensure all operations succeed or fail together
        await db.transaction(async (tx) => {
            // 1. Create the transaction record
            const insertData = {
                ...data,
                paymentMethodId: parseInt(data.payment_method_id),
                dateOfTransaction: dateOfTransaction,
                emailTo: data.email_to ?? null,
                totalPrice: parseFloat(data.total_price),
                cashReceived: parseFloat(data.cash_received),
                referenceNumber: data.reference_number ?? null,
                clerkId: userId,
            };

            const newTransaction = await tx
                .insert(transactions)
                .values(insertData);
            const transactionId = parseInt(
                newTransaction.lastInsertRowid?.toString() ?? ""
            );

            // 2. Process each item
            for (const item of items) {
                // First get the current product to check stock
                const [product] = await tx
                    .select()
                    .from(products)
                    .where(eq(products.id, item.product_id));

                if (!product) {
                    throw new Error(`Product ${item.product_id} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                    );
                }

                // Update product stock
                await tx
                    .update(products)
                    .set({
                        stock: product.stock - item.quantity,
                    })
                    .where(eq(products.id, item.product_id));

                // Create order record
                await tx.insert(orders).values({
                    transactionId,
                    clerkId: userId,
                    productId: item.product_id,
                    quantity: item.quantity,
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}

export async function updateTransaction(id: number, data: any, userId: string) {
    return db
        .update(transactions)
        .set(data)
        .where(and(eq(transactions.id, id), eq(transactions.clerkId, userId)))
        .returning();
}
