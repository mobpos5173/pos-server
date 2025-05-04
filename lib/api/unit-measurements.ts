import { db } from "@/lib/db";
import { unitMeasurements } from "@/lib/db/schema";
import { UnitMeasurement } from "@/types";
import { eq, and } from "drizzle-orm";

export async function getUnitMeasurements(userId: string) {
    return db
        .select()
        .from(unitMeasurements)
        .where(eq(unitMeasurements.clerkId, userId));
}

export async function createUnitMeasurement(
    data: UnitMeasurement,
    userId: string
) {
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
