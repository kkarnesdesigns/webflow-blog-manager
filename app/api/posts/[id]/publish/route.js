import { NextResponse } from 'next/server';
import { getWebflowClient } from '@/lib/webflow';
import { isAuthenticated } from '@/lib/auth';

const BLOG_COLLECTION_ID = process.env.BLOG_COLLECTION_ID;

// Publish a blog post
export async function POST(request, { params }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const { id } = await params;

    const result = await webflow.publishItem(BLOG_COLLECTION_ID, id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error publishing post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    );
  }
}
