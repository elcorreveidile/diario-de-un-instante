import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_COOKIE = '__auth_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 días

// POST /api/auth/session — crea la cookie de sesión a partir del ID token de Firebase
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'idToken requerido' }, { status: 400 });
    }

    // Verificar el token con Firebase Admin
    await adminAuth.verifyIdToken(idToken);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Session] Error creando sesión:', error);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

// DELETE /api/auth/session — elimina la cookie de sesión (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
