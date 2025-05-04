import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import {
    updateUnitMeasurement,
    deleteUnitMeasurement,
} from "@/lib/api/unit-measurements";

export async function PUT(request: Request, { params }: { params: any }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const updatedMeasurement = await updateUnitMeasurement(
            parseInt(params.id),
            body,
            userId
        );

        if (!updatedMeasurement.length) {
            return NextResponse.json(
                { error: "Unit measurement not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedMeasurement[0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to update unit measurement" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: any) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deleteUnitMeasurement(parseInt(params.id), userId);

        if (!result) {
            return NextResponse.json(
                { error: "Unit measurement not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to delete unit measurement" },
            { status: 500 }
        );
    }
}
