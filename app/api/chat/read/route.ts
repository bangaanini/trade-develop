import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// POST - Mark messages as read
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user or user is admin
    const session = await db.query(
      "SELECT user_id FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    if (session.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin" || user.role === "superadmin";
    const isOwner = session.rows[0].user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark messages as read based on who is reading
    // If user is reading, mark admin messages as read
    // If admin is reading, mark user messages as read
    const senderTypeToMark = isOwner ? 'admin' : 'user';

    await db.query(
      `UPDATE chat_messages 
       SET is_read = true 
       WHERE session_id = $1 AND sender_type = $2 AND is_read = false`,
      [sessionId, senderTypeToMark]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
