import { NextResponse } from 'next/server';
import { getAllSettings, getAllImages } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllSettings();
    const images = await getAllImages();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        images,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
