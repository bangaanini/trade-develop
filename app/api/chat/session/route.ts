import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// GET - Get or create chat session for current user
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has an open session
    const existingSession = await db.query(
      `SELECT id, status, last_message_at, created_at 
       FROM chat_sessions 
       WHERE user_id = $1 AND status = 'open' 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [user.id]
    );

    if (existingSession.rows.length > 0) {
      return NextResponse.json({
        sessionId: existingSession.rows[0].id,
        status: existingSession.rows[0].status,
        lastMessageAt: existingSession.rows[0].last_message_at,
        createdAt: existingSession.rows[0].created_at,
      });
    }

    // Create new session if none exists
    const newSession = await db.query(
      `INSERT INTO chat_sessions (user_id, status) 
       VALUES ($1, 'open') 
       RETURNING id, status, last_message_at, created_at`,
      [user.id]
    );

    return NextResponse.json({
      sessionId: newSession.rows[0].id,
      status: newSession.rows[0].status,
      lastMessageAt: newSession.rows[0].last_message_at,
      createdAt: newSession.rows[0].created_at,
    });
  } catch (error) {
    console.error("Error in chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
