import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

const NEWSLETTER_COLLECTION = 'newsletter';

export interface NewsletterSubscriber {
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  confirmationToken: string;
  unsubscribeToken: string;
  subscribedAt?: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
}

// Generar token aleatorio
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Suscribir email a newsletter
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  try {
    // Verificar si ya existe
    const q = query(collection(db, NEWSLETTER_COLLECTION), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();

      // Si ya está activo o pendiente
      if (existingData.status === 'active' || existingData.status === 'pending') {
        return {
          success: false,
          message: 'Este email ya está suscrito a la newsletter',
          alreadySubscribed: true,
        };
      }

      // Si estaba desuscripto, reactivar
      if (existingData.status === 'unsubscribed') {
        await updateDoc(existingDoc.ref, {
          status: 'pending',
          confirmationToken: generateToken(),
          subscribedAt: new Date(),
          confirmedAt: null,
          unsubscribedAt: null,
        });

        // Enviar email de confirmación
        await sendConfirmationEmail(email, existingData.data().confirmationToken);

        return {
          success: true,
          message: '¡Gracias por volver! Te hemos enviado un email para confirmar tu suscripción',
        };
      }
    }

    // Nueva suscripción
    const confirmationToken = generateToken();
    const unsubscribeToken = generateToken();

    await addDoc(collection(db, NEWSLETTER_COLLECTION), {
      email,
      status: 'pending',
      confirmationToken,
      unsubscribeToken,
      subscribedAt: new Date(),
    });

    // Enviar email de confirmación
    await sendConfirmationEmail(email, confirmationToken);

    return {
      success: true,
      message: '¡Gracias por suscribirte! Te hemos enviado un email para confirmar tu suscripción',
    };
  } catch (error) {
    console.error('[Newsletter] Error suscribiendo:', error);
    return {
      success: false,
      message: 'Error al suscribirse. Por favor inténtalo de nuevo.',
    };
  }
}

// Confirmar suscripción (double opt-in)
export async function confirmSubscription(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, NEWSLETTER_COLLECTION), where('confirmationToken', '==', token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: 'Token de confirmación inválido',
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.status === 'active') {
      return {
        success: true,
        message: 'Tu suscripción ya estaba confirmada',
      };
    }

    await updateDoc(doc.ref, {
      status: 'active',
      confirmedAt: new Date(),
    });

    return {
      success: true,
      message: '¡Suscripción confirmada! Ahora recibirás nuestras actualizaciones',
    };
  } catch (error) {
    console.error('[Newsletter] Error confirmando:', error);
    return {
      success: false,
      message: 'Error al confirmar suscripción',
    };
  }
}

// Desuscribirse
export async function unsubscribeFromNewsletter(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, NEWSLETTER_COLLECTION), where('unsubscribeToken', '==', token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: 'Token de cancelación inválido',
      };
    }

    const doc = snapshot.docs[0];

    await updateDoc(doc.ref, {
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
    });

    return {
      success: true,
      message: 'Te has dado de baja de la newsletter correctamente',
    };
  } catch (error) {
    console.error('[Newsletter] Error desuscribiendo:', error);
    return {
      success: false,
      message: 'Error al cancelar suscripción',
    };
  }
}

// Obtener todos los suscriptores activos
export async function getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const q = query(
      collection(db, NEWSLETTER_COLLECTION),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      email: doc.data().email,
      status: doc.data().status,
      ...(doc.data() as Omit<NewsletterSubscriber, 'email' | 'status'>),
    })) as NewsletterSubscriber[];
  } catch (error) {
    console.error('[Newsletter] Error obteniendo suscriptores:', error);
    return [];
  }
}

// Enviar email de confirmación (mock - se implementará con Resend/SendGrid después)
async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const baseUrl = 'https://www.diariodeuninstante.com';
  const confirmUrl = `${baseUrl}/newsletter/confirm?token=${token}`;

  console.log('[Newsletter] Email de confirmación para:', email);
  console.log('[Newsletter] URL de confirmación:', confirmUrl);

  // TODO: Implementar con Resend o SendGrid
  // Por ahora, solo loggear

  /*
  Ejemplo de implementación futura con Resend:
  await resend.emails.send({
    from: 'Diario de un Instante <newsletter@diariodeuninstante.com>',
    to: email,
    subject: 'Confirma tu suscripción',
    html: `
      <h1>Confirma tu suscripción</h1>
      <p>Gracias por suscribirte a Diario de un Instante.</p>
      <p>Haz clic en el siguiente enlace para confirmar:</p>
      <a href="${confirmUrl}">Confirmar suscripción</a>
    `
  });
  */
}
