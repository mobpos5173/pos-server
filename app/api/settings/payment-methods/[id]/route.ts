import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
    updatePaymentMethod,
    deletePaymentMethod,
} from "@/lib/api/payment-methods";

export async function PUT(request: Request, { params }: { params: any }) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const updatedMethod = await updatePaymentMethod(
            parseInt(params.id),
            body,
            userId
        );

        if (!updatedMethod.length) {
            return NextResponse.json(
                { error: "Payment method not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedMethod[0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to update payment method" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: any) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deletePaymentMethod(parseInt(params.id), userId);

        if (!result) {
            return NextResponse.json(
                { error: "Payment method not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to delete payment method" },
            { status: 500 }
        );
    }
}
