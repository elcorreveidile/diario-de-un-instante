import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Helper para verificar que el requestor es admin
async function verifyAdmin(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    // Verificar token y obtener UID
    const decoded = await adminAuth.verifyIdToken(token);

    // Verificar que sea admin
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return null;
    }

    return decoded.uid;
  } catch (error) {
    console.error('Error verificando admin:', error);
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    // Verificar que el requestor es admin
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { uid } = params;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID es requerido' },
        { status: 400 }
      );
    }

    // 1. Eliminar de Firebase Authentication
    try {
      await adminAuth.deleteUser(uid);
      console.log(`[Admin] Usuario ${uid} eliminado de Firebase Auth`);
    } catch (error: any) {
      // Si el usuario no existe en Auth, continuar con Firestore
      if (error.code !== 'auth/user-not-found') {
        console.error('[Admin] Error eliminando de Auth:', error);
        throw error;
      }
      console.log(`[Admin] Usuario ${uid} no existía en Firebase Auth, continuando...`);
    }

    // 2. Eliminar documento de Firestore
    await adminDb.collection('users').doc(uid).delete();
    console.log(`[Admin] Usuario ${uid} eliminado de Firestore`);

    // 3. Opcional: Eliminar todos los instantes del usuario
    const instantesSnapshot = await adminDb
      .collection('instantes')
      .where('userId', '==', uid)
      .get();

    if (!instantesSnapshot.empty) {
      const batch = adminDb.batch();
      instantesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`[Admin] ${instantesSnapshot.size} instantes eliminados`);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado completamente (Auth + Firestore + instantes)'
    });

  } catch (error: any) {
    console.error('[Admin] Error eliminando usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
