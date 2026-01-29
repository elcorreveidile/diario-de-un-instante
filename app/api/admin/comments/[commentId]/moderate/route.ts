import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getCommentById, moderateComment, getInstanteById } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { commentId } = params;
    const body = await request.json();
    const { action, instanteId } = body;

    if (!action || !['approved', 'rejected', 'spam'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser: approved, rejected o spam' },
        { status: 400 }
      );
    }

    // Verificar que el instante existe y obtener su autor
    const instante = await getInstanteById(instanteId);
    if (!instante) {
      return NextResponse.json(
        { error: 'El instante no existe' },
        { status: 404 }
      );
    }

    // Verificar permisos: admin global o autor del instante
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    const isInstantAuthor = instante.userId === decoded.uid;

    if (!isAdmin && !isInstantAuthor) {
      return NextResponse.json(
        { error: 'No tienes permiso para moderar comentarios en este instante' },
        { status: 403 }
      );
    }

    await moderateComment(commentId, action);

    return NextResponse.json({
      success: true,
      message: `Comentario ${action === 'approved' ? 'aprobado' : action === 'rejected' ? 'rechazado' : 'marcado como spam'}`,
    });
  } catch (error) {
    console.error('[API Admin Comments] Error:', error);

    if (error instanceof Error && error.message.includes('Firebase ID token')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al moderar comentario',
      },
      { status: 500 }
    );
  }
}
