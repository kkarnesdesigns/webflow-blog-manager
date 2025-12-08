import { NextResponse } from 'next/server';
import { getWebflowClient } from '@/lib/webflow';
import { isAuthenticated } from '@/lib/auth';

const BLOG_COLLECTION_ID = process.env.BLOG_COLLECTION_ID;

// GET single blog post
export async function GET(request, { params }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const { id } = await params;
    const result = await webflow.getCollectionItem(BLOG_COLLECTION_ID, id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// UPDATE blog post
export async function PATCH(request, { params }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const { id } = await params;
    const body = await request.json();
    const { isLive = false, ...fieldData } = body;

    const result = await webflow.updateCollectionItem(
      BLOG_COLLECTION_ID,
      id,
      fieldData,
      isLive
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE blog post
export async function DELETE(request, { params }) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const { id } = await params;
    await webflow.deleteCollectionItem(BLOG_COLLECTION_ID, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
