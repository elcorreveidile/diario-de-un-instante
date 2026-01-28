import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const NEWSLETTER_COLLECTION = 'newsletter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Verificar que es admin
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userDoc.exists || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden ver suscriptores.' },
        { status: 403 }
      );
    }

    // Obtener suscriptores activos usando Admin SDK
    const snapshot = await adminDb
      .collection(NEWSLETTER_COLLECTION)
      .where('status', '==', 'active')
      .get();

    const subscribers = snapshot.docs.map(doc => {
      const data = doc.data();
      const subscribedAt = data.subscribedAt?.toDate ? data.subscribedAt.toDate() : data.subscribedAt;
      const confirmedAt = data.confirmedAt?.toDate ? data.confirmedAt.toDate() : data.confirmedAt;

      return {
        email: data.email,
        status: data.status,
        subscribedAt,
        confirmedAt,
      };
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('[API] Error obteniendo suscriptores:', error);

    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Error al obtener suscriptores' },
      { status: 500 }
    );
  }
}
