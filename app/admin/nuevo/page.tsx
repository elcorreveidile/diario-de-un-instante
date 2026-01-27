'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createInstante, generateSlug, AREAS, AreaId } from '@/lib/firestore';

export default function NuevoInstantePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState<AreaId>('trabajo');
  const [tipo, setTipo] = useState<'pensamiento' | 'accion'>('pensamiento');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const slug = generateSlug(titulo);

      await createInstante({
        titulo,
        fecha,
        area,
        tipo,
        slug,
        content,
      });

      router.push('/admin');
    } catch (err: any) {
      console.error('Error creando instante:', err);
      setError('Error al crear el instante. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Nuevo Instante</h1>
        <p className="text-gray-500 mt-1">Registra un nuevo momento en tu diario</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            placeholder="¿Qué quieres recordar de este instante?"
          />
        </div>

        {/* Fecha y Tipo en una fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'pensamiento' | 'accion')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
            >
              <option value="pensamiento">💭 Pensamiento</option>
              <option value="accion">⚡ Acción</option>
            </select>
          </div>
        </div>

        {/* Área */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Área de vida *
          </label>
          <select
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value as AreaId)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenido *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-y"
            placeholder="Escribe tu reflexión o describe lo que hiciste. Puedes usar Markdown para dar formato."
          />
          <p className="mt-1 text-xs text-gray-500">
            Puedes usar Markdown: **negrita**, *cursiva*, ## títulos, - listas
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar instante'}
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
