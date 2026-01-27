'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllInstantes, getAreaInfo, Instante } from '@/lib/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BuscarPage() {
  const [instantes, setInstantes] = useState<Instante[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadInstantes = async () => {
      try {
        const allInstantes = await getAllInstantes();
        // Filtrar solo instantes visibles
        const instantesFiltrados = allInstantes.filter(i => {
          const esPublico = i.privado === false || !i.hasOwnProperty('privado');
          const esVisible = i.estado === 'publicado' || !i.hasOwnProperty('estado');
          return esPublico && esVisible;
        });
        setInstantes(instantesFiltrados);
      } catch (error) {
        console.error('Error cargando instantes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInstantes();
  }, []);

  // Filtrar instantes basado en la búsqueda
  const resultados = useMemo(() => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();

    return instantes.filter(instante => {
      const tituloMatch = instante.titulo.toLowerCase().includes(queryLower);
      const contenidoMatch = instante.content.toLowerCase().includes(queryLower);
      const area = getAreaInfo(instante.area);
      const areaMatch = area?.nombre.toLowerCase().includes(queryLower);

      return tituloMatch || contenidoMatch || areaMatch;
    });
  }, [instantes, query]);

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Buscar
        </h1>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en tus instantes..."
            className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Result count */}
        {query && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para &quot;{query}&quot;
          </p>
        )}
      </header>

      {/* No query state */}
      {!query && (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Empieza a escribir para buscar
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Busca por título, contenido o área
          </p>
        </div>
      )}

      {/* No results */}
      {query && resultados.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No se encontraron resultados
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Intenta con otros términos
          </p>
        </div>
      )}

      {/* Results */}
      {query && resultados.length > 0 && (
        <div className="space-y-4">
          {resultados.map((instante) => {
            const area = getAreaInfo(instante.area);
            return (
              <Link
                key={instante.id}
                href={`/${instante.area}/${instante.slug}`}
                className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Area emoji */}
                  <span className="text-3xl flex-shrink-0">{area?.emoji}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        instante.tipo === 'accion'
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                      }`}>
                        {instante.tipo === 'accion' ? 'Acción' : 'Pensamiento'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {area?.nombre}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(instante.fecha), 'd MMM yyyy', { locale: es })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {instante.titulo}
                    </h3>

                    {/* Preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {instante.content.slice(0, 200)}...
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
