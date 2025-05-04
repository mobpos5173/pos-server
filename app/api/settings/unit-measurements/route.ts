import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { getUnitMeasurements, createUnitMeasurement } from "@/lib/api/settings";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const measurements = await getUnitMeasurements(userId);
        return NextResponse.json(measurements);
    } catch (error) {
        console.error("Error fetching unit measurements:", error);
        return NextResponse.json(
            { error: "Failed to fetch unit measurements" },
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
        const newMeasurement = await createUnitMeasurement(body, userId);
        return NextResponse.json(newMeasurement);
    } catch (error) {
        console.error("Error creating unit measurement:", error);
        return NextResponse.json(
            { error: "Failed to create unit measurement" },
            { status: 500 }
        );
    }
}
