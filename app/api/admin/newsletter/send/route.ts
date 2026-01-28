import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getActiveSubscribers } from '@/lib/newsletter';
import { generateNewsletterHTML, sendNewsletter } from '@/lib/email';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NEWSLETTERS_SENT_COLLECTION = 'newsletters_sent';

export const dynamic = 'force-dynamic';

interface SendRequest {
  subject: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    // Parsear request
    const { subject, content }: SendRequest = await request.json();

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Asunto y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Obtener suscriptores activos
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No hay suscriptores activos' },
        { status: 400 }
      );
    }

    // Generar HTML del newsletter
    const htmlContent = generateNewsletterHTML(
      subject,
      content,
      'https://www.diariodeuninstante.com/newsletter/unsubscribe?token=UNSUBSCRIBE_TOKEN'
    );

    // NOTA: Como cada suscriptor tiene su propio unsubscribeToken,
    // necesitamos enviar los emails individualmente.
    // Para producción con muchos suscriptores, usar un job en cola.

    const emails = subscribers.map((s) => s.email);
    const result = await sendNewsletter(emails, subject, htmlContent, 'dummy');

    // Guardar registro en Firestore
    await addDoc(collection(db, NEWSLETTERS_SENT_COLLECTION), {
      subject,
      content,
      sentTo: emails.length,
      successful: result.successful,
      failed: result.failed,
      sentAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      sent: result.successful,
      failed: result.failed,
      total: result.total,
    });
  } catch (error) {
    console.error('[API] Error enviando newsletter:', error);

    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Error al enviar newsletter' },
      { status: 500 }
    );
  }
}
