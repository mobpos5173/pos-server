import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { updateTransaction } from "@/lib/api/transactions";

export async function PUT(request: Request, { params }: { params: any }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const updatedTransaction = await updateTransaction(
            parseInt(params.id),
            body,
            userId
        );

        if (!updatedTransaction.length) {
            return NextResponse.json(
                { error: "Transaction not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedTransaction[0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to update transaction" },
            { status: 500 }
        );
    }
}
