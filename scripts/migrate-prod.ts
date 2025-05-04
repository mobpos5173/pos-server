import { runMigrations } from "@/lib/db/migrations";

// Ensure we're in production
if (process.env.NODE_ENV !== "production") {
    console.log("This script should only be run in production!");
    process.exit(1);
}

// Run migrations
async function migrate() {
    try {
        console.log("Running production migrations...");
        await runMigrations();
        console.log("Production migrations completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Production migration failed:", error);
        process.exit(1);
    }
}

migrate();
