import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres', // Connect to default DB
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function listDbs() {
  try {
    const res = await pool.query("SELECT datname FROM pg_database");
    console.log("Databases:");
    res.rows.forEach(r => console.log(r.datname));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

listDbs();
