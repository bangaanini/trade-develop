import "dotenv/config";
import { db } from "@/lib/db";

async function run() {
  try {
    console.log("Creating user_win_rates table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_win_rates (
        user_id UUID PRIMARY KEY,
        win_rate INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Success!");
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

run();
