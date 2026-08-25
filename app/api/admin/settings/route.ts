import { NextResponse } from 'next/server';
import { getAllSettings, getAllImages } from '@/lib/settings';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings
 * Get all settings and images
 */
export async function GET(req: Request) {
  try {
    // Verify admin access
    const user = await verifyAuth(req);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all settings
    const settings = await getAllSettings();
    
    // Get all images
    const images = await getAllImages();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        images,
      },
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
