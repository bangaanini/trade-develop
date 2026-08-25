import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all tickets with user email
    const { rows } = await db.query(
      `SELECT 
        t.id,
        t.user_id,
        u.email as user_email,
        t.title,
        t.content,
        t.status,
        t.created_at
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );

    return NextResponse.json({
      tickets: rows
    });

  } catch (err: any) {
    console.error('Get Tickets Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete Ticket (admin only)
export async function DELETE(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await db.query('DELETE FROM tickets WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' });

  } catch (err: any) {
    console.error('Admin Ticket Delete Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
