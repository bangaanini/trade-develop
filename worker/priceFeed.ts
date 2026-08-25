import WebSocket from "ws";
import { db } from "@/lib/db";

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
const MAX_RECONNECT_DELAY = 60000; // 60 seconds max
const INITIAL_RECONNECT_DELAY = 5000; // 5 seconds initial

export function startPriceFeed() {
  const symbols = ["btcusdt", "ethusdt", "bnbusdt"];

  function connect() {
    // Clear any existing reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${symbols
        .map(s => `${s}@trade`)
        .join("/")}`
    );

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        const symbol = data.data.s.replace("USDT", "");
        const price = Number(data.data.p);

        await db.query(
          `INSERT INTO price_cache (symbol, price, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (symbol) DO UPDATE
           SET price = EXCLUDED.price,
               updated_at = EXCLUDED.updated_at`,
          [symbol, price, new Date().toISOString()]
        );
        
        // Reset reconnect attempts on successful message
        reconnectAttempts = 0;
      } catch (e) {
        console.error("⚠️  PriceFeed message error:", e);
      }
    });

    ws.on("open", () => {
      console.log("✅ Binance WS connected");
      reconnectAttempts = 0; // Reset on successful connection
    });

    ws.on("close", () => {
      console.log("❌ Binance WS disconnected");
      scheduleReconnect();
    });

    ws.on("error", (error) => {
      console.error("⚠️  Binance WS error:", error.message);
      // Connection will be handled by 'close' event
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return; // Already scheduled

    reconnectAttempts++;
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1),
      MAX_RECONNECT_DELAY
    );

    console.log(`🔄 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts})`);
    
    reconnectTimer = setTimeout(() => {
      console.log("🔌 Attempting to reconnect...");
      connect();
    }, delay);
  }

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("🛑 Shutting down price feed...");
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("🛑 Shutting down price feed...");
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
    process.exit(0);
  });

  // Start initial connection
  connect();
}

