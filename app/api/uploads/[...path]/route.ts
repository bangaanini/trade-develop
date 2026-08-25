import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isR2Configured, getR2Client } from '@/lib/upload';
import { GetObjectCommand } from '@aws-sdk/client-s3';

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join('/');

    // 1. Try serving from Cloudflare R2 if configured
    if (isR2Configured()) {
      const s3 = getR2Client();
      const bucketName = process.env.R2_BUCKET_NAME;
      if (s3 && bucketName) {
        try {
          const r2PublicUrl = process.env.R2_PUBLIC_URL;
          if (r2PublicUrl) {
            const redirectUrl = `${r2PublicUrl.replace(/\/$/, '')}/${key}`;
            return NextResponse.redirect(redirectUrl, 302);
          }

          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          const response = await s3.send(command);

          if (response.Body) {
            const byteArray = await response.Body.transformToByteArray();
            const contentType = response.ContentType || getContentType(key);

            return new NextResponse(Buffer.from(byteArray), {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        } catch (r2Error: any) {
          console.warn(`[R2 Fetch] Key ${key} not fetched from R2: ${r2Error?.message || r2Error}`);
        }
      }
    }

    // 2. Fallback to local file system: public/uploads/[folder]/[filename]
    const filePath = join(process.cwd(), 'public', 'uploads', ...path);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
