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

// GET /api/user/[username] - Obtiene datos públicos de un usuario por username
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = params;
    console.log('[API] Obteniendo usuario:', username);

    const usersRef = collection(adminDb, 'users');
    const usernameLower = username.toLowerCase();

    // Buscar por campo username
    const qByUsername = query(usersRef, where('username', '==', usernameLower));
    const snapshotByUsername = await getDocs(qByUsername);

    console.log('[API] Snapshot por username:', snapshotByUsername.size);

    if (!snapshotByUsername.empty) {
      const userDoc = snapshotByUsername.docs[0];
      const data = userDoc.data();
      console.log('[API] Usuario encontrado:', data.displayName);
      return NextResponse.json({
        uid: userDoc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        username: data.username,
        bio: data.bio || null,
        photoURL: data.photoURL || null,
        headerPhotoURL: data.headerPhotoURL || null,
        primaryColor: data.primaryColor || null,
        secondaryColor: data.secondaryColor || null,
      });
    }

    // Fallback: buscar por displayName
    console.log('[API] Buscando por displayName:', username);
    const qByDisplayName = query(usersRef, where('displayName', '==', username));
    const snapshotByDisplayName = await getDocs(qByDisplayName);

    console.log('[API] Snapshot por displayName:', snapshotByDisplayName.size);

    if (!snapshotByDisplayName.empty) {
      const userDoc = snapshotByDisplayName.docs[0];
      const data = userDoc.data();
      console.log('[API] Usuario encontrado:', data.displayName);
      return NextResponse.json({
        uid: userDoc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        username: data.username || null,
        bio: data.bio || null,
        photoURL: data.photoURL || null,
        headerPhotoURL: data.headerPhotoURL || null,
        primaryColor: data.primaryColor || null,
        secondaryColor: data.secondaryColor || null,
      });
    }

    console.log('[API] Usuario no encontrado');
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  } catch (error: any) {
    console.error('[API] Error completo:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener usuario',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
