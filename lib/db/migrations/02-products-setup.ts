import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function productsSetup() {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS unit_measurements (
      id INTEGER PRIMARY KEY,
      name TEXT,
      description TEXT
    );

  `);

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY,
      name TEXT,
      description TEXT
    );
  `);

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      image TEXT REFERENCES files(id),
      buy_price DECIMAL(10, 2) NOT NULL,
      sell_price DECIMAL(10, 2) NOT NULL,
      stock INTEGER NOT NULL,
      low_stock_level INTEGER,
      expiration_date TIMESTAMP,
      unit_measurements_id INTEGER REFERENCES unit_measurements(id)
    );
  `);
}
