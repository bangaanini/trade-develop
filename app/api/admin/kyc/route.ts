import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get all KYC submissions (admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await db.query(
      `SELECT k.*, u.email 
       FROM kyc_submissions k
       JOIN users u ON k.user_id = u.id
       ORDER BY 
         CASE k.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'rejected' THEN 3
         END,
         k.submitted_at DESC`
    );

    return NextResponse.json({ submissions: rows });

  } catch (err: any) {
    console.error('Admin KYC List Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve or reject KYC (admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kycId, action, adminNote } = await req.json();

    if (!kycId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Start transaction
    await db.query('BEGIN');

    try {
      // Update KYC submission
      const result = await db.query(
        `UPDATE kyc_submissions 
         SET status = $1, admin_note = $2, reviewed_at = NOW(), reviewed_by = $3
         WHERE id = $4
         RETURNING user_id`,
        [newStatus, adminNote || null, session.id, kycId]
      );

      if (result.rows.length === 0) {
        throw new Error('KYC submission not found');
      }

      const userId = result.rows[0].user_id;

      // If approved, update user's kyc_verified status
      if (action === 'approve') {
        await db.query(
          'UPDATE users SET kyc_verified = true WHERE id = $1',
          [userId]
        );
      }

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `KYC ${action}d successfully`
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (err: any) {
    console.error('Admin KYC Action Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// Delete KYC submission (superadmin only)
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Start transaction to delete files too?
    // For now just delete record, files remain in upload folder or we can delete them if we had fs access but keep it simple
    
    await db.query('DELETE FROM kyc_submissions WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'KYC deleted successfully' });

  } catch (err: any) {
    console.error('Admin KYC Delete Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
