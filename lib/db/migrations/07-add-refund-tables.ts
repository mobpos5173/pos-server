import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addRefundTables() {
  try {
    // Check if refunded_quantity column exists
    const refundedQuantityExists = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('orders')
            WHERE name = 'refunded_quantity'
        `);

    // Check if refund_status column exists
    const refundStatusExists = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('orders')
            WHERE name = 'refund_status'
        `);

    // Add refunded_quantity column if it doesn't exist
    if (!refundedQuantityExists || refundedQuantityExists.count === 0) {
      await db.run(sql`
                ALTER TABLE orders
                ADD COLUMN refunded_quantity INTEGER DEFAULT 0
            `);
      console.log(`✓ Added refunded_quantity column to orders table`);
    } else {
      console.log(`✗ refunded_quantity column already exists in orders table`);
    }

    // Add refund_status column if it doesn't exist
    if (!refundStatusExists || refundStatusExists.count === 0) {
      await db.run(sql`
                ALTER TABLE orders
                ADD COLUMN refund_status TEXT DEFAULT 'none'
            `);
      console.log(`✓ Added refund_status column to orders table`);
    } else {
      console.log(`✗ refund_status column already exists in orders table`);
    }

    // Create refunds table
    await db.run(sql`
            CREATE TABLE IF NOT EXISTS refunds (
                id INTEGER PRIMARY KEY,
                transaction_id INTEGER REFERENCES transactions(id),
                date_of_refund TEXT NOT NULL,
                total_amount REAL NOT NULL,
                reason TEXT,
                type TEXT NOT NULL,
                clerk_id TEXT NOT NULL
            )
        `);
    console.log(`✓ Created refunds table`);

    // Create refund_items table
    await db.run(sql`
            CREATE TABLE IF NOT EXISTS refund_items (
                id INTEGER PRIMARY KEY,
                refund_id INTEGER REFERENCES refunds(id),
                order_id INTEGER REFERENCES orders(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                amount REAL NOT NULL,
                clerk_id TEXT NOT NULL
            )
        `);
    console.log(`✓ Created refund_items table`);
  } catch (error) {
    console.error("Failed to add refund tables:", error);
    throw error;
  }
}
