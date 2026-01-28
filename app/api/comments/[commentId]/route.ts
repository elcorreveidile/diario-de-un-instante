import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { updateComment, deleteComment, getCommentById } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

// Actualizar comentario
export async function PATCH(
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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'El contenido no puede estar vacío' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es el autor del comentario
    const comment = await getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'El comentario no existe' },
        { status: 404 }
      );
    }

    if (comment.userId !== decoded.uid) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar este comentario' },
        { status: 403 }
      );
    }

    await updateComment(commentId, content.trim());

    return NextResponse.json({
      success: true,
      message: 'Comentario actualizado',
    });
  } catch (error) {
    console.error('[API Comments] Error:', error);

    if (error instanceof Error && error.message.includes('Firebase ID token')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al actualizar comentario',
      },
      { status: 500 }
    );
  }
}

// Eliminar comentario (soft delete)
export async function DELETE(
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

    await deleteComment(commentId, decoded.uid);

    return NextResponse.json({
      success: true,
      message: 'Comentario eliminado',
    });
  } catch (error) {
    console.error('[API Comments] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Firebase ID token')) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }
      if (error.message.includes('No tienes permiso')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al eliminar comentario',
      },
      { status: 500 }
    );
  }
}
