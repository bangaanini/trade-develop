import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // options, spot, swap, deposits, withdraws
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = "";
    let countQuery = "";
    let params: any[] = [];
    let countParams: any[] = [];

    // Base Condition for Search (Email)
    let searchCondition = "";
    if (search) {
        searchCondition = `AND u.email ILIKE $1`;
        params.push(`%${search}%`);
        countParams.push(`%${search}%`); // Separate params for count if needed but usually standard query works
    }

    // Adjust params index if search exists
    // Actually easier to build dynamically logic below

    // We will use a cleaner approach:
    // Base Table & Join
    let table = "";
    let select = "";
    
    switch(type) {
        case "options":
            table = "options";
            // options: id, created_at, symbol, amount, status, user_id
            // Need email from users
            break;
        case "spot":
            table = "spot_orders";
            break;
        case "swap":
            table = "swaps";
            break;
        case "deposits":
            table = "deposits";
            break;
        case "withdraws":
            table = "withdraws";
            break;
        default:
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Build Query
    // We need standard columns: id, created_at, email, pair/coin, amount, status
    
    let columns = "";
    let orderBy = "created_at DESC";

    if (type === "options") {
       columns = `t.id, t.created_at, u.email, t.symbol as pair, t.amount, t.status, t.direction, t.payout_percent`;
    } else if (type === "spot") {
       columns = `t.id, t.created_at, u.email, t.symbol as pair, t.amount, t.status, t.side as direction, t.price`;
    } else if (type === "swap") {
       columns = `t.id, t.created_at, u.email, CONCAT(t.from_coin, '->', t.to_coin) as pair, t.amount_in as amount, 'completed' as status`; 
       // Check swap schema? assuming created_at exists.
    } else if (type === "deposits") {
       columns = `t.id, t.created_at, u.email, t.coin as pair, t.amount, t.status, t.proof_url`;
    } else if (type === "withdraws") {
       columns = `t.id, t.created_at, u.email, t.coin as pair, t.amount, t.status, t.address`;
    }

    const whereClause = search ? `WHERE u.email ILIKE $1` : "";
    const limitClause = search ? `LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`;
    
    // Construct Main Query
    const sql = `
        SELECT ${columns}
        FROM ${table} t
        JOIN users u ON t.user_id = u.id
        ${whereClause}
        ORDER BY t.${orderBy}
        ${search ? `LIMIT ${limit} OFFSET ${offset}` : `LIMIT ${limit} OFFSET ${offset}`}
    `;
    
    // Construct Count Query
    const sqlCount = `
        SELECT COUNT(*) as total
        FROM ${table} t
        JOIN users u ON t.user_id = u.id
        ${whereClause}
    `;

    // Execute
    const poolParams = search ? [`%${search}%`] : [];
    
    const [resRows, resCount] = await Promise.all([
        db.query(sql, poolParams),
        db.query(sqlCount, poolParams)
    ]);

    return NextResponse.json({
        data: resRows.rows,
        total: Number(resCount.rows[0].total),
        page,
        totalPages: Math.ceil(Number(resCount.rows[0].total) / limit)
    });

  } catch (e: any) {
    console.error("ADMIN TRANSACTIONS ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
