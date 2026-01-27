'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAllInstantes, getAreaInfo, Instante } from '@/lib/firestore';
import { remark } from 'remark';
import html from 'remark-html';
import { useHotkeys } from 'react-hotkeys-hook';

export default function InstantePage() {
  const params = useParams();
  const areaId = params.area as string;
  const slug = params.slug as string;

  const [instante, setInstante] = useState<Instante | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  const areaInfo = getAreaInfo(areaId);

  useEffect(() => {
    const loadInstante = async () => {
      try {
        const allInstantes = await getAllInstantes();
        // Filtrar: por área Y slug Y (públicos O sin campo privado) Y (publicados O sin campo estado)
        const instante = allInstantes.find(i => {
          const matchArea = i.area === areaId;
          const matchSlug = i.slug === slug;
          const esPublico = i.privado === false || !i.hasOwnProperty('privado');
          const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
          return matchArea && matchSlug && esPublico && esVisible;
        });

        if (!instante) {
          setNotFoundState(true);
          return;
        }
        setInstante(instante);

        // Convertir Markdown a HTML
        const processedContent = await remark()
          .use(html)
          .process(instante.content);
        let contentHtml = processedContent.toString();
        // Añadir target="_blank" y rel="noopener" a todos los enlaces
        contentHtml = contentHtml.replace(/<a href=/g, '<a target="_blank" rel="noopener" href=');
        setContentHtml(contentHtml);
      } catch (error) {
        console.error('Error cargando instante:', error);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    };

    loadInstante();
  }, [areaId, slug]);

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

  if (!areaInfo) {
    notFound();
  }

  if (loading) {
    return (
      <div className="container-page max-w-3xl">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando instante...</p>
        </div>
      </div>
    );
  }

  if (notFoundState || !instante) {
    notFound();
  }

  return (
    <>
      <div className="container-page max-w-3xl">
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
              <time
                dateTime={instante.fecha}
                className="text-sm text-gray-400 dark:text-gray-500"
              >
                {format(new Date(instante.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </time>
            </header>
          )}

          {/* Contenido */}
          <div
            className={`prose-instante ${zenMode ? 'zen-content' : ''}`}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </div>

      {/* Botón flotante para modo zen */}
      <button
        onClick={() => setZenMode(!zenMode)}
        className={`fixed bottom-20 right-6 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
          zenMode
            ? 'bg-gray-800 hover:bg-gray-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        title={zenMode ? 'Salir del modo zen (Esc)' : 'Modo zen (⌘⇧Z)'}
      >
        {zenMode ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Zen</span>
          </span>
        )}
      </button>

      {/* Atajo de teclado para salir */}
      {zenMode && (
        <div className="fixed bottom-6 left-6 z-50 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
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
