import "dotenv/config";
import { settleOptions } from "@/worker/settleOption";
import { startPriceFeed } from "@/worker/priceFeed";
import { settleSpotLimitOrders } from "@/worker/settleSpotLimit";
import { db } from "@/lib/db";

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_win_rates (
        user_id UUID PRIMARY KEY,
        win_rate INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create registration info table to avoid altering users table (permissions issue)
    // removed foreign key because users.id might not be unique/pk in this specific db instance
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_registration_info (
        user_id UUID PRIMARY KEY,
        ip_address VARCHAR(50),
        device_info TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database initialized (schema check)");
  } catch (e) {
    console.error("❌ Database initialization failed:", e);
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 Trading Worker Started");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚙️  Configuration:");
console.log("   - Settlement Interval: 1 second");
console.log("   - Price Feed: Binance WebSocket (auto-reconnect)");
console.log("   - Environment: Production-Safe VPS Mode");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Start price feed WebSocket
// Start price feed WebSocket
startPriceFeed();

// Initialize DB then start worker
init().then(() => {
  // Settlement worker - runs every 1 second
  setInterval(async () => {
    try {
      await settleOptions();
      await settleSpotLimitOrders();
    } catch (e) {
      console.error("⚠️  Worker error:", e);
    }
  }, 1000); // 1 second
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down worker gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down worker gracefully...");
  process.exit(0);
});
