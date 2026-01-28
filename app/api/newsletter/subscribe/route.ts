import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const NEWSLETTER_COLLECTION = 'newsletter';

export const dynamic = 'force-dynamic';

interface SubscribeRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email }: SubscribeRequest = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe en Firestore usando Admin SDK
    const snapshot = await adminDb
      .collection(NEWSLETTER_COLLECTION)
      .where('email', '==', email)
      .get();

    let confirmationToken: string;

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();

      // Si ya está activo o pendiente
      if (existingData.status === 'active' || existingData.status === 'pending') {
        return NextResponse.json(
          { success: false, message: 'Este email ya está suscrito a la newsletter', alreadySubscribed: true },
          { status: 400 }
        );
      }

      // Si estaba desuscripto, reactivar
      if (existingData.status === 'unsubscribed') {
        confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await existingDoc.ref.update({
          status: 'pending',
          confirmationToken,
          subscribedAt: new Date(),
          confirmedAt: null,
          unsubscribedAt: null,
        });

        // Enviar email de confirmación (no fallar si error)
        try {
          const { sendConfirmationEmail } = await import('@/lib/email');
          await sendConfirmationEmail(email, confirmationToken);
        } catch (emailError) {
          console.error('[API] Error enviando email de confirmación:', emailError);
          // Continuar aunque falle el email
        }

        return NextResponse.json({
          success: true,
          message: '¡Gracias por volver! Te hemos enviado un email para confirmar tu suscripción',
        });
      }
    }

    // Nueva suscripción
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await adminDb.collection(NEWSLETTER_COLLECTION).add({
      email,
      status: 'pending',
      confirmationToken,
      unsubscribeToken,
      subscribedAt: new Date(),
    });

    // Enviar email de confirmación (no fallar si error)
    try {
      const { sendConfirmationEmail } = await import('@/lib/email');
      await sendConfirmationEmail(email, confirmationToken);
    } catch (emailError) {
      console.error('[API] Error enviando email de confirmación:', emailError);
      // No fallar la suscripción si falla el email
    }

    return NextResponse.json({
      success: true,
      message: '¡Gracias por suscribirte! Te hemos enviado un email para confirmar tu suscripción',
    });
  } catch (error) {
    console.error('[API] Error suscribiendo:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error al suscribirse. Por favor inténtalo de nuevo.'
      },
      { status: 500 }
    );
  }
}
