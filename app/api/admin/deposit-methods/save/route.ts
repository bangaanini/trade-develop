import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import path from "path";
import crypto from "crypto";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string | null;
    const coin = formData.get("coin") as string;
    const network = formData.get("network") as string;
    const address = formData.get("address") as string;
    const is_active = formData.get("is_active") === "true";
    let qr_code_url = formData.get("qr_code_url") as string || "";

    const file = formData.get("qrcode") as File | null;

    if (!coin || !network || !address) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Handle File Upload
    if (file && file.size > 0) {
        const ext = path.extname(file.name) || ".png";
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
        const uploaded = await uploadFile(file, '', filename);
        qr_code_url = `/uploads/${uploaded.filename}`;
    }

    if (id) {
      await db.query(
        `UPDATE deposit_methods 
         SET coin = $1, network = $2, address = $3, is_active = $4, qr_code_url = $5, updated_at = now() 
         WHERE id = $6`,
        [coin, network, address, is_active, qr_code_url, id]
      );
    } else {
      const newId = crypto.randomUUID();
      await db.query(
        `INSERT INTO deposit_methods (id, coin, network, address, is_active, qr_code_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newId, coin, network, address, is_active, qr_code_url]
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Save error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
