import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function initialSetup() {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT,
      filepath TEXT,
      mimetype TEXT
    );
  `);

    await db.run(sql`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY,
      name TEXT
    );`);

    await db.run(sql` CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT,
      password TEXT,
      token TEXT,
      profile_picture TEXT REFERENCES files(id)
    );`);
}
