import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      // Obtener todos los suscriptores pendientes
      const snapshot = await adminDb
        .collection('newsletter')
        .where('status', '==', 'pending')
        .get();

      const subscribers = snapshot.docs.map(doc => ({
        email: doc.data().email,
        token: doc.data().confirmationToken,
        tokenLength: doc.data().confirmationToken?.length,
      }));

      return NextResponse.json({
        success: true,
        subscribers,
        message: 'Estos son los suscriptores pendientes y sus tokens',
      });
    }

    // Verificar un token específico
    const snapshot = await adminDb
      .collection('newsletter')
      .where('confirmationToken', '==', token)
      .get();

    if (snapshot.empty) {
      // Buscar tokens similares
      const allSnapshot = await adminDb
        .collection('newsletter')
        .where('status', '==', 'pending')
        .get();

      const similarTokens = allSnapshot.docs
        .map(doc => doc.data().confirmationToken)
        .filter(t => t && t.includes(token.substring(0, 10)));

      return NextResponse.json({
        success: false,
        message: 'Token no encontrado',
        token,
        tokenLength: token.length,
        similarTokens,
      });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({
      success: true,
      message: 'Token encontrado',
      email: data.email,
      status: data.status,
      token,
      tokenLength: token.length,
      storedToken: data.confirmationToken,
      storedTokenLength: data.confirmationToken?.length,
    });
  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
