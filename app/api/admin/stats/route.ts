import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows: users } = await db.query("SELECT COUNT(*) FROM users");
    const { rows: deposits } = await db.query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'");
    const { rows: withdraws } = await db.query("SELECT COUNT(*) FROM withdraws WHERE status = 'pending'");
    const { rows: running } = await db.query("SELECT COUNT(*) FROM options WHERE status = 'open'");
    const { rows: kycPending } = await db.query("SELECT COUNT(*) FROM kyc_submissions WHERE status = 'pending'");
    const { rows: chatUnread } = await db.query(
      "SELECT COUNT(*) FROM chat_messages WHERE sender_type = 'user' AND is_read = false"
    );

    return NextResponse.json({
      users: Number(users[0].count),
      deposits: Number(deposits[0].count),
      withdraws: Number(withdraws[0].count),
      runningOptions: Number(running[0].count),
      kycPending: Number(kycPending[0].count),
      chatUnread: Number(chatUnread[0].count),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
