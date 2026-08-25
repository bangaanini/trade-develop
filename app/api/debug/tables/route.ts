import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await db.query(
        `SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'wallet_logs';`
    );
    return NextResponse.json({ constraints: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
