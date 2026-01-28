import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    username: string;
  };
}

// GET /api/user/[username]/instantes - Obtiene instantes públicos de un usuario
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = params;
    console.log('[API] Obteniendo instantes de:', username);

    const usernameLower = username.toLowerCase();

    // Primero obtener el UID del usuario
    const snapshotByUsername = await adminDb
      .collection('users')
      .where('username', '==', usernameLower)
      .get();

    let userUid: string | null = null;

    if (!snapshotByUsername.empty) {
      userUid = snapshotByUsername.docs[0].id;
    } else {
      // Fallback por displayName
      const snapshotByDisplayName = await adminDb
        .collection('users')
        .where('displayName', '==', username)
        .get();
      if (!snapshotByDisplayName.empty) {
        userUid = snapshotByDisplayName.docs[0].id;
      }
    }

    if (!userUid) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener instantes públicos del usuario
    const snapshot = await adminDb
      .collection('instantes')
      .where('userId', '==', userUid)
      .get();

    const allInstantes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const publicInstantes = allInstantes.filter((i: any) => {
      const esPublico = i.privado === false || !i.hasOwnProperty('privado');
      const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
      return esPublico && esVisible;
    });

    return NextResponse.json(publicInstantes);

  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener instantes', details: error.message },
      { status: 500 }
    );
  }
}
