import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import InstanteCard from '@/components/InstanteCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    username: string;
  };
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${host}/api/user/${params.username}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        title: 'Usuario no encontrado - Diario de un Instante',
      };
    }

    const user = await res.json();

    return {
      title: `${user.displayName || params.username} - Diario de un Instante`,
      description: user.bio || `Los instantes públicos de ${user.displayName || params.username}`,
    };
  } catch (error) {
    return {
      title: 'Diario de un Instante',
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  // Obtener datos del usuario
  const userRes = await fetch(`${host}/api/user/${params.username}`, {
    cache: 'no-store',
  });

  if (!userRes.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
          <p className="text-gray-600 mb-6">
            El usuario <strong>{params.username}</strong> no existe o ha sido eliminado.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const user = await userRes.json();

  // Obtener instantes del usuario
  const instantesRes = await fetch(`${host}/api/user/${params.username}/instantes`, {
    cache: 'no-store',
  });
  const instantes = instantesRes.ok ? await instantesRes.json() : [];

  const primaryColor = user.primaryColor || '#8b5cf6';
  const secondaryColor = user.secondaryColor || '#f5f3ff';

  return (
    <div className="min-h-screen">
      {/* Cabecera del blog */}
      <div className="relative">
        {/* Foto de cabecera */}
        {user.headerPhotoURL ? (
          <div className="w-full h-48 sm:h-64 relative">
            <img
              src={user.headerPhotoURL}
              alt="Cabecera"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ) : (
          <div
            className="w-full h-48 sm:h-64"
            style={{ backgroundColor: secondaryColor }}
          ></div>
        )}

        {/* Foto de perfil y nombre */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 mb-6 flex items-end gap-6">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl border-4 border-white"
                style={{ backgroundColor: primaryColor }}
              >
                {(user.displayName || '?').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Nombre y bio */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Diario de un Instante de {user.displayName}
              </h1>
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Enlace al propio blog */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la home
            </Link>
          </div>
        </div>
      </div>

      {/* Instantes del usuario */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {instantes.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: secondaryColor }}
            >
              <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sin instantes públicos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user.displayName} aún no ha publicado ningún instante público.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Instantes públicos ({instantes.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {instantes.map((instante: any) => (
                <InstanteCard
                  key={instante.id}
                  instante={instante}
                  showArea={true}
                  showUser={false}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-violet-600 hover:text-violet-700">
              Diario de un Instante
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
