import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { getRefundById } from "@/lib/api/refunds";

export async function GET(request: Request, { params }: { params: any }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const refund = await getRefundById(parseInt(params.id), userId);

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    return NextResponse.json(refund);
  } catch (error) {
    console.error("Error fetching refund:", error);
    return NextResponse.json(
      { error: "Failed to fetch refund" },
      { status: 500 }
    );
  }
}
