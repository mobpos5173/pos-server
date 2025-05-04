import { db } from "@/lib/db";
import { productCategories } from "@/lib/db/schema";
import { Category } from "@/types";
import { eq, and, isNull, inArray } from "drizzle-orm";

export async function getCategories(userId: string) {
    return db
        .select()
        .from(productCategories)
        .where(
            and(
                eq(productCategories.clerkId, userId),
                isNull(productCategories.deleted)
            )
        );
}

export async function createCategory(data: Category, userId: string) {
    return db.insert(productCategories).values({
        ...data,
        clerkId: userId,
    });
}

export async function updateCategory(
    id: number,
    data: Category,
    userId: string
) {
    return db
        .update(productCategories)
        .set(data)
        .where(
            and(
                eq(productCategories.id, id),
                eq(productCategories.clerkId, userId)
            )
        )
        .returning();
}

export async function deleteCategory(id: number, userId: string) {
    const date = new Date();
    const phDate = new Date(
        date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    const dateDeleted = `${phDate.getFullYear()}-${String(
        phDate.getMonth() + 1
    ).padStart(2, "0")}-${String(phDate.getDate()).padStart(2, "0")} ${String(
        phDate.getHours()
    ).padStart(2, "0")}:${String(phDate.getMinutes()).padStart(
        2,
        "0"
    )}:${String(phDate.getSeconds()).padStart(2, "0")}`;

    const getAllChildIds = async (parentId: number): Promise<number[]> => {
        const children = await db
            .select()
            .from(productCategories)
            .where(
                and(
                    eq(productCategories.parentId, parentId),
                    eq(productCategories.clerkId, userId),
                    isNull(productCategories.deleted)
                )
            );

        const childIds = [parentId];
        for (const child of children) {
            const descendantIds = await getAllChildIds(child.id);
            childIds.push(...descendantIds);
        }
        return childIds;
    };

    // Get all category IDs to delete
    const categoryIds = await getAllChildIds(id);

    // Delete all categories in the hierarchy
    return db
        .update(productCategories)
        .set({
            deleted: dateDeleted,
        })
        .where(
            and(
                inArray(productCategories.id, categoryIds),
                eq(productCategories.clerkId, userId)
            )
        );
}
