import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Check if Cloudflare R2 is configured via environment variables
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

/**
 * Get S3Client instance for Cloudflare R2
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Upload a file or Buffer to Cloudflare R2 (and local storage fallback)
 * @param file - File object or Buffer
 * @param folder - Folder subpath (e.g., 'kyc', 'proofs')
 * @param customFilename - Optional custom filename
 * @param contentType - Optional MIME type
 * @returns Upload result containing filename, key, and URL
 */
export async function uploadFile(
  file: File | Buffer,
  folder: string = '',
  customFilename?: string,
  contentType?: string
): Promise<{ filename: string; key: string; url: string }> {
  try {
    let buffer: Buffer;
    let originalName = 'file.png';
    let mimeType = contentType || 'image/png';

    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      originalName = file.name;
      mimeType = file.type || mimeType;
    } else {
      buffer = file;
    }

    const ext = customFilename
      ? customFilename.split('.').pop()
      : originalName.split('.').pop() || 'png';
    const filename = customFilename || `${crypto.randomUUID()}.${ext}`;
    const key = folder ? `${folder}/${filename}` : filename;

    // 1. Upload to Cloudflare R2 if configured
    if (isR2Configured()) {
      const s3 = getR2Client();
      const bucketName = process.env.R2_BUCKET_NAME;
      if (s3 && bucketName) {
        try {
          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
          });
          await s3.send(command);
          console.log(`[R2 Upload] Successfully uploaded ${key} to Cloudflare R2 bucket ${bucketName}`);
        } catch (r2Error) {
          console.error('[R2 Upload Error] Failed uploading to Cloudflare R2:', r2Error);
        }
      }
    }

    // 2. Also save to local storage as fallback/cache
    try {
      const uploadDir = folder
        ? join(process.cwd(), 'public', 'uploads', folder)
        : join(process.cwd(), 'public', 'uploads');

      await mkdir(uploadDir, { recursive: true });
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
    } catch (localError) {
      console.warn('[Local Upload Warning] Failed local file save:', localError);
    }

    const r2PublicUrl = process.env.R2_PUBLIC_URL;
    const url = r2PublicUrl
      ? `${r2PublicUrl.replace(/\/$/, '')}/${key}`
      : `/uploads/${key}`;

    return { filename, key, url };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload file to local server / R2
 * @param file - File from FormData
 * @param folder - Upload folder (e.g., 'kyc', 'profile')
 * @returns Filename that was saved
 */
export async function uploadFileLocal(file: File, folder: string = 'kyc'): Promise<string> {
  const result = await uploadFile(file, folder);
  return result.filename;
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Max file size in MB (default 5MB)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}
