import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogConfig, getUserByUsername, getPublicInstantesByUser } from '@/lib/firestore';
import InstanteCard from '@/components/InstanteCard';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// No pre-generar ninguna página estática
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: {
    username: string;
  };
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Durante build, retornar metadata genérica
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
    return {
      title: 'Diario de un Instante',
    };
  }

  try {
    const user = await getUserByUsername(params.username);

    if (!user) {
      return {
        title: 'Usuario no encontrado',
      };
    }

    const blogConfig = await getBlogConfig(user.uid);

    return {
      title: `Diario de un Instante de ${blogConfig?.displayName || user.displayName || params.username}`,
      description: blogConfig?.bio || `Los instantes públicos de ${blogConfig?.displayName || user.displayName || params.username}`,
    };
  } catch (error) {
    return {
      title: 'Diario de un Instante',
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  // Saltar durante build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  try {
    // Buscar usuario por username
    const user = await getUserByUsername(params.username);

    if (!user) {
      notFound();
    }

    // Obtener configuración del blog
    const blogConfig = await getBlogConfig(user.uid);

    // Obtener instantes públicos del usuario
    const instantes = await getPublicInstantesByUser(user.uid);

    // Aplicar colores personalizados
  const primaryColor = blogConfig?.primaryColor || '#8b5cf6';
  const secondaryColor = blogConfig?.secondaryColor || '#f5f3ff';

  return (
    <div className="min-h-screen">
      {/* Cabecera del blog */}
      <div className="relative">
        {/* Foto de cabecera */}
        {blogConfig?.headerPhotoURL ? (
          <div className="w-full h-48 sm:h-64 relative">
            <img
              src={blogConfig.headerPhotoURL}
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
            {blogConfig?.photoURL ? (
              <img
                src={blogConfig.photoURL}
                alt={blogConfig.displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl border-4 border-white"
                style={{ backgroundColor: primaryColor }}
              >
                {(blogConfig?.displayName || user.displayName || '?').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Nombre y bio */}
            <div className="flex-1 pb-2">
              <h1
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
              >
                Diario de un Instante de {blogConfig?.displayName || user.displayName}
              </h1>
              {blogConfig?.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{blogConfig.bio}</p>
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
              {blogConfig?.displayName || user.displayName} aún no ha publicado ningún instante público.
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
              {instantes.map((instante) => (
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
} catch (error) {
  console.error('Error loading user profile:', error);
  notFound();
}
}
