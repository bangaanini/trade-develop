import { NextResponse } from 'next/server';
import { updateSettings } from '@/lib/settings';
import { verifyAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/settings/update
 * Update multiple settings at once
 */
export async function POST(req: Request) {
  try {
    // Verify admin access
    const user = await verifyAuth(req);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates data' },
        { status: 400 }
      );
    }

    // Update settings
    const success = await updateSettings(updates, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Invalidate Next.js cache so SEO and site settings update immediately
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
