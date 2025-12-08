import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getWebflowClient } from '@/lib/webflow';
import crypto from 'crypto';

const SITE_ID = '64c2c941368dd7094ffd75a5';

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

    // Generate MD5 hash
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `blog-${Date.now()}.${ext}`;

    const webflow = getWebflowClient();

    // Step 1: Create asset metadata in Webflow
    console.log('Creating asset metadata...');
    const metadata = await webflow.createAssetMetadata(SITE_ID, fileName, fileHash);
    console.log('Metadata response:', JSON.stringify(metadata, null, 2));

    // Step 2: Upload to S3 using the provided details
    console.log('Uploading to S3...');
    const s3FormData = new FormData();

    // Add all upload details (order matters for S3)
    if (metadata.uploadDetails) {
      Object.entries(metadata.uploadDetails).forEach(([key, value]) => {
        s3FormData.append(key, value);
      });
    }

    // Add the file last with correct content type
    s3FormData.append('file', new Blob([buffer], { type: file.type }), fileName);

    const s3Response = await fetch(metadata.uploadUrl, {
      method: 'POST',
      body: s3FormData
    });

    if (!s3Response.ok) {
      const s3Error = await s3Response.text();
      console.error('S3 upload failed:', s3Error);
      throw new Error('Failed to upload to Webflow CDN');
    }

    console.log('Upload successful!');

    // Return the asset info for use in CMS
    return NextResponse.json({
      fileId: metadata.id,
      url: metadata.hostedUrl || `https://cdn.prod.website-files.com/${SITE_ID}/${metadata.id}_${fileName}`,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
