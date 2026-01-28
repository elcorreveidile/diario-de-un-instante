import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createComment, getInstanteById } from '@/lib/firestore';
import type { CommentInput } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { instanteId, content, parentId } = body;

    if (!instanteId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el instante existe y es público
    const instante = await getInstanteById(instanteId);
    if (!instante) {
      return NextResponse.json(
        { error: 'El instante no existe' },
        { status: 404 }
      );
    }

    const esPublico = instante.privado === false || !instante.hasOwnProperty('privado');
    if (!esPublico) {
      return NextResponse.json(
        { error: 'No se puede comentar en instantes privados' },
        { status: 403 }
      );
    }

    // Obtener datos del usuario
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    const userName = userData?.displayName || userData?.email?.split('@')[0] || 'Usuario';
    const userPhoto = userData?.photoURL;

    const commentData: CommentInput = {
      instanteId,
      userId: decoded.uid,
      userName,
      userPhoto,
      content: content.trim(),
      parentId: parentId || null,
    };

    const commentId = await createComment(commentData);

    // Enviar notificación por email
    try {
      const { sendCommentNotification, sendCommentReplyNotification } = await import('@/lib/email');

      // Obtener email del autor del instante
      const authorDoc = await adminDb.collection('users').doc(instante.userId).get();
      const authorData = authorDoc.data();
      const authorEmail = authorData?.email;

      if (authorEmail) {
        const instanteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.diariodeuninstante.com'}/i/${instanteId}`;

        if (parentId) {
          // Es una respuesta, buscar el autor del comentario padre
          const parentCommentDoc = await adminDb.collection('comments').doc(parentId).get();
          const parentCommentData = parentCommentDoc.data();

          if (parentCommentData && parentCommentData.userId !== decoded.uid) {
            // No enviar notificación a sí mismo
            const parentAuthorDoc = await adminDb.collection('users').doc(parentCommentData.userId).get();
            const parentAuthorData = parentAuthorDoc.data();

            if (parentAuthorData?.email) {
              await sendCommentReplyNotification(
                parentAuthorData.email,
                parentCommentData.userName,
                content.trim(),
                userName,
                instante.titulo,
                instanteUrl
              );
            }
          }
        } else if (instante.userId !== decoded.uid) {
          // Es un comentario nivel superior y no es el autor del instante
          await sendCommentNotification(
            authorEmail,
            instante.titulo,
            content.trim(),
            userName,
            instanteUrl
          );
        }
      }
    } catch (emailError) {
      console.error('[API Comments] Error enviando email:', emailError);
      // No fallar el comentario si falla el email
    }

    return NextResponse.json({
      success: true,
      commentId,
      message: 'Comentario creado exitosamente',
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
        error: error instanceof Error ? error.message : 'Error al crear comentario',
      },
      { status: 500 }
    );
  }
}
