const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting UID migration...");

    // 1. Check if column exists first to avoid permission error on ALTER
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='uid'
    `);

    if (columns.length === 0) {
      console.log("Column 'uid' not found. Attempting to add...");
      try {
        await client.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS uid BIGINT UNIQUE;
        `);
        console.log("✅ Column added.");
      } catch (err) {
        console.error("❌ Failed to add column. You MUST add it manually:");
        console.error("   SQL: ALTER TABLE users ADD COLUMN IF NOT EXISTS uid BIGINT UNIQUE;");
        return; 
      }
    } else {
      console.log("✅ Column 'uid' already exists. Skipping ALTER.");
    }

    // 2. Get users without UID
    const { rows: users } = await client.query(`
      SELECT id FROM users WHERE uid IS NULL
    `);

    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      let uid;
      let isUnique = false;

      // Generate unique 8-digit UID
      while (!isUnique) {
        uid = Math.floor(10000000 + Math.random() * 90000000);
        const { rows } = await client.query(
          "SELECT 1 FROM users WHERE uid = $1",
          [uid]
        );
        if (rows.length === 0) isUnique = true;
      }

      await client.query("UPDATE users SET uid = $1 WHERE id = $2", [
        uid,
        user.id,
      ]);
      console.log(`✅ Assigned UID ${uid} to user ${user.id}`);
    }

    console.log("🎉 Migration complete!");
  } catch (e) {
    console.error("❌ Migration failed:", e);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
