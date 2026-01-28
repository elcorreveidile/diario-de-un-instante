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

// Confirmar suscripción (double opt-in)
export async function confirmSubscription(token: string): Promise<{ success: boolean; message: string; email?: string }> {
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
        email: data.email,
      };
    }

    await updateDoc(doc.ref, {
      status: 'active',
      confirmedAt: new Date(),
    });

    return {
      success: true,
      message: '¡Suscripción confirmada! Ahora recibirás nuestras actualizaciones',
      email: data.email,
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
