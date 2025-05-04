import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addCategoryIdToProducts() {
  try {
    // Check if the column already exists
    const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('products')
            WHERE name = 'category_id';
        `);

    const columnExists = columnExistsResult?.count ?? 0;

    if (columnExists === 0) {
      // Add the column if it doesn't exist
      await db.run(sql`
                ALTER TABLE products
                ADD COLUMN category_id INTEGER REFERENCES product_categories(id)
            `);

      console.log(`✓ Added category_id column to products table`);
    } else {
      console.log(`✗ category_id column already exists in products table`);
    }
  } catch (error) {
    console.error("Failed to add category_id column:", error);
    throw error;
  }
}
