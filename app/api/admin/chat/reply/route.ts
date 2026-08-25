import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// POST - Admin sends a reply to a chat session
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await db.query(
      "SELECT id FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    if (session.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Insert the admin message
    const newMessage = await db.query(
      `INSERT INTO chat_messages (session_id, sender_id, sender_type, message, is_read)
       VALUES ($1, $2, 'admin', $3, false)
       RETURNING id, message, sender_type, is_read, created_at`,
      [sessionId, user.id, message.trim()]
    );

    // Update last_message_at in session
    await db.query(
      "UPDATE chat_sessions SET last_message_at = NOW() WHERE id = $1",
      [sessionId]
    );

    return NextResponse.json({
      id: newMessage.rows[0].id,
      message: newMessage.rows[0].message,
      senderType: newMessage.rows[0].sender_type,
      senderName: 'Admin',
      isRead: newMessage.rows[0].is_read,
      createdAt: newMessage.rows[0].created_at,
    });
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
