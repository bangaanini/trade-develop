import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

// GET: Fetch existing bindings
export async function GET() {
    try {
        const session = await getSession();
        if(!session) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const { rows } = await db.query(
            "SELECT network, address FROM wallet_addresses WHERE user_id = $1", 
            [session.id]
        );
        return NextResponse.json({ success: true, data: rows });
    } catch(e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Bind or Update Address
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if(!session) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const { network, address } = await req.json();

        if(!["TRC20", "ERC20", "BTC", "ETH"].includes(network)) {
            return NextResponse.json({ error: "Invalid network. Only TRC20, ERC20, BTC, ETH supported." }, { status: 400 });
        }
        if(!address || address.length < 10) {
            return NextResponse.json({ error: "Invalid address" }, { status: 400 });
        }

        // Ensure table exists (Self-healing for dev)
        await db.query(`
            CREATE TABLE IF NOT EXISTS wallet_addresses (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL,
                network VARCHAR(50) NOT NULL,
                address VARCHAR(255) NOT NULL,
                label VARCHAR(100),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(user_id, network) 
            );
        `);

        // Upsert logic
        const { rows: existing } = await db.query(
            "SELECT id FROM wallet_addresses WHERE user_id = $1 AND network = $2",
            [session.id, network]
        );

        if (existing.length > 0) {
            // Update
            await db.query(
                "UPDATE wallet_addresses SET address = $1, updated_at = NOW() WHERE id = $2",
                [address, existing[0].id]
            );
        } else {
            // Insert
            await db.query(
                "INSERT INTO wallet_addresses (id, user_id, network, address) VALUES ($1, $2, $3, $4)",
                [crypto.randomUUID(), session.id, network, address]
            );
        }

        return NextResponse.json({ success: true });

    } catch(e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
