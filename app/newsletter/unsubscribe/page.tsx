import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unsubscribeFromNewsletter } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

interface UnsubscribePageProps {
  searchParams: {
    token?: string;
  };
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = searchParams;

  if (!token) {
    notFound();
  }

  const result = await unsubscribeFromNewsletter(token);

  return (
    <div className="container-page max-w-2xl">
      <div className="py-20">
        <div className={`p-8 rounded-xl border-2 ${
          result.success
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="text-center">
            {result.success ? (
              <>
                <div className="text-6xl mb-4">👋</div>
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                  Te has dado de baja
                </h1>
                <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">
                  {result.message}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-8">
                  Lamentamos que te vayas. Esperamos verte de nuevo pronto.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Volver al inicio
                </Link>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">
                  Error al cancelar
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
