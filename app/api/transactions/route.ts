import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { getTransactions, createTransaction } from "@/lib/api/transactions";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactionsList = await getTransactions(userId);
        return NextResponse.json(transactionsList);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
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
        const { items, ...transactionData } = body;

        // Validate reference number for GCash payments
        const isGcash =
            transactionData.payment_method_id &&
            (await isGcashPaymentMethod(
                parseInt(transactionData.payment_method_id),
                userId
            ));

        if (isGcash && !transactionData.reference_number) {
            return NextResponse.json(
                { error: "Reference number is required for GCash payments" },
                { status: 400 }
            );
        }

        const newTransaction = await createTransaction(
            transactionData,
            items,
            userId
        );
        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}

// Helper function to check if a payment method is GCash
async function isGcashPaymentMethod(
    paymentMethodId: number,
    userId: string
): Promise<boolean> {
    try {
        const { db } = await import("@/lib/db");
        const { payments } = await import("@/lib/db/schema");
        const { eq, and } = await import("drizzle-orm");

        const paymentMethod = await db
            .select()
            .from(payments)
            .where(
                and(
                    eq(payments.id, paymentMethodId),
                    eq(payments.clerkId, userId)
                )
            )
            .limit(1);

        return (
            paymentMethod.length > 0 &&
            paymentMethod[0]?.name?.toLowerCase() === "gcash"
        );
    } catch (error) {
        console.error("Error checking payment method:", error);
        return false;
    }
}
