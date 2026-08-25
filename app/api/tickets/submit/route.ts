import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Title must be 255 characters or less' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Insert ticket
    const { rows } = await db.query(
      `INSERT INTO tickets (user_id, title, content, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'open', NOW(), NOW())
       RETURNING id`,
      [user.id, title, content]
    );

    return NextResponse.json({
      success: true,
      ticketId: rows[0].id
    });

  } catch (err: any) {
    console.error('Submit Ticket Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
