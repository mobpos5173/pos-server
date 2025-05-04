import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { getPaymentMethods, createPaymentMethod } from "@/lib/api/settings";


export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const methods = await getPaymentMethods(userId);
        return NextResponse.json(methods);
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment methods" },
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
        const newMethod = await createPaymentMethod(body, userId);
        return NextResponse.json(newMethod);
    } catch (error) {
        console.error("Error creating payment method:", error);
        return NextResponse.json(
            { error: "Failed to create payment method" },
            { status: 500 }
        );
    }
}
