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
        { error: 'Acceso denegado. Solo administradores pueden ver usuarios.' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios de Firestore
    const usersSnapshot = await adminDb.collection('users').get();

    const users = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Obtener emailVerified actualizado desde Firebase Auth
        let emailVerified = false;
        try {
          const userRecord = await adminAuth.getUser(doc.id);
          emailVerified = userRecord.emailVerified || false;
        } catch (error) {
          console.error(`Error obteniendo usuario ${doc.id} desde Auth:`, error);
          // Si no existe en Auth, usar el valor de Firestore o false
          emailVerified = data.emailVerified || false;
        }

        // Convertir fecha a timestamp para serialización JSON
        const createdAt = data.createdAt?.toDate?.() || new Date();

        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          username: data.username,
          role: data.role || 'user',
          createdAt: createdAt.getTime(), // Devolver como timestamp (número)
          emailVerified,
        };
      })
    );

    // Ordenar por createdAt descendente
    users.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('[API Admin Users] Error:', error);

    if (error instanceof Error && error.message.includes('Firebase ID token')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener usuarios',
      },
      { status: 500 }
    );
  }
}
