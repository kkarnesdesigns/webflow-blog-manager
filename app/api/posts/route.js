import { NextResponse } from 'next/server';
import { getWebflowClient } from '@/lib/webflow';
import { isAuthenticated } from '@/lib/auth';

const BLOG_COLLECTION_ID = process.env.BLOG_COLLECTION_ID;

// GET all blog posts
export async function GET(request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const offset = searchParams.get('offset') || 0;

    const result = await webflow.getCollectionItems(BLOG_COLLECTION_ID, {
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// CREATE new blog post
export async function POST(request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const body = await request.json();
    const { isDraft = true, ...fieldData } = body;

    const result = await webflow.createCollectionItem(
      BLOG_COLLECTION_ID,
      fieldData,
      isDraft
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
