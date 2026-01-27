'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getInstantesByUser,
  getInstantesByEstado,
  deleteInstante,
  AREAS,
  Instante
} from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPage() {
  const { user } = useAuth();
  const [instantes, setInstantes] = useState<Instante[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'borradores' | 'publicados' | 'privados'>('todos');

  const loadInstantes = async () => {
    if (!user?.uid) return;

    try {
      let data: Instante[];
      const userInstantes = await getInstantesByUser(user.uid);

      switch (filtro) {
        case 'borradores':
          data = userInstantes.filter(i => i.estado === 'borrador' || !i.hasOwnProperty('estado'));
          break;
        case 'publicados':
          data = userInstantes.filter(i => i.estado === 'publicado');
          break;
        case 'privados':
          data = userInstantes.filter(i => i.privado);
          break;
        default:
          data = userInstantes;
      }

      setInstantes(data);
    } catch (error) {
      console.error('Error cargando instantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstantes();
  }, [filtro, user]);

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(id);
    try {
      await deleteInstante(id);
      setInstantes(instantes.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error al eliminar. Inténtalo de nuevo.');
    } finally {
      setDeleting(null);
    }
  };

  const getAreaInfo = (areaId: string) => {
    return AREAS.find((a) => a.id === areaId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando instantes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Instantes</h1>
          <p className="text-gray-500 mt-1">{instantes.length} instantes registrados</p>
        </div>
        <Link
          href="/admin/nuevo"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo instante
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filtro === 'todos'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({instantes.length})
        </button>
        <button
          onClick={() => setFiltro('borradores')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filtro === 'borradores'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📝 Borradores
        </button>
        <button
          onClick={() => setFiltro('publicados')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filtro === 'publicados'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✅ Publicados
        </button>
        <button
          onClick={() => setFiltro('privados')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filtro === 'privados'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔒 Privados
        </button>
      </div>

      {instantes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <span className="text-4xl mb-4 block">📝</span>
          <h2 className="text-lg font-medium text-gray-900">No hay instantes todavía</h2>
          <p className="text-gray-500 mt-2">Crea tu primer instante para comenzar tu diario.</p>
          <Link
            href="/admin/nuevo"
            className="inline-block mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear primer instante
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instante
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Área
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Fecha
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instantes.map((instante) => {
                const area = getAreaInfo(instante.area);
                return (
                  <tr key={instante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            instante.tipo === 'pensamiento'
                              ? 'bg-violet-500'
                              : 'bg-emerald-500'
                          }`}
                        ></span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{instante.titulo}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {instante.estado === 'borrador' && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                Borrador
                              </span>
                            )}
                            {instante.privado && (
                              <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                                Privado
                              </span>
                            )}
                            <p className="text-sm text-gray-500 sm:hidden">
                              {area?.emoji} {area?.nombre}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        {area?.emoji} {area?.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {format(new Date(instante.fecha), "d MMM yyyy", { locale: es })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${instante.area}/${instante.slug}`}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Ver"
                          target="_blank"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/editar/${instante.id}`}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(instante.id!, instante.titulo)}
                          disabled={deleting === instante.id}
                          className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deleting === instante.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
