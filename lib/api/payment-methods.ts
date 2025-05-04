import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { PaymentMethod } from "@/types";
import { eq, and } from "drizzle-orm";

export async function getPaymentMethods(userId: string) {
    return db.select().from(payments).where(eq(payments.clerkId, userId));
}

export async function createPaymentMethod(data: PaymentMethod, userId: string) {
    return db.insert(payments).values({
        ...data,
        clerkId: userId,
    });
}

export async function updatePaymentMethod(
    id: number,
    data: PaymentMethod,
    userId: string
) {
    return db
        .update(payments)
        .set(data)
        .where(and(eq(payments.id, id), eq(payments.clerkId, userId)))
        .returning();
}

export async function deletePaymentMethod(id: number, userId: string) {
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

    return db
        .update(payments)
        .set({
            deleted: dateDeleted,
        })
        .where(and(eq(payments.id, id), eq(payments.clerkId, userId)));
}
