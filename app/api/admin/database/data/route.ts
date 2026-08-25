import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tableName, page = 1, limit = 50 } = await req.json();

    // Validate table name exists in public schema to prevent SQL injection
    const { rows: tableExists } = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = $1
    `, [tableName]);

    if (tableExists.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const offset = (page - 1) * limit;

    // Fetch columns with PK info
    const { rows: columns } = await db.query(`
        SELECT 
            c.column_name, 
            c.data_type,
            CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
        FROM information_schema.columns c
        LEFT JOIN (
            SELECT kcu.column_name
            FROM information_schema.key_column_usage kcu
            JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
            WHERE kcu.table_name = $1 
            AND tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.column_name = pk.column_name
        WHERE c.table_name = $1 
        AND c.table_schema = 'public'
        ORDER BY c.ordinal_position
    `, [tableName]);

    // Fetch data
    // Safe to interpolate tableName because we validated it against information_schema
    // Fetch ctid as _ctid for fallback identification
    const { rows: data } = await db.query(`
        SELECT *, ctid::text as "_ctid" FROM "${tableName}"
        LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Fetch total count
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const total = parseInt(countRows[0].count);

    return NextResponse.json({
        data,
        columns: columns.map(c => ({
            name: c.column_name,
            type: c.data_type,
            isPrimaryKey: c.is_primary_key
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (err: any) {
    console.error("Database Data Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tableName, identifiers, data } = await req.json();

        if (!tableName || !identifiers || !data) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate table
        const { rows: tableExists } = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (tableExists.length === 0) {
            return NextResponse.json({ error: "Table not found" }, { status: 404 });
        }

        // Construct Query
        const setClauses: string[] = [];
        const whereClauses: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.keys(data).forEach(key => {
            setClauses.push(`"${key}" = $${paramCount}`);
            values.push(data[key]);
            paramCount++;
        });

        // Handle _ctid special case
        if (identifiers._ctid) {
            whereClauses.push(`ctid = $${paramCount}::tid`);
            values.push(identifiers._ctid);
            paramCount++;
        } else {
            Object.keys(identifiers).forEach(key => {
                whereClauses.push(`"${key}" = $${paramCount}`);
                values.push(identifiers[key]);
                paramCount++;
            });
        }

        if (setClauses.length === 0) {
             return NextResponse.json({ message: "No changes" });
        }

        const query = `
            UPDATE "${tableName}"
            SET ${setClauses.join(", ")}
            WHERE ${whereClauses.join(" AND ")}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);

        return NextResponse.json({ data: rows[0] });

    } catch (err: any) {
        console.error("Database Update Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tableName, identifiers } = await req.json();

        if (!tableName || !identifiers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

         // Validate table
         const { rows: tableExists } = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (tableExists.length === 0) {
            return NextResponse.json({ error: "Table not found" }, { status: 404 });
        }

        const whereClauses: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Handle _ctid special case
        if (identifiers._ctid) {
            whereClauses.push(`ctid = $${paramCount}::tid`);
            values.push(identifiers._ctid);
            paramCount++;
        } else {
            Object.keys(identifiers).forEach(key => {
                whereClauses.push(`"${key}" = $${paramCount}`);
                values.push(identifiers[key]);
                paramCount++;
            });
        }

        const query = `
            DELETE FROM "${tableName}"
            WHERE ${whereClauses.join(" AND ")}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);

        return NextResponse.json({ success: true, deleted: rows[0] });

    } catch (err: any) {
        console.error("Database Delete Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
