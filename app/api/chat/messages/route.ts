import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// GET - Get all messages in a session
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }

    // Verify the session belongs to the user
    const session = await db.query(
      "SELECT user_id FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    if (session.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.rows[0].user_id !== user.id && user.role !== "admin" && user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all messages in the session
    const messages = await db.query(
      `SELECT
        cm.id,
        cm.message,
        cm.sender_type,
        cm.is_read,
        cm.created_at,
        cm.is_edited,
        cm.edited_at,
        u.email as sender_email,
        u.first_name,
        u.last_name
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       WHERE cm.session_id = $1
       ORDER BY cm.created_at ASC`,
      [sessionId]
    );

    const formattedMessages = messages.rows.map((msg: any) => ({
      id: msg.id,
      message: msg.message,
      senderType: msg.sender_type,
      senderName: msg.sender_type === 'admin'
        ? 'Admin'
        : (msg.first_name || msg.sender_email || 'User'),
      isRead: msg.is_read,
      createdAt: msg.created_at,
      isEdited: msg.is_edited === true,
      editedAt: msg.edited_at,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Verify the session belongs to the user
    const session = await db.query(
      "SELECT user_id FROM chat_sessions WHERE id = $1",
      [sessionId]
    );

    if (session.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Insert the message
    const newMessage = await db.query(
      `INSERT INTO chat_messages (session_id, sender_id, sender_type, message, is_read)
       VALUES ($1, $2, 'user', $3, false)
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
      senderName: user.first_name || user.email || 'User',
      isRead: newMessage.rows[0].is_read,
      createdAt: newMessage.rows[0].created_at,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
