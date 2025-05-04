import { runMigrations } from "@/lib/db/migrations";

async function migrate() {
    try {
        await runMigrations();
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
