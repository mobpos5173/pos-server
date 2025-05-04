import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function contactsAndSettings() {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS contacts_types (
      id INTEGER PRIMARY KEY,
      name TEXT
    );
  `);

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_contacts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      contact_type_id INTEGER REFERENCES contacts_types(id),
      value TEXT
    );
  `);

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      settings_id INTEGER REFERENCES settings(id)
    );
  `);

    await db.run(sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      name TEXT
    );
  `);
}
