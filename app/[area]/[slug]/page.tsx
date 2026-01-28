'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAllInstantes, getInstantesByUser, getAreaInfo, Instante, toggleLike } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { remark } from 'remark';
import html from 'remark-html';
import { useHotkeys } from 'react-hotkeys-hook';

export default function InstantePage() {
  const params = useParams();
  const areaId = params.area as string;
  const slug = params.slug as string;
  const { user } = useAuth();

  const [instante, setInstante] = useState<Instante | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  const areaInfo = getAreaInfo(areaId);

  // Verificar si el usuario actual dio like
  const userHasLiked = user && instante?.likes && instante.likes.includes(user.uid);

  const handleLike = async () => {
    if (!user || !instante?.id) {
      return;
    }

    setLoadingLike(true);
    try {
      const result = await toggleLike(instante.id, user.uid);
      setLikeCount(result.likeCount);
      setIsLiked(result.liked);
      // Actualizar el instante localmente
      setInstante({
        ...instante,
        likes: result.liked
          ? [...(instante.likes || []), user.uid]
          : (instante.likes || []).filter(uid => uid !== user.uid),
        likeCount: result.likeCount,
      });
    } catch (error) {
      console.error('Error al dar like:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  console.log('[InstantePage] Render - User:', user?.uid, 'loading:', loading, 'instante:', instante?.titulo);

  useEffect(() => {
    let cancelled = false;

    const loadInstante = async () => {
      if (cancelled) return;

      setLoading(true);
      setIsNotFound(false);
      setInstante(null);

      try {
        let allInstantes: Instante[];

        console.log('[InstantePage] Cargando - User:', user?.uid, 'Buscando:', areaId, slug);

        // Si hay usuario logueado, obtener sus instantes (incluyendo privados)
        if (user?.uid) {
          const userInstantes = await getInstantesByUser(user.uid);
          console.log('[InstantePage] Instantes del usuario:', userInstantes.length);
          // Obtener también los instantes públicos de otros usuarios
          const publicInstantes = await getAllInstantes();
          // Combinar sin duplicados
          allInstantes = [...userInstantes, ...publicInstantes.filter(i => !userInstantes.find(ui => ui.id === i.id))];
        } else {
          // Si no hay usuario logueado, solo obtener instantes públicos
          allInstantes = await getAllInstantes();
        }

        console.log('[InstantePage] Total instantes:', allInstantes.length);

        // Buscar el instante
        const found = allInstantes.find(i => {
          const matchArea = i.area === areaId;
          const matchSlug = i.slug === slug;
          const esPublico = i.privado === false || !i.hasOwnProperty('privado');
          const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
          const esDelUsuario = user?.uid && i.userId === user.uid;

          console.log('[InstantePage] Checking', i.slug, {
            matchArea,
            matchSlug,
            esPublico,
            esVisible,
            esDelUsuario,
            userId: i.userId,
            privado: i.privado,
          });

          return matchArea && matchSlug && (esPublico || esDelUsuario) && esVisible;
        });

        if (cancelled) return;

        if (!found) {
          console.log('[InstantePage] No encontrado');
          setIsNotFound(true);
          setLoading(false);
          return;
        }

        console.log('[InstantePage] Encontrado:', found.titulo);
        setInstante(found);
        setLikeCount(found.likeCount || 0);
        setIsLiked(user?.uid && found.likes ? found.likes.includes(user.uid) : false);

        // Convertir Markdown a HTML
        const processedContent = await remark()
          .use(html)
          .process(found.content) as any;
        let htmlContent = processedContent.toString();
        htmlContent = htmlContent.replace(/<a href=/g, '<a target="_blank" rel="noopener" href=');
        setContentHtml(htmlContent);
        setLoading(false);

      } catch (error) {
        console.error('[InstantePage] Error:', error);
        if (!cancelled) {
          setIsNotFound(true);
          setLoading(false);
        }
      }
    };

    loadInstante();

    return () => {
      cancelled = true;
    };
  }, [areaId, slug, user?.uid]); // Solo dependemos de user.uid, no del objeto user completo

  // Atajo de teclado: Cmd/Ctrl + Shift + Z para modo zen
  useHotkeys('mod+shift+z', () => {
    setZenMode(!zenMode);
  });

  // Atajo de teclado: Esc para salir del modo zen
  useHotkeys('escape', () => {
    if (zenMode) {
      setZenMode(false);
    }
  });

  // Efecto: bloquear scroll cuando zen mode está activo
  useEffect(() => {
    if (zenMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [zenMode]);

  // Efecto: Actualizar meta tags OG cuando se carga el instante
  useEffect(() => {
    if (!instante || !areaInfo) return;

    const ogImageUrl = `${window.location.origin}/api/og/instante/${instante.id}`;
    const title = instante.titulo;
    const description = instante.content.replace(/[#*`\[\]]/g, '').substring(0, 150) + '...';

    // Actualizar o crear meta tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setNameTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Open Graph tags
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', ogImageUrl);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
    setMetaTag('og:type', 'article');
    setMetaTag('og:url', window.location.href);
    setMetaTag('og:site_name', 'Diario de un Instante');

    // Twitter Card tags
    setNameTag('twitter:card', 'summary_large_image');
    setNameTag('twitter:title', title);
    setNameTag('twitter:description', description);
    setNameTag('twitter:image', ogImageUrl);

    // Actualizar título de la página
    document.title = `${title} | ${areaInfo.nombre} - Diario de un Instante`;

    // Cleanup
    return () => {
      // No hacemos cleanup porque los meta tags deben persistir
    };
  }, [instante, areaInfo]);

  if (!areaInfo) {
    notFound();
  }

  if (loading) {
    return (
      <div className="container-page max-w-3xl">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando instante...</p>
          {/* Debug info */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left">
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
              [DEBUG] Usuario: {user?.uid || 'cargando auth...'}
            </p>
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
              [DEBUG] Buscando: {areaId}/{slug}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !instante) {
    return (
      <div className="container-page max-w-3xl">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Página no encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El instante que buscas no existe o ha sido movido. Quizás este momento aún está por escribirse.
          </p>

          {/* Debug info */}
          <div className="max-w-md mx-auto p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left mb-6">
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 mb-2">
              [DEBUG] Usuario: {user?.uid || 'no autenticado'}
            </p>
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 mb-2">
              [DEBUG] Buscando: {areaId}/{slug}
            </p>
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 mb-2">
              [DEBUG] isNotFound: {isNotFound.toString()}
            </p>
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 mb-2">
              [DEBUG] instante: {instante ? instante.titulo : 'null'}
            </p>
          </div>

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

  return (
    <>
      <div className="container-page max-w-3xl relative">
        {!zenMode && (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                    Inicio
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href={`/${areaId}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                    {areaInfo.nombre}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                  {instante.titulo}
                </li>
              </ol>
            </nav>

            {/* Navegación */}
            <nav className="mb-4 flex justify-between">
              <Link
                href={`/${areaId}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a {areaInfo.nombre}
              </Link>
              <Link
                href="/archivo"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Ver archivo completo
              </Link>
            </nav>
          </>
        )}

        {/* Artículo */}
        <article className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 ${zenMode ? 'zen-mode' : ''}`}>
          {!zenMode && (
            <header className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
              {/* Área y tipo */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{areaInfo.emoji}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{areaInfo.nombre}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  instante.tipo === 'accion'
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                }`}>
                  {instante.tipo === 'accion' ? 'Acción' : 'Pensamiento'}
                </span>
              </div>

              {/* Título */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {instante.titulo}
              </h1>

              {/* Fecha */}
              <div className="flex items-center justify-between">
                <time
                  dateTime={instante.fecha}
                  className="text-sm text-gray-400 dark:text-gray-500"
                >
                  {format(new Date(instante.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </time>

                {/* Botón de like */}
                <button
                  onClick={handleLike}
                  disabled={!user || loadingLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    userHasLiked || isLiked
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''} ${loadingLike ? 'opacity-70' : ''}`}
                  title={user ? (userHasLiked || isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={userHasLiked || isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{likeCount}</span>
                </button>
              </div>
            </header>
          )}

          {/* Contenido */}
          <div
            className={`prose-instante ${zenMode ? 'zen-content' : ''}`}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>

      {/* Botón flotante para modo zen - FUERA del container */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <button
          onClick={() => setZenMode(!zenMode)}
          className={`px-4 py-3 rounded-full shadow-xl transition-all border-2 ${
            zenMode
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
              : 'bg-violet-700 hover:bg-violet-800 text-white border-violet-800'
          }`}
          title={zenMode ? 'Salir del modo zen (Esc)' : 'Modo zen (⌘⇧Z)'}
        >
          {zenMode ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline font-medium">Salir</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline font-medium">Zen</span>
            </span>
          )}
        </button>
      </div>

      {/* Atajo de teclado para salir */}
      {zenMode && (
        <div className="fixed bottom-6 right-6 z-[100] text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Esc</kbd> o <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">⌘⇧Z</kbd> para salir
        </div>
      )}

      <style jsx>{`
        .zen-mode {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0;
          max-width: none;
          border-radius: 0;
          z-index: 40;
          overflow-y: auto;
          padding: 2rem;
          background: white;
        }

        .dark .zen-mode {
          background: #111827;
        }

        .zen-content {
          font-size: 1.25rem;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto;
          padding-top: 2rem;
        }

        .zen-content h1,
        .zen-content h2,
        .zen-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .zen-content p {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </>
  );
}
