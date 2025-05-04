import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addClerkId() {
    try {
        const tables = [
            "files",
            "payments",
            "users",
            "contacts_types",
            "user_contacts",
            "settings",
            "user_settings",
            "unit_measurements",
            "product_categories",
            "products",
            "transactions",
            "orders",
            "transactions_history",
        ];

        for (const table of tables) {
            // Check if the column already exists
            const columnExists = await db.get<{ count: number }>(sql`
                SELECT COUNT(*) as count
                FROM pragma_table_info(${table})
                WHERE name = 'clerk_id';
            `);

            if (columnExists.count === 0) {
                // Add the column if it doesn't exist
                await db.run(sql`
                    ALTER TABLE ${table}
                    ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
                `);

                // Add unique constraint to users table specifically
                if (table === "users") {
                    await db.run(sql`
                        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
                    `);
                }

                console.log(`✓ Added clerk_id to ${table}`);
            } else {
                console.log(`✗ clerk_id already exists in ${table}`);
            }
        }
    } catch (error) {
        console.error("Failed to add clerk_id columns:", error);
        throw error;
    }
}
