import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addCategoryParentId() {
    try {
        // Check if the column already exists
        const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('product_categories')
            WHERE name = 'parent_id';
        `);

        const columnExists = columnExistsResult?.count ?? 0;

        if (columnExists === 0) {
            // Add the column if it doesn't exist
            await db.run(sql`
                ALTER TABLE product_categories
                ADD COLUMN parent_id INTEGER REFERENCES product_categories(id)
            `);

            console.log(`✓ Added parent_id column to product_categories table`);
        } else {
            console.log(
                `✗ parent_id column already exists in product_categories table`
            );
        }
    } catch (error) {
        console.error("Failed to add parent_id column:", error);
        throw error;
    }
}
