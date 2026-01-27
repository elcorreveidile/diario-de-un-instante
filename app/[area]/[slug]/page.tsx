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

export default function InstantePage() {
  const params = useParams();
  const areaId = params.area as string;
  const slug = params.slug as string;

  const [instante, setInstante] = useState<Instante | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const areaInfo = getAreaInfo(areaId);

  useEffect(() => {
    const loadInstante = async () => {
      try {
        const allInstantes = await getAllInstantes();
        // Filtrar: por área Y slug Y (públicos O sin campo privado) Y (publicados O sin campo estado)
        const instante = allInstantes.find(i => {
          const matchArea = i.area === areaId;
          const matchSlug = i.slug === slug;
          const esPublico = !i.privado || i.privado === false;
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
        setContentHtml(processedContent.toString());
      } catch (error) {
        console.error('Error cargando instante:', error);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    };

    loadInstante();
  }, [areaId, slug]);

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
    <div className="container-page max-w-3xl">
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

      {/* Artículo */}
      <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8">
        {/* Header */}
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

        {/* Contenido */}
        <div
          className="prose-instante"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* Navegación */}
      <nav className="mt-8 flex justify-between">
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
    </div>
  );
}
