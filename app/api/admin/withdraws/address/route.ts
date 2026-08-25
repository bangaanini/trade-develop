import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { withdrawId, newAddress } = await req.json();

    if (!withdrawId || !newAddress) {
      return NextResponse.json({ error: "Missing withdrawId or newAddress" }, { status: 400 });
    }

    await db.query(
      "UPDATE withdraws SET address = $1 WHERE id = $2",
      [newAddress, withdrawId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
