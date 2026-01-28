import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email';

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

    // Verificar si ya existe en Firestore
    const { getFirestore } = await import('firebase/firestore');
    const { collection, query, where, getDocs, updateDoc, doc, addDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const q = query(collection(db, NEWSLETTER_COLLECTION), where('email', '==', email));
    const snapshot = await getDocs(q);

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

        await updateDoc(existingDoc.ref, {
          status: 'pending',
          confirmationToken,
          subscribedAt: new Date(),
          confirmedAt: null,
          unsubscribedAt: null,
        });

        // Enviar email de confirmación
        await sendConfirmationEmail(email, confirmationToken);

        return NextResponse.json({
          success: true,
          message: '¡Gracias por volver! Te hemos enviado un email para confirmar tu suscripción',
        });
      }
    }

    // Nueva suscripción
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await addDoc(collection(db, NEWSLETTER_COLLECTION), {
      email,
      status: 'pending',
      confirmationToken,
      unsubscribeToken,
      subscribedAt: new Date(),
    });

    // Enviar email de confirmación
    await sendConfirmationEmail(email, confirmationToken);

    return NextResponse.json({
      success: true,
      message: '¡Gracias por suscribirte! Te hemos enviado un email para confirmar tu suscripción',
    });
  } catch (error) {
    console.error('[API] Error suscribiendo:', error);
    return NextResponse.json(
      { success: false, message: 'Error al suscribirse. Por favor inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
