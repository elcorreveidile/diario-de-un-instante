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
  ImageMetadata,
  getAllTags,
} from '@/lib/firestore';
import { uploadInstanteImages, deleteInstanteImage } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { useHotkeys } from 'react-hotkeys-hook';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditarInstantePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

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

  // v0.7 - Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  // v0.7 - Imágenes
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const loadInstante = async () => {
      try {
        const instante = await getInstanteById(id);
        if (!instante) {
          setNotFound(true);
          return;
        }

        // Verificar que el usuario es el propietario
        if (user && instante.userId !== user.uid) {
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
        setTags(instante.tags || []);
        setImages(instante.images || []);
      } catch (err) {
        console.error('Error cargando instante:', err);
        setError('Error al cargar el instante');
      } finally {
        setLoading(false);
      }
    };

    // Cargar tags existentes
    const loadTags = async () => {
      try {
        const existing = await getAllTags();
        setExistingTags(existing);
      } catch (error) {
        console.error('Error cargando tags:', error);
      }
    };

    loadInstante();
    loadTags();
  }, [id, user]);

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
      // Subir a Firebase Storage con un ID temporal
      const uploaded = await uploadInstanteImages(user.uid, id, fileArray);
      setImages([...images, ...uploaded]);
    } catch (error: any) {
      alert('Error al subir imágenes: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  // Función para eliminar imagen
  const removeImage = async (image: ImageMetadata, index: number) => {
    // Eliminar de Firebase Storage
    try {
      await deleteInstanteImage(image.path);
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    } catch (error: any) {
      alert('Error al eliminar imagen: ' + error.message);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!user?.uid) {
      setError('Debes estar autenticado para editar un instante');
      return;
    }

    setSaving(true);

    try {
      const slug = generateSlug(titulo);

      await updateInstante(id, {
        userId: user.uid,
        titulo,
        fecha,
        area,
        tipo,
        slug,
        content,
        estado,
        privado,
        tags,
        images,
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

        {/* Tags/etiquetas */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
              placeholder="Escribe y presiona Enter para añadir"
            />

            {/* Dropdown de sugerencias */}
            {tagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      addTag(tag);
                      setTagInput('');
                      setTagSuggestions([]);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-violet-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            {tags.length >= 10 ? 'Máximo 10 etiquetas' : `Ejemplos: productividad, reflexión, hábito`}
          </p>
        </div>

        {/* Galería de imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📷 Imágenes (opcional, máximo 5)
          </label>

          <div className="space-y-3">
            {/* Drop zone o botón de selección */}
            {images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mb-4">
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
                  className={`inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
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
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image, index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Eliminar imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Botón para añadir más imágenes si hay menos de 5 */}
                {images.length < 5 && (
                  <div className="relative aspect-square">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                      className="hidden"
                      id="add-more-images"
                    />
                    <label
                      htmlFor="add-more-images"
                      className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                        uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImages ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs text-gray-500">Añadir más</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500">
              {images.length}/5 imágenes
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
