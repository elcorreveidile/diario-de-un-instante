import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, getPopularTags } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular') === 'true';
    const limit = searchParams.get('limit');

    if (popular) {
      const tags = await getPopularTags(limit ? parseInt(limit) : undefined);
      return NextResponse.json(tags);
    } else {
      const tags = await getAllTags();
      return NextResponse.json(tags);
    }
  } catch (error) {
    console.error('[API Tags] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
