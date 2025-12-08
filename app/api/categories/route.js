import { NextResponse } from 'next/server';
import { getWebflowClient } from '@/lib/webflow';
import { isAuthenticated } from '@/lib/auth';

const CATEGORIES_COLLECTION_ID = process.env.CATEGORIES_COLLECTION_ID;

// GET all categories (for reference field dropdown)
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const result = await webflow.getCollectionItems(CATEGORIES_COLLECTION_ID, {
      limit: 100
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
