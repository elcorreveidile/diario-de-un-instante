import { NextRequest, NextResponse } from 'next/server';
import { getThreadedComments } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { instanteId: string } }
) {
  try {
    const { instanteId } = params;

    if (!instanteId) {
      return NextResponse.json(
        { error: 'ID del instante requerido' },
        { status: 400 }
      );
    }

    const comments = await getThreadedComments(instanteId);

    return NextResponse.json({
      success: true,
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error('[API Comments] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener comentarios',
      },
      { status: 500 }
    );
  }
}
