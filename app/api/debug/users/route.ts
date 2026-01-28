import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/debug/users - Obtiene todos los usuarios (solo para debug)
export async function GET() {
  try {
    console.log('[API Debug] Obteniendo todos los usuarios');

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('[API Debug] Usuarios encontrados:', users.length);

    return NextResponse.json(users);

  } catch (error: any) {
    console.error('[API Debug] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener usuarios',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
