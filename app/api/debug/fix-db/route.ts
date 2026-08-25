import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log("Creating wallet_addresses table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        network VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        label VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, network) 
      );
    `);
    console.log("Table created.");
    return new Response("OK");
  } catch (e: any) {
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}
