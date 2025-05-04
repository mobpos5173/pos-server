import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { createRefund, getRefunds } from "@/lib/api/refunds";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const refundsList = await getRefunds(userId);
    return NextResponse.json(refundsList);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
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
    const result = await createRefund(body, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating refund:", error);
    return NextResponse.json(
      { error: "Failed to create refund" },
      { status: 500 }
    );
  }
}
