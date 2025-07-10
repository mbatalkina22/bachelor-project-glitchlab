// filepath: /Users/mbatalkina/Desktop/Thesis/bachelor-project-glitchlab/src/app/api/cloudinary/upload/direct/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const publicId = formData.get('publicId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a Readable stream from the buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // End the stream

    // Upload to Cloudinary using the stream API
    return new Promise<NextResponse>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'general',
          public_id: publicId,
          overwrite: true,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            resolve(NextResponse.json(
              { error: 'Failed to upload to Cloudinary' },
              { status: 500 }
            ));
            return;
          }
          
          resolve(NextResponse.json({
            success: true,
            url: result!.secure_url,
            public_id: result!.public_id,
          }));
        }
      );

      stream.pipe(uploadStream);
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}