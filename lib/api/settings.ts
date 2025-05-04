import { db } from "@/lib/db";
import { unitMeasurements, payments } from "@/lib/db/schema";
import { PaymentMethod, UnitMeasurement } from "@/types";
import { eq, and, isNull } from "drizzle-orm";

// Unit Measurements
export async function getUnitMeasurements(userId: string) {
    return db
        .select()
        .from(unitMeasurements)
        .where(eq(unitMeasurements.clerkId, userId));
}

export async function createUnitMeasurement(data: UnitMeasurement, userId: string) {
    return db.insert(unitMeasurements).values({
        ...data,
        clerkId: userId,
    });
}

export async function updateUnitMeasurement(
    id: number,
    data: UnitMeasurement,
    userId: string
) {
    return db
        .update(unitMeasurements)
        .set(data)
        .where(
            and(
                eq(unitMeasurements.id, id),
                eq(unitMeasurements.clerkId, userId)
            )
        )
        .returning();
}

export async function deleteUnitMeasurement(id: number, userId: string) {
    return db
        .delete(unitMeasurements)
        .where(
            and(
                eq(unitMeasurements.id, id),
                eq(unitMeasurements.clerkId, userId)
            )
        );
}

// Payment Methods
export async function getPaymentMethods(userId: string) {
    return db.select().from(payments)
    .where(and(eq(payments.clerkId, userId),  isNull(payments.deleted)));
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
    return db
        .delete(payments)
        .where(and(eq(payments.id, id), eq(payments.clerkId, userId)));
}
