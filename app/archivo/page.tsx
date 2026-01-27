'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAllInstantes, Instante, AREAS, AreaId } from '@/lib/firestore';
import InstanteCard from '@/components/InstanteCard';

export default function ArchivoPage() {
  const [instantes, setInstantes] = useState<Instante[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroArea, setFiltroArea] = useState<AreaId | 'todos'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'pensamiento' | 'accion'>('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const loadInstantes = async () => {
      try {
        const allInstantes = await getAllInstantes();
        // Filtrar: solo (públicos O sin campo privado) Y (publicados O sin campo estado)
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

  // Aplicar filtros
  const instantesFiltrados = useMemo(() => {
    return instantes.filter(instante => {
      // Filtro por área
      if (filtroArea !== 'todos' && instante.area !== filtroArea) {
        return false;
      }

      // Filtro por tipo
      if (filtroTipo !== 'todos' && instante.tipo !== filtroTipo) {
        return false;
      }

      // Filtro por rango de fechas
      if (fechaInicio && new Date(instante.fecha) < new Date(fechaInicio)) {
        return false;
      }
      if (fechaFin && new Date(instante.fecha) > new Date(fechaFin)) {
        return false;
      }

      return true;
    });
  }, [instantes, filtroArea, filtroTipo, fechaInicio, fechaFin]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroArea('todos');
    setFiltroTipo('todos');
    setFechaInicio('');
    setFechaFin('');
  };

  // Agrupar por mes para mejor organización
  const instantesPorMes = instantesFiltrados.reduce((acc, instante) => {
    const mes = format(new Date(instante.fecha), 'MMMM yyyy', { locale: es });
    if (!acc[mes]) {
      acc[mes] = [];
    }
    acc[mes].push(instante);
    return acc;
  }, {} as Record<string, typeof instantesFiltrados>);

  const hayFiltrosActivos =
    filtroArea !== 'todos' ||
    filtroTipo !== 'todos' ||
    fechaInicio ||
    fechaFin;

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando archivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white font-medium">Archivo</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Archivo
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {hayFiltrosActivos
            ? `Mostrando ${instantesFiltrados.length} de ${instantes.length} instantes`
            : `Todos los instantes ordenados cronológicamente. (${instantes.length} total)`}
        </p>
      </header>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros
          </h2>
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por área */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área
            </label>
            <select
              id="area"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value as AreaId | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todas las áreas</option>
              {AREAS.map(area => (
                <option key={area.id} value={area.id}>
                  {area.emoji} {area.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'pensamiento' | 'accion')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="pensamiento">💭 Pensamiento</option>
              <option value="accion">⚡ Acción</option>
            </select>
          </div>

          {/* Filtro por fecha inicio */}
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Desde
            </label>
            <input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro por fecha fin */}
          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hasta
            </label>
            <input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Timeline por meses */}
      {Object.keys(instantesPorMes).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(instantesPorMes).map(([mes, instantesDelMes]) => (
            <section key={mes}>
              {/* Separador de mes */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 capitalize whitespace-nowrap">
                  {mes}
                </h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {instantesDelMes.length} {instantesDelMes.length === 1 ? 'instante' : 'instantes'}
                </span>
              </div>

              {/* Instantes del mes */}
              <div className="space-y-4">
                {instantesDelMes.map((instante) => (
                  <InstanteCard
                    key={instante.id || `${instante.area}-${instante.slug}`}
                    instante={instante}
                    showArea={filtroArea === 'todos'}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            {hayFiltrosActivos
              ? 'No se encontraron instantes con los filtros aplicados.'
              : 'Aún no hay instantes registrados.'}
          </p>
          <Link
            href="/admin/nuevo"
            className="inline-block mt-2 text-gray-900 dark:text-white hover:underline"
          >
            Crear el primer instante
          </Link>
        </section>
      )}
    </div>
  );
}
