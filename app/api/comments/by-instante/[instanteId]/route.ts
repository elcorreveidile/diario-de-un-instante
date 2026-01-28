import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Función auxiliar para construir respuestas anidadas
function buildThreadedComments(allComments: any[]): any[] {
  const rootComments = allComments.filter((c: any) => !c.parentId);
  const replies = allComments.filter((c: any) => c.parentId);

  const addReplies = (parentId: string): any[] => {
    const directReplies = replies
      .filter((r: any) => r.parentId === parentId)
      .map((r: any) => ({
        ...r,
        replies: addReplies(r.id),
      }));

    return directReplies;
  };

  return rootComments.map((comment: any) => ({
    ...comment,
    replies: addReplies(comment.id),
  }));
}

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

    console.log('[API Comments] Fetching comments for instante:', instanteId);

    // Obtener comentarios usando Admin SDK
    // Primero intentar con orderBy, si falla por índice, intentar sin orderBy
    let snapshot;
    try {
      snapshot = await adminDb
        .collection('comments')
        .where('instanteId', '==', instanteId)
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .get();
    } catch (indexError: any) {
      // Si falla por falta de índice, intentar sin orderBy
      if (indexError.message && indexError.message.includes('index')) {
        console.log('[API Comments] No index found, fetching without orderBy');
        snapshot = await adminDb
          .collection('comments')
          .where('instanteId', '==', instanteId)
          .where('status', '==', 'approved')
          .get();
      } else {
        throw indexError;
      }
    }

    const allComments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        editedAt: data.editedAt?.toDate?.() || data.editedAt,
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
      };
    }).filter((comment: any) => !comment.deletedAt);

    // Ordenar manualmente si no se pudo usar orderBy
    allComments.sort((a: any, b: any) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    console.log('[API Comments] Found comments:', allComments.length);

    // Construir árbol de comentarios
    const threadedComments = buildThreadedComments(allComments);

    return NextResponse.json({
      success: true,
      comments: threadedComments,
      count: threadedComments.length,
    });
  } catch (error) {
    console.error('[API Comments] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener comentarios',
        comments: [],
        count: 0,
      },
      { status: 200 } // Retornar 200 con array vacío en lugar de 500 para no romper el frontend
    );
  }
}
