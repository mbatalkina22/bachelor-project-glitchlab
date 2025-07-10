import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { fileStr, folder, publicId } = await request.json();

    if (!fileStr) {
      return NextResponse.json(
        { error: 'File string is required' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileStr, {
      folder: folder || 'general',
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload to Cloudinary' },
      { status: 500 }
    );
  }
}