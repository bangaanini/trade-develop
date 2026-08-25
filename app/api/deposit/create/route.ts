import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    // Use session ID for security, ignoring formData userId if present
    const userId = session.id;
    const depositMethodId = formData.get("depositMethodId") as string;
    const amount = formData.get("amount") as string;
    const txid = formData.get("txid") as string;
    const file = formData.get("proof") as File | null;

    if (!depositMethodId || !amount) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Payment proof is required" }, { status: 400 });
    }

    // Upload proof if exists
    let proof_url = null;
    if (file) {
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const uploaded = await uploadFile(file, "proofs", fileName);
      proof_url = `/uploads/proofs/${uploaded.filename}`;
    }

    // ambil info metode deposit
    const { rows: methods } = await db.query(
      `SELECT coin, network FROM deposit_methods WHERE id = $1`,
      [depositMethodId]
    );
    const method = methods[0];

    if (!method) {
      return NextResponse.json({ error: "Invalid deposit method" }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    await db.query(
      `INSERT INTO deposits (id, user_id, deposit_method_id, coin, network, amount, txid, proof_url, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())`,
      [newId, userId, depositMethodId, method.coin, method.network, Number(amount), txid || '-', proof_url]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Deposit Create Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
