import { NextResponse } from 'next/server';
import { getWebflowClient } from '@/lib/webflow';
import { isAuthenticated } from '@/lib/auth';

const LOCATIONS_COLLECTION_ID = process.env.LOCATIONS_COLLECTION_ID;

// GET all locations (for reference field dropdown)
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const webflow = getWebflowClient();
    const result = await webflow.getCollectionItems(LOCATIONS_COLLECTION_ID, {
      limit: 100
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
