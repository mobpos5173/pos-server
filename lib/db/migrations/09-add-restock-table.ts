import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addRestockTable() {
  try {
    // Create restock_history table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS restock_history (
        id INTEGER PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        previous_expiration_date TEXT,
        new_expiration_date TEXT,
        date_of_restock TEXT NOT NULL,
        notes TEXT,
        clerk_id TEXT NOT NULL
      )
    `);
    console.log(`✓ Created restock_history table`);
  } catch (error) {
    console.error("Failed to create restock_history table:", error);
    throw error;
  }
}
