import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/debug/users - Obtiene todos los usuarios (solo para debug)
export async function GET() {
  try {
    console.log('[API Debug] Iniciando petición con Firebase Admin SDK');
    console.log('[API Debug] adminDb inicializado:', !!adminDb);

    const usersRef = collection(adminDb, 'users');
    console.log('[API Debug] Referencia a colección creada');

    const snapshot = await getDocs(usersRef);
    console.log('[API Debug] Snapshot obtenido, tamaño:', snapshot.size);

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[API Debug] Usuarios mapeados:', users.length);
    console.log('[API Debug] Primer usuario (si existe):', users[0]?.email || 'N/A');

    return NextResponse.json(users);

  } catch (error: any) {
    console.error('[API Debug] Error completo:', error);
    console.error('[API Debug] Mensaje:', error.message);
    console.error('[API Debug] Código:', error.code);
    console.error('[API Debug] Stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Error al obtener usuarios',
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
