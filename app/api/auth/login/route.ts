import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Login attempt for:", body.email); // DEBUG
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    if (!user) {
      console.log("User not found:", email); // DEBUG
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // FIX: use password_hash
    console.log("User found, verifying password..."); // DEBUG
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      console.log("Password verification failed for:", email); // DEBUG
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.banned) {
      return NextResponse.json({ error: "Your account has been banned. Please contact support." }, { status: 403 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
