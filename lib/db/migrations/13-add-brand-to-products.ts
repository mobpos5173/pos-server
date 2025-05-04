import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addBrandToProducts() {
    try {
        // Check if the column already exists
        const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('products')
            WHERE name = 'brand';
        `);

        const columnExists = columnExistsResult?.count ?? 0;

        if (columnExists === 0) {
            // Add the column if it doesn't exist
            await db.run(sql`
                ALTER TABLE products
                ADD COLUMN brand TEXT
            `);

            console.log(`✓ Added brand column to products table`);
        } else {
            console.log(`✗ brand column already exists in products table`);
        }
    } catch (error) {
        console.error("Failed to add brand column:", error);
        throw error;
    }
}
