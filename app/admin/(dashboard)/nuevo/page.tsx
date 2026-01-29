'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createInstante, generateSlug, AREAS, AreaId, getAllTags, ImageMetadata } from '@/lib/firestore';
import { uploadInstanteImages } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { useHotkeys } from 'react-hotkeys-hook';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function NuevoInstantePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState<AreaId>('trabajo');
  const [tipo, setTipo] = useState<'pensamiento' | 'accion'>('pensamiento');
  const [content, setContent] = useState('');
  const [estado, setEstado] = useState<'borrador' | 'publicado'>('borrador');
  const [privado, setPrivado] = useState(false);

  // v0.7 - Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // v0.7 - Imágenes
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Cargar tags existentes al montar
  useEffect(() => {
    const loadTags = async () => {
      try {
        const existing = await getAllTags();
        setExistingTags(existing);
      } catch (error) {
        console.error('Error cargando tags:', error);
      }
    };
    loadTags();
  }, []);

  // Función para añadir tag
  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !tags.includes(normalized) && tags.length < 10) {
      setTags([...tags, normalized]);
    }
  };

  // Función para eliminar tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Función para subir imágenes
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !user?.uid) return;

    const fileArray = Array.from(files);

    if (images.length + fileArray.length > 5) {
      alert('Máximo 5 imágenes por instante');
      return;
    }

    setUploadingImages(true);

    try {
      // Subir a Firebase Storage
      const uploaded = await uploadInstanteImages(user.uid, 'temp', fileArray);
      setImages([...images, ...uploaded]);
    } catch (error: any) {
      alert('Error al subir imágenes: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  // Función para eliminar imagen
  const removeImage = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // Función para usar una pregunta guía como base
  const applyPrompt = (pregunta: string) => {
    setTitulo(pregunta);
    setContent(`## ${pregunta}\n\n`);
  };

  // Obtener el área seleccionada con sus preguntas guía
  const getAreaInfo = (areaId: AreaId) => {
    return AREAS.find(a => a.id === areaId);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!user?.uid) {
      setError('Debes estar autenticado para crear un instante');
      return;
    }

    setLoading(true);

    try {
      const slug = generateSlug(titulo);

      await createInstante({
        userId: user.uid,
        titulo,
        fecha,
        area,
        tipo,
        slug,
        content,
        estado,
        privado,
        tags, // v0.7 - Tags
        images, // v0.7 - Imágenes
      });

      router.push('/admin');
    } catch (err: any) {
      console.error('Error creando instante:', err);
      setError('Error al crear el instante. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Atajo de teclado: Cmd/Ctrl + S para guardar
  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    handleSubmit();
  }, { enableOnFormTags: true });

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

        {/* Preguntas guía - aparece después de seleccionar área */}
        {area && getAreaInfo(area)?.preguntasGuia && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-5 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{getAreaInfo(area)?.emoji}</span>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Preguntas para inspirarte
              </h4>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Si no sabes por dónde empezar, usa estas preguntas como guía:
            </p>

            <ul className="space-y-2">
              {getAreaInfo(area)?.preguntasGuia?.map((pregunta, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => applyPrompt(pregunta)}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 text-xs flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors font-medium"
                    title="Usar esta pregunta como base"
                  >
                    {idx + 1}
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    {pregunta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags/etiquetas */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🏷️ Etiquetas (opcional)
          </label>

          <div className="relative">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                // Buscar tags existentes que coincidan
                if (e.target.value.length > 0) {
                  const matching = existingTags.filter(tag =>
                    tag.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setTagSuggestions(matching.slice(0, 5));
                } else {
                  setTagSuggestions([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  addTag(tagInput.trim());
                  setTagInput('');
                  setTagSuggestions([]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Escribe y presiona Enter para añadir"
            />

            {/* Dropdown de sugerencias */}
            {tagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-auto">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      addTag(tag);
                      setTagInput('');
                      setTagSuggestions([]);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags seleccionados */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-violet-900 dark:hover:text-violet-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tags.length >= 10 ? 'Máximo 10 etiquetas' : `Ejemplos: productividad, reflexión, hábito, mindfulness`}
          </p>
        </div>

        {/* Galería de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📷 Imágenes (opcional, máximo 5)
          </label>

          <div className="space-y-3">
            {/* Drop zone o botón de selección */}
            {images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  JPG, PNG, GIF hasta 5MB cada una
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploadingImages}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-block px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                    uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImages ? 'Subiendo...' : 'Seleccionar imágenes'}
                </label>
              </div>
            )}

            {/* Preview de imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={`Vista previa ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Eliminar imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.name}
                    </div>
                  </div>
                ))}

                {/* Botón añadir más si < 5 */}
                {images.length < 5 && (
                  <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Añadir más</span>
                  </label>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {images.length}/5 imágenes {images.length >= 5 && '(máximo alcanzado)'}
            </p>
          </div>
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
