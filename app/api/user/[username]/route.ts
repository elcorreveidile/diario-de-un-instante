import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    const usersRef = collection(db, 'users');
    const usernameLower = username.toLowerCase();

    // Buscar por campo username
    const qByUsername = query(usersRef, where('username', '==', usernameLower));
    const snapshotByUsername = await getDocs(qByUsername);

    if (!snapshotByUsername.empty) {
      const userDoc = snapshotByUsername.docs[0];
      const data = userDoc.data();
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
    const qByDisplayName = query(usersRef, where('displayName', '==', username));
    const snapshotByDisplayName = await getDocs(qByDisplayName);

    if (!snapshotByDisplayName.empty) {
      const userDoc = snapshotByDisplayName.docs[0];
      const data = userDoc.data();
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

    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario', details: error.message },
      { status: 500 }
    );
  }
}
