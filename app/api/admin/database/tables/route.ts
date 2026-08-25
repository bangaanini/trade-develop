import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    // Get row counts for each table
    const tables = await Promise.all(rows.map(async (row) => {
        // Safe to interpolate table name here because it comes from information_schema
        const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
        return {
            name: row.table_name,
            count: parseInt(countRows[0].count)
        };
    }));

    return NextResponse.json({ tables });
  } catch (err: any) {
    console.error("Database Tables Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
