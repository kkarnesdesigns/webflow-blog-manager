import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

// Upload image and return a publicly accessible URL
// We'll use a simple approach: upload to a free image hosting service
// or you can configure your own S3/Cloudinary

export async function POST(request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP.' },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB for Vercel serverless)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4MB.' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImgBB (free image hosting with API)
    // You can replace this with Cloudinary, S3, or any other service
    const imgbbApiKey = process.env.IMGBB_API_KEY;

    if (imgbbApiKey) {
      // Use ImgBB if API key is configured
      const base64Image = buffer.toString('base64');

      // ImgBB requires URL-encoded form data, not multipart
      const imgbbParams = new URLSearchParams();
      imgbbParams.append('image', base64Image);
      imgbbParams.append('key', imgbbApiKey);

      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: imgbbParams.toString(),
      });

      const imgbbData = await imgbbResponse.json();

      if (!imgbbResponse.ok || !imgbbData.success) {
        console.error('ImgBB error:', imgbbData);
        throw new Error(imgbbData.error?.message || 'Failed to upload to ImgBB');
      }

      return NextResponse.json({
        url: imgbbData.data.url,
        displayUrl: imgbbData.data.display_url,
        deleteUrl: imgbbData.data.delete_url,
      });
    }

    // Fallback: Use Cloudinary unsigned upload if configured
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudinaryCloudName && cloudinaryUploadPreset) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }));
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryData.error?.message || 'Failed to upload to Cloudinary');
      }

      return NextResponse.json({
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
      });
    }

    // No image hosting configured - return error with setup instructions
    return NextResponse.json(
      {
        error: 'Image hosting not configured. Please set up ImgBB or Cloudinary.',
        instructions: {
          imgbb: 'Set IMGBB_API_KEY environment variable (get free key at https://api.imgbb.com/)',
          cloudinary: 'Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables',
        },
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
