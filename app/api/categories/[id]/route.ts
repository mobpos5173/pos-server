import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { updateCategory, deleteCategory } from "@/lib/api/categories";

export async function PUT(request: Request, { params }: { params: any }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const updatedCategory = await updateCategory(
            parseInt(params.id),
            body,
            userId
        );

        if (!updatedCategory || !Array.isArray(updatedCategory)) {
            return NextResponse.json(
                { error: "Category not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCategory[0]);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: any }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deleteCategory(parseInt(params.id), userId);

        if (!result) {
            return NextResponse.json(
                { error: "Category not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
