import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing Session ID' }, { status: 400 });
    }

    // Delete messages first (foreign key constraint usually cascades but let's be safe if not)
    await db.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
    
    // Delete session
    await db.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);

    return NextResponse.json({ success: true, message: 'Chat session deleted' });

  } catch (err: any) {
    console.error('Admin Chat Delete Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
