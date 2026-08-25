import { Pool } from "pg";

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || '',
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_NAME || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
