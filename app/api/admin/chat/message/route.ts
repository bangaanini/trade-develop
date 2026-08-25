import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// PATCH - Edit an existing chat message (superadmin only)
export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { messageId, message, createdAt } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    if (typeof message !== "string" && createdAt === undefined) {
      return NextResponse.json(
        { error: "Provide message and/or createdAt to update" },
        { status: 400 }
      );
    }

    const sets: string[] = [];
    const params: any[] = [];

    if (typeof message === "string") {
      const trimmed = message.trim();
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "Message cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmed.length > 1000) {
        return NextResponse.json(
          { error: "Message too long (max 1000 characters)" },
          { status: 400 }
        );
      }
      params.push(trimmed);
      sets.push(`message = $${params.length}`);
    }

    if (createdAt !== undefined && createdAt !== null && createdAt !== "") {
      const parsed = new Date(createdAt);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid createdAt date" },
          { status: 400 }
        );
      }
      // Reject dates absurdly far in past or future (sanity)
      const now = Date.now();
      const ten_years = 10 * 365 * 24 * 60 * 60 * 1000;
      if (parsed.getTime() < now - ten_years || parsed.getTime() > now + ten_years) {
        return NextResponse.json(
          { error: "Date out of allowed range" },
          { status: 400 }
        );
      }
      params.push(parsed.toISOString());
      sets.push(`created_at = $${params.length}`);
    }

    // Always mark as edited and record auditor
    params.push(user.id);
    sets.push(`is_edited = TRUE`, `edited_at = NOW()`, `edited_by = $${params.length}`);

    params.push(messageId);
    const sql = `UPDATE chat_messages
                    SET ${sets.join(", ")}
                  WHERE id = $${params.length}
                  RETURNING id, message, sender_type, is_read, created_at, is_edited, edited_at`;

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      message: row.message,
      senderType: row.sender_type,
      isRead: row.is_read,
      createdAt: row.created_at,
      isEdited: row.is_edited,
      editedAt: row.edited_at,
    });
  } catch (error) {
    console.error("Error editing chat message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete a chat message (superadmin only)
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      "DELETE FROM chat_messages WHERE id = $1 RETURNING id",
      [messageId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
