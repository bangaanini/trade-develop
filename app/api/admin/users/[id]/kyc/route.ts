import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;

    const { rows } = await db.query(
      `SELECT id, name AS full_name, id_card_number, id_card_front_filename, status, 
              admin_note, submitted_at, reviewed_at
       FROM kyc_submissions 
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ kyc: null });
    }

    return NextResponse.json({ kyc: rows[0] });

  } catch (err: any) {
    console.error('Get User KYC Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

