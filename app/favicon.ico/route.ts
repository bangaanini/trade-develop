import { NextResponse } from 'next/server';
import { getImage, formatImageUrl } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const faviconImg = await getImage('favicon');
    if (faviconImg?.file_url) {
      const url = formatImageUrl(faviconImg.file_url) || faviconImg.file_url;

      if (url.startsWith('http')) {
        return NextResponse.redirect(url);
      }

      // Local route proxy (/api/uploads/...)
      const port = process.env.PORT || '3008';
      const internalUrl = url.startsWith('/') ? `http://127.0.0.1:${port}${url}` : url;
      const res = await fetch(internalUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': faviconImg.mime_type || 'image/x-icon',
            'Cache-Control': 'public, max-age=3600, must-revalidate',
          },
        });
      }
    }
  } catch (e) {
    console.error('Favicon route error:', e);
  }

  // Fallback 404 if no custom favicon uploaded yet
  return new NextResponse(null, { status: 404 });
}
