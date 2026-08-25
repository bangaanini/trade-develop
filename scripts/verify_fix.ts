import 'dotenv/config';
import { db } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../lib/password";

async function verify() {
  try {
     // 1. Check DB connection
     console.log("Checking DB connection...");
     await db.query("SELECT NOW()");
     console.log("DB connected.");

     // 2. Simulate User Existence Check
     const testEmail = `test_${Date.now()}@example.com`;
     console.log(`Checking existence for ${testEmail}...`);
     const exists = await db.query("SELECT id FROM users WHERE email = $1", [testEmail]);
     console.log("Exists rowCount:", exists.rowCount); // Should be 0

     // 3. Simulate Insertion
     console.log("Simulating insertion...");
     const hashedPassword = await hashPassword("password123");
     const id = uuidv4();
     await db.query(
      `INSERT INTO users (
        id, email, password_hash, role, created_at, 
        email_verified, phone_verified, kyc_verified, twofa_enabled, banned
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)`,
      [id, testEmail, hashedPassword, "USER", false, false, false, false, false]
    );
    console.log("User inserted.");

    // 4. Verify Insertion
    const verify = await db.query("SELECT id FROM users WHERE email = $1", [testEmail]);
    console.log("Verify rowCount:", verify.rowCount); // Should be 1
    
    // Clean up
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    console.log("Cleaned up test user.");

  } catch (e) {
    console.error("Verification failed:", e);
  }
}

verify();
