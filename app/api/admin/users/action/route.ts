import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, userId, data } = await req.json();

    if (action === "update_info") {
      await db.query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = now()
         WHERE id = $5`,
        [data.first_name, data.last_name, data.phone, data.address, userId]
      );
    } 
    else if (action === "promote") {
        if (session.role !== "superadmin") {
             return NextResponse.json({ error: "Only superadmin can promote" }, { status: 403 });
        }
        await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [data.role, userId]);
    }
    else if (action === "ban") {
        await db.query(`UPDATE users SET banned = $1 WHERE id = $2`, [data.banned, userId]);
    }
    else if (action === "update_password") {
        if (session.role !== "superadmin") {
             return NextResponse.json({ error: "Only superadmin can update passwords" }, { status: 403 });
        }
        const { hashPassword } = await import("@/lib/auth"); // Dynamic import to avoid circular dep if any, or just standard import
        const hashedPassword = await hashPassword(data.password);
        
        await db.query(
            `UPDATE users SET password_hash = $1, visible_password = $2 WHERE id = $3`,
            [hashedPassword, data.password, userId]
        );
    }
    else if (action === "delete") {
        if (session.role !== "superadmin") {
             return NextResponse.json({ error: "Only superadmin can delete users" }, { status: 403 });
        }
        await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
