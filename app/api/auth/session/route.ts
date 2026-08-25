import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session
 * Get current user session
 */
export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
