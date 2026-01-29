import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario en Firestore por email
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersSnapshot.empty) {
      // No mostrar error específico por seguridad
      return NextResponse.json({
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar si el usuario tiene invitación válida O es admin
    const isAdmin = userData.role === 'admin';

    if (!isAdmin && !userData.inviteId) {
      // Usuario no válido - no enviar email
      console.warn(`Intento de reset de password por usuario sin invitación válida: ${email}`);
      return NextResponse.json({
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    }

    // Usuario válido - enviar email de recuperación
    const link = await adminAuth.generatePasswordResetLink(email);

    // TODO: Enviar email real usando tu sistema de emails (lib/email.ts)
    // Por ahora, retornar el link para desarrollo/testing
    console.log('Password reset link:', link);

    return NextResponse.json({
      message: 'Si el email existe, se enviará un enlace de recuperación',
      // Devolver link solo en desarrollo para testing
      ...(process.env.NODE_ENV === 'development' && { link })
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
