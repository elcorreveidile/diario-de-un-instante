'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  getInstanteById,
  updateInstante,
  generateSlug,
  AREAS,
  AreaId,
  Instante,
} from '@/lib/firestore';
import { useHotkeys } from 'react-hotkeys-hook';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditarInstantePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [area, setArea] = useState<AreaId>('trabajo');
  const [tipo, setTipo] = useState<'pensamiento' | 'accion'>('pensamiento');
  const [content, setContent] = useState('');
  const [estado, setEstado] = useState<'borrador' | 'publicado'>('borrador');
  const [privado, setPrivado] = useState(false);

  useEffect(() => {
    const loadInstante = async () => {
      try {
        const instante = await getInstanteById(id);
        if (!instante) {
          setNotFound(true);
          return;
        }

        setTitulo(instante.titulo);
        setFecha(instante.fecha);
        setArea(instante.area);
        setTipo(instante.tipo);
        setContent(instante.content);
        setEstado(instante.estado || 'borrador');
        setPrivado(instante.privado || false);
      } catch (err) {
        console.error('Error cargando instante:', err);
        setError('Error al cargar el instante');
      } finally {
        setLoading(false);
      }
    };

    loadInstante();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const slug = generateSlug(titulo);

      await updateInstante(id, {
        titulo,
        fecha,
        area,
        tipo,
        slug,
        content,
        estado,
        privado,
      });

      router.push('/admin');
    } catch (err: any) {
      console.error('Error actualizando instante:', err);
      setError('Error al actualizar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Atajo de teclado: Cmd/Ctrl + S para guardar
  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    handleSubmit();
  }, { enableOnFormTags: true });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando instante...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">🔍</span>
        <h2 className="text-lg font-medium text-gray-900">Instante no encontrado</h2>
        <p className="text-gray-500 mt-2">El instante que buscas no existe o fue eliminado.</p>
        <Link
          href="/admin"
          className="inline-block mt-4 text-gray-900 hover:underline"
        >
          ← Volver al panel
        </Link>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Editar Instante</h1>
        <p className="text-gray-500 mt-1">Modifica los detalles de este momento</p>
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
        <div data-color-mode="auto">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenido *
          </label>
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            preview="edit"
            height={700}
            visibleDragbar={false}
            highlightEnable={false}
            textareaProps={{
              id: 'content',
              required: true,
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Puedes usar Markdown: **negrita**, *cursiva*, ## títulos, - listas, [enlaces](url)
          </p>
        </div>

        {/* Estado y Privacidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as 'borrador' | 'publicado')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
            >
              <option value="borrador">📝 Borrador</option>
              <option value="publicado">✅ Publicado</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privado}
                onChange={(e) => setPrivado(e.target.checked)}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <div>
                <span className="block text-sm font-medium text-gray-700">Marcado como privado</span>
                <span className="block text-xs text-gray-500">No se mostrará en el sitio público</span>
              </div>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
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
