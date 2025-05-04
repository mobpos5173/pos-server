import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addReferenceNumberToTransactions() {
    try {
        // Check if the column already exists
        const columnExistsResult = await db.get<{ count: number }>(sql`
      SELECT COUNT(*) as count
      FROM pragma_table_info('transactions')
      WHERE name = 'reference_number';
    `);

        const columnExists = columnExistsResult?.count ?? 0;

        if (columnExists === 0) {
            // Add the column if it doesn't exist
            await db.run(sql`
        ALTER TABLE transactions
        ADD COLUMN reference_number TEXT
      `);

            console.log(
                `✓ Added reference_number column to transactions table`
            );
        } else {
            console.log(
                `✗ reference_number column already exists in transactions table`
            );
        }
    } catch (error) {
        console.error("Failed to add reference_number column:", error);
        throw error;
    }
}
