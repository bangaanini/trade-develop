import 'dotenv/config';
import { db } from "../lib/db";


async function inspect() {
  try {
    const res = await db.query(
      "SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY table_schema, ordinal_position"
    );
    console.log("Columns for 'users' table:");
    res.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}: ${r.column_name}`));
    
    // Also check for password_hash in any table just in case
    const res2 = await db.query(
        "SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE column_name = 'password_hash'"
    );
    console.log("\nTables with 'password_hash':");
    res2.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}`));

  } catch (e) {
    console.error(e);
  }
}

inspect();
