import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { rows } = await db.query(
      `SELECT id, email, role, uid, first_name, last_name, created_at, kyc_verified 
       FROM users WHERE id = $1`,
      [session.id]
    );

    if (rows.length === 0) {
        return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (err: any) {
    console.error("Auth Me Error:", err);
    return NextResponse.json({ user: session }); // fallback to session if DB fails
  }
}
