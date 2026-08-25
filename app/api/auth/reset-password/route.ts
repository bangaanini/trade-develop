import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, comparePassword, getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    // 1. Fetch User Hash
    const { rows: users } = await db.query("SELECT password_hash FROM users WHERE id = $1", [session.id]);
    const user = users[0];

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify Current Password
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 403 });
    }

    // 3. Hash New Password
    const newHash = await hashPassword(newPassword);

    // 4. Update DB
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, session.id]);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Reset Password Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
