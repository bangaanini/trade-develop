import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// GET - Get all chat sessions (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "all";

    let query = `
      SELECT 
        cs.id,
        cs.user_id,
        cs.status,
        cs.last_message_at,
        cs.created_at,
        u.email,
        u.first_name,
        u.last_name,
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id AND sender_type = 'user' AND is_read = false) as unread_count,
        (SELECT message FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
    `;

    const params: any[] = [];
    
    if (statusFilter !== "all") {
      query += " WHERE cs.status = $1";
      params.push(statusFilter);
    }

    query += " ORDER BY cs.last_message_at DESC";

    const sessions = await db.query(query, params);

    const formattedSessions = sessions.rows.map((session: any) => ({
      id: session.id,
      userId: session.user_id,
      userEmail: session.email,
      userName: session.first_name || session.email || 'Unknown User',
      status: session.status,
      lastMessageAt: session.last_message_at,
      createdAt: session.created_at,
      unreadCount: parseInt(session.unread_count) || 0,
      lastMessage: session.last_message || '',
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
