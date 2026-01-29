import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
        { error: 'Solo administradores pueden enviar emails de verificación' },
        { status: 403 }
      );
    }

    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID del usuario es requerido' },
        { status: 400 }
      );
    }

    // Obtener el usuario para enviar el email
    const userRecord = await adminAuth.getUser(uid);

    if (!userRecord || !userRecord.email) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin email' },
        { status: 404 }
      );
    }

    if (userRecord.emailVerified) {
      return NextResponse.json(
        { error: 'El email ya está verificado' },
        { status: 400 }
      );
    }

    // Extraer email con type assertion
    const email = userRecord.email;

    // Generar enlace de verificación
    const verificationLink = await adminAuth.generateEmailVerificationLink(uid);

    // Usar Resend para enviar el email
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verifica tu email - Diario de un Instante',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifica tu email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 10px;">
                  🌸 Diario de un Instante
                </h1>
              </div>

              <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px;">
                  Verifica tu email
                </h2>

                <p style="margin-bottom: 20px;">
                  Hola ${userRecord.displayName || userRecord.email},
                </p>

                <p style="margin-bottom: 20px;">
                  Gracias por registrarte en Diario de un Instante. Para completar tu registro, por favor verifica tu email haciendo clic en el botón de abajo:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                    Verificar mi email
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                  O copia y pega este enlace en tu navegador:
                </p>

                <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                  ${verificationLink}
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  Este enlace expirará en 24 horas.
                </p>
              </div>

              <div style="text-align: center; font-size: 12px; color: #9ca3af;">
                <p>Si no creaste una cuenta en Diario de un Instante, puedes ignorar este email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Admin] Email de verificación enviado a ${email}`);

    return NextResponse.json({
      success: true,
      message: `Email de verificación enviado a ${email}`,
    });
  } catch (error) {
    console.error('[API Admin] Error enviando verificación:', error);

    if (error instanceof Error && error.message.includes('Firebase ID token')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al enviar email de verificación',
      },
      { status: 500 }
    );
  }
}
