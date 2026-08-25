import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { rows } = await db.query(
      "SELECT id, network, address, label, created_at, updated_at FROM wallet_addresses WHERE user_id = $1 ORDER BY updated_at DESC", 
      [userId]
    );
    
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, network, address, id } = await req.json();

    if (!userId || !network || !address) {
      return NextResponse.json({ error: "Missing userId, network, or address" }, { status: 400 });
    }

    if (id) {
       // Update existing address by its specific wallet_addresses id
       await db.query(`
          UPDATE wallet_addresses 
          SET address = $1, network = $2, updated_at = NOW() 
          WHERE id = $3 AND user_id = $4
       `, [address, network, id, userId]);
    } else {
       // Create new wallet_addresses for a specific network if it doesn't already exist
       const { rows: existing } = await db.query(
          "SELECT id FROM wallet_addresses WHERE user_id = $1 AND network = $2",
          [userId, network]
       );

       if (existing.length > 0) {
          // Update the existing network address
          await db.query(`
            UPDATE wallet_addresses 
            SET address = $1, updated_at = NOW() 
            WHERE id = $2
          `, [address, existing[0].id]);
       } else {
         // Insert new
         await db.query(
            "INSERT INTO wallet_addresses (id, user_id, network, address) VALUES ($1, $2, $3, $4)",
            [crypto.randomUUID(), userId, network, address]
         );
       }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, id } = await req.json();

    if (!userId || !id) {
      return NextResponse.json({ error: "Missing userId or id" }, { status: 400 });
    }

    await db.query(
      "DELETE FROM wallet_addresses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
