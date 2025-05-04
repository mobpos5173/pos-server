import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function transactionsSetup() {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      payment_method_id INTEGER REFERENCES payments(id),
      date_of_transaction TIMESTAMP NOT NULL,
      email_to TEXT,
      cash_received DECIMAL(10, 2),
      total_price DECIMAL(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);

    await db.run(sql`
     CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      transaction_id INTEGER REFERENCES transactions(id)
    );
  `);

    await db.run(sql` 
    CREATE TABLE IF NOT EXISTS transactions_history (
      id INTEGER PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      transaction_id INTEGER REFERENCES transactions(id)
    );
  `);
}
