import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { exportRestockHistory } from "@/lib/export/restock";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await exportRestockHistory(userId);
        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to export restock history" },
                { status: 500 }
            );
        }

        // Return the buffer as a file download
        return new NextResponse(result.buffer, {
            status: 200,
            headers: {
                "Content-Type": result.contentType,
                "Content-Disposition": `attachment; filename="${result.fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error exporting restock history:", error);
        return NextResponse.json(
            { error: "Failed to export restock history" },
            { status: 500 }
        );
    }
}
