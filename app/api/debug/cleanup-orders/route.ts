import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { rowCount } = await db.query(
        `UPDATE spot_orders SET status = 'open' WHERE status = 'settling'`
    );
    return NextResponse.json({ message: `Reset ${rowCount} stuck orders to open` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
