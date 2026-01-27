'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { getBlogConfig, updateBlogConfig, BlogConfig } from '@/lib/firestore';
import { uploadAvatar, uploadHeaderPhoto } from '@/lib/storage';
import Link from 'next/link';

export default function ConfigurarBlogPage() {
  const { user, userProfile, loading } = useAuth();
  const [config, setConfig] = useState<BlogConfig>({
    displayName: '',
    bio: '',
    photoURL: '',
    headerPhotoURL: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#f5f3ff',
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [message, setMessage] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [previewHeader, setPreviewHeader] = useState('');

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const data = await getBlogConfig(user!.uid);
      if (data) {
        setConfig(data);
        setPreviewAvatar(data.photoURL || '');
        setPreviewHeader(data.headerPhotoURL || '');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage('Error al cargar configuración');
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setMessage('');

    try {
      await updateBlogConfig(user.uid, config);
      setMessage('Configuración guardada correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setMessage('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingAvatar(true);
    setMessage('');

    try {
      const url = await uploadAvatar(user.uid, file);
      setConfig({ ...config, photoURL: url });
      setPreviewAvatar(url);
      setMessage('Foto de perfil subida correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error subiendo avatar:', error);
      setMessage(error.message || 'Error al subir foto de perfil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingHeader(true);
    setMessage('');

    try {
      const url = await uploadHeaderPhoto(user.uid, file);
      setConfig({ ...config, headerPhotoURL: url });
      setPreviewHeader(url);
      setMessage('Foto de cabecera subida correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error subiendo cabecera:', error);
      setMessage(error.message || 'Error al subir foto de cabecera');
    } finally {
      setUploadingHeader(false);
    }
  };

  if (loading || loadingConfig) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Configurar mi Blog</h1>
        <p className="text-gray-500 mt-1">Personaliza cómo se ve tu perfil público</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('Error')
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto de cabecera */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foto de cabecera
            </label>
            <div className="relative">
              {previewHeader ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={previewHeader}
                    alt="Cabecera"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center">
                  <span className="text-gray-400">Sin cabecera</span>
                </div>
              )}
              <div className="mt-2">
                <input
                  type="file"
                  id="headerPhoto"
                  accept="image/*"
                  onChange={handleHeaderUpload}
                  disabled={uploadingHeader}
                  className="hidden"
                />
                <label
                  htmlFor="headerPhoto"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer text-sm"
                >
                  {uploadingHeader ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cambiar cabecera
                    </>
                  )}
                </label>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Recomendado: 1200x300px, máximo 5MB</p>
          </div>

          {/* Foto de perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foto de perfil
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt="Perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {config.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer text-sm"
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Subir foto
                    </>
                  )}
                </label>
                <p className="mt-1 text-xs text-gray-500">Recomendado: 500x500px, máximo 2MB</p>
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              id="displayName"
              value={config.displayName}
              onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="María García"
            />
            <p className="mt-1 text-xs text-gray-500">
              Aparecerá como: "Diario de un Instante de <strong>{config.displayName}</strong>"
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio / Descripción
            </label>
            <textarea
              id="bio"
              value={config.bio}
              onChange={(e) => setConfig({ ...config, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Escribe algo sobre ti... ¿Qué te apasiona? ¿Qué escribes en tu diario?"
            />
            <p className="mt-1 text-xs text-gray-500">Máximo 200 caracteres</p>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color principal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Para botones, enlaces y acentos</p>
            </div>

            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color secundario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="secondaryColor"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Para fondos y fondos de tarjeta</p>
            </div>
          </div>

          {/* Preview del título */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vista previa del título
            </h3>
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: config.secondaryColor }}
            >
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: config.primaryColor }}
              >
                Diario de un Instante de {config.displayName}
              </h1>
              {config.bio && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">{config.bio}</p>
              )}
            </div>
          </div>

          {/* Botón guardar */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </form>

        {/* Ver blog */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Una vez guardada la configuración, tu blog estará disponible en:
          </p>
          <Link
            href={`/@${config.displayName.toLowerCase()}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver mi blog
          </Link>
        </div>
      </div>
    </div>
  );
}
