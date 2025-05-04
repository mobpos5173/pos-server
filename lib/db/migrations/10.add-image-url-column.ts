import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addImageUrlToProducts() {
    try {
        // Check if the column already exists
        const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('products')
            WHERE name = 'image_url';
        `);

        const columnExists = columnExistsResult?.count ?? 0;

        if (columnExists === 0) {
            // Add the column if it doesn't exist
            await db.run(sql`
                ALTER TABLE products
                ADD COLUMN image_url TEXT
            `);

            console.log(`✓ Added image_url column to products table`);
        } else {
            console.log(`✗ image_url column already exists in products table`);
        }
    } catch (error) {
        console.error("Failed to add image_url column:", error);
        throw error;
    }
}
