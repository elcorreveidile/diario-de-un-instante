'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

interface CommentFormProps {
  instanteId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  instanteId,
  parentId = null,
  onSuccess,
  onCancel,
  placeholder = 'Escribe tu comentario...',
  autoFocus = false,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Debes iniciar sesión para comentar');
      return;
    }

    if (content.trim().length === 0) {
      setError('El comentario no puede estar vacío');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          instanteId,
          content: content.trim(),
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear comentario');
      }

      setContent('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear comentario');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Inicia sesión para participar en la conversación
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          disabled={submitting}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || content.trim().length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </>
          ) : parentId ? (
            'Responder'
          ) : (
            'Comentar'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
