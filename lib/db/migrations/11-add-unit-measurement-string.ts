import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addUnitMeasurementString() {
    try {
        // Check if the column already exists
        const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('products')
            WHERE name = 'unit_measurement';
        `);

        const columnExists = columnExistsResult?.count ?? 0;

        if (columnExists === 0) {
            // Add the column if it doesn't exist
            await db.run(sql`
                ALTER TABLE products
                ADD COLUMN unit_measurement TEXT
            `);

            console.log(`✓ Added unit_measurement column to products table`);
        } else {
            console.log(
                `✗ unit_measurement column already exists in products table`
            );
        }
    } catch (error) {
        console.error("Failed to add unit_measurement column:", error);
        throw error;
    }
}
