import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadFileLocal, validateImageFile } from '@/lib/upload';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const idCardNumber = formData.get('idCardNumber') as string;
    const idCardFrontFile = formData.get('idCardFront') as File;
    const idCardBackFile = formData.get('idCardBack') as File;

    // Validate inputs
    if (!name || !idCardNumber || !idCardFrontFile || !idCardBackFile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate both image files
    const validationFront = validateImageFile(idCardFrontFile, 5);
    if (!validationFront.valid) {
      return NextResponse.json(
        { error: `Front photo: ${validationFront.error}` },
        { status: 400 }
      );
    }

    const validationBack = validateImageFile(idCardBackFile, 5);
    if (!validationBack.valid) {
      return NextResponse.json(
        { error: `Back photo: ${validationBack.error}` },
        { status: 400 }
      );
    }

    // Check if user already has KYC submission
    const { rows: existing } = await db.query(
      'SELECT id, status FROM kyc_submissions WHERE user_id = $1',
      [user.id]
    );

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending KYC submission' },
          { status: 400 }
        );
      } else if (status === 'approved') {
        return NextResponse.json(
          { error: 'Your KYC is already approved' },
          { status: 400 }
        );
      }
      // If rejected, allow resubmission by updating
    }

    // Upload ID card images
    const frontFilename = await uploadFileLocal(idCardFrontFile, 'kyc');
    const backFilename = await uploadFileLocal(idCardBackFile, 'kyc');

    // Save or update KYC submission
    if (existing.length > 0 && existing[0].status === 'rejected') {
      // Update rejected submission
      await db.query(
        `UPDATE kyc_submissions 
         SET name = $1, id_card_number = $2, id_card_front_filename = $3, id_card_back_filename = $4,
             status = 'pending', admin_note = NULL, submitted_at = NOW(), 
             reviewed_at = NULL, reviewed_by = NULL
         WHERE user_id = $5`,
        [name, idCardNumber, frontFilename, backFilename, user.id]
      );
    } else {
      // Create new submission
      await db.query(
        `INSERT INTO kyc_submissions (user_id, name, id_card_number, id_card_front_filename, id_card_back_filename)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, name, idCardNumber, frontFilename, backFilename]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'KYC submitted successfully. Awaiting admin review.'
    });

  } catch (err: any) {
    console.error('KYC Submit Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get KYC status for current user
export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await db.query(
      `SELECT id, name, id_card_number, status, admin_note, submitted_at, reviewed_at
       FROM kyc_submissions 
       WHERE user_id = $1`,
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ kyc: null });
    }

    return NextResponse.json({ kyc: rows[0] });

  } catch (err: any) {
    console.error('KYC Get Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
