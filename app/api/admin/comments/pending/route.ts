import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Verificar que es admin
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userDoc.exists || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden ver comentarios pendientes.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const instanteId = searchParams.get('instanteId');

    // Obtener comentarios SIN orderBy para evitar necesidad de índice compuesto
    let snapshot;
    if (instanteId) {
      snapshot = await adminDb
        .collection('comments')
        .where('instanteId', '==', instanteId)
        .where('status', '==', 'pending')
        .get();
    } else {
      snapshot = await adminDb
        .collection('comments')
        .where('status', '==', 'pending')
        .get();
    }

    const comments = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Ordenar manualmente por createdAt descendente
    comments.sort((a: any, b: any) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime; // Descendente
    });

    return NextResponse.json({
      success: true,
      comments,
      count: comments.length,
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
        error: error instanceof Error ? error.message : 'Error al obtener comentarios pendientes',
      },
      { status: 500 }
    );
  }
}
