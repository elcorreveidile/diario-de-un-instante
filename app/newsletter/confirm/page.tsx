import { notFound } from 'next/navigation';
import Link from 'next/link';
import { confirmSubscription } from '@/lib/newsletter';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

interface ConfirmPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { token } = searchParams;

  if (!token) {
    notFound();
  }

  const result = await confirmSubscription(token);

  // Enviar email de bienvenida si la confirmación fue exitosa
  if (result.success && result.email) {
    try {
      await sendWelcomeEmail(result.email);
    } catch (error) {
      console.error('[Newsletter] Error enviando welcome:', error);
      // No fallar la página si falla el email
    }
  }

  return (
    <div className="container-page max-w-2xl">
      <div className="py-20">
        <div className={`p-8 rounded-xl border-2 ${
          result.success
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="text-center">
            {result.success ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
                  ¡Suscripción confirmada!
                </h1>
                <p className="text-lg text-emerald-700 dark:text-emerald-300 mb-8">
                  {result.message}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Ir al inicio
                </Link>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">
                  Error al confirmar
                </h1>
                <p className="text-lg text-red-700 dark:text-red-300 mb-8">
                  {result.message}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Volver al inicio
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
