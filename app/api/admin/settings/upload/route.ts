import { NextResponse } from 'next/server';
import { join } from 'path';
import { saveImage } from '@/lib/settings';
import { verifyAuth } from '@/lib/auth';
import { uploadFile } from '@/lib/upload';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/settings/upload
 * Upload image (hero bg, sliders, logo, etc)
 */
export async function POST(req: Request) {
  try {
    // Verify admin access
    const user = await verifyAuth(req);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const imageKey = formData.get('imageKey') as string;

    if (!file || !imageKey) {
      return NextResponse.json(
        { error: 'File and imageKey are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${imageKey}-${timestamp}.${extension}`;

    // Upload via central uploadFile function (R2 + local fallback)
    const uploaded = await uploadFile(file, '', fileName);

    const fileUrl = uploaded.url;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    // Save to database
    await saveImage(
      imageKey,
      {
        file_name: fileName,
        file_path: filePath,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl,
        fileName,
        size: file.size,
      },
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
