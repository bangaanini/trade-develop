import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get current password hash (withdraw password is same as login password by default)
    const { rows } = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }

    // For now, withdraw password is the same as login password
    // In the future, you can add a separate withdraw_password_hash column
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password (this updates both login and withdraw password)
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Withdraw password updated successfully'
    });

  } catch (err: any) {
    console.error('Reset Withdraw Password Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
