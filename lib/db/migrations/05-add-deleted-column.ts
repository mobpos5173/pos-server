import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addDeletedColumn() {
    try {
        const tables = ["products", "product_categories", "payments"];

        for (const table of tables) {
            // Check if the column already exists
            const columnExistsResult = await db.get<{ count: number }>(sql`
                SELECT COUNT(*) as count
                FROM pragma_table_info('${sql.raw(table)}')
                WHERE name = 'deleted';
            `);

            const columnExists = columnExistsResult?.count ?? 0;

            console.log("checkk", table, columnExists, columnExistsResult);

            if (columnExists === 0) {
                // Add the column if it doesn't exist
                await db.run(sql`
                    ALTER TABLE ${sql.raw(table)}
                    ADD COLUMN deleted TIMESTAMP NULL
                `);

                console.log(`✓ Added deleted column to ${table}`);
            } else {
                console.log(`✗ deleted column already exists in ${table}`);
            }
        }
    } catch (error) {
        console.error("Failed to add deleted column:", error);
        throw error;
    }
}
