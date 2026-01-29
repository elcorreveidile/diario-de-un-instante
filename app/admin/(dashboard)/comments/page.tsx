'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
  id: string;
  instanteId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: Date;
}

export default function AdminCommentsPage() {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Mostrar error si no es admin
  if (user && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-6">
            Solo los administradores pueden moderar comentarios.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const loadComments = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/comments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [user]);

  const handleModerate = async (commentId: string, instanteId: string, action: 'approved' | 'rejected' | 'spam') => {
    setProcessing(commentId);
    setError('');

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          instanteId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al moderar comentario');
      }

      // Recargar comentarios
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al moderar comentario');
    } finally {
      setProcessing(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moderación de Comentarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revisa y modera los comentarios pendientes de aprobación
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={loadComments}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        /* Empty state */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Todo está al día
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay comentarios pendientes de moderación
          </p>
        </div>
      ) : (
        /* Comments list */
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.userPhoto ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {comment.userName}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(comment.createdAt), "d 'de' MMM 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/i/${comment.instanteId}`}
                      target="_blank"
                      className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
                    >
                      Ver instante →
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleModerate(comment.id, comment.instanteId, 'approved')}
                    disabled={processing === comment.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {processing === comment.id ? 'Procesando...' : 'Aprobar'}
                  </button>

                  <button
                    onClick={() => handleModerate(comment.id, comment.instanteId, 'rejected')}
                    disabled={processing === comment.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Rechazar
                  </button>

                  <button
                    onClick={() => handleModerate(comment.id, comment.instanteId, 'spam')}
                    disabled={processing === comment.id}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Spam
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
