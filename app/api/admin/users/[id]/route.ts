import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { rows: users } = await db.query(`
      SELECT 
        u.id, u.email, u.referral_code, u.role, u.created_at, 
        u.email_verified, u.phone_verified, u.kyc_verified, u.twofa_enabled, u.banned, u.uid,
        u.visible_password,
        uri.ip_address as registration_ip, uri.device_info as registration_device,
        COALESCE(uwr.win_rate, 0) as win_rate 
      FROM users u
      LEFT JOIN user_registration_info uri ON u.id = uri.user_id
      LEFT JOIN user_win_rates uwr ON u.id = uwr.user_id
      WHERE u.id = $1
    `, [id]);
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    if (session.role !== "superadmin") {
      delete user.visible_password;
    }

    // Fetch wallets aggregated by coin (sum funding + trading), no duplicates
    const { rows: wallets } = await db.query(`
      SELECT 
        coin,
        SUM(balance) as balance,
        SUM(frozen_balance) as frozen_balance,
        json_agg(json_build_object('type', wallet_type, 'balance', balance, 'frozen', frozen_balance) ORDER BY wallet_type) as breakdown
      FROM wallets 
      WHERE user_id = $1
      GROUP BY coin
      ORDER BY coin
    `, [id]);

    // For USDT wallets, also fetch deposit networks used by this user
    const { rows: depositNetworks } = await db.query(`
      SELECT DISTINCT network, coin 
      FROM deposits 
      WHERE user_id = $1 AND status IN ('approved', 'completed', 'success')
      ORDER BY coin, network
    `, [id]);

    return NextResponse.json({
      user,
      wallets,
      depositNetworks,
      userRole: session.role
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
