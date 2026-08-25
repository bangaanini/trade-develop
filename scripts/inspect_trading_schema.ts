import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function inspect() {
  try {
    const res = await pool.query(
      "SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY table_schema, ordinal_position"
    );
    console.log("Columns for 'users' table:");
    res.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}: ${r.column_name}`));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

inspect();
