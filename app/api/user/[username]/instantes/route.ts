import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase-admin/firestore';
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

    // Primero obtener el UID del usuario
    const usersRef = collection(adminDb, 'users');
    const usernameLower = username.toLowerCase();

    const qByUsername = query(usersRef, where('username', '==', usernameLower));
    const snapshotByUsername = await getDocs(qByUsername);

    let userUid: string | null = null;

    if (!snapshotByUsername.empty) {
      userUid = snapshotByUsername.docs[0].id;
    } else {
      // Fallback por displayName
      const qByDisplayName = query(usersRef, where('displayName', '==', username));
      const snapshotByDisplayName = await getDocs(qByDisplayName);
      if (!snapshotByDisplayName.empty) {
        userUid = snapshotByDisplayName.docs[0].id;
      }
    }

    if (!userUid) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener instantes públicos del usuario
    const instantesRef = collection(adminDb, 'instantes');
    const q = query(instantesRef, where('userId', '==', userUid));
    const snapshot = await getDocs(q);

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
