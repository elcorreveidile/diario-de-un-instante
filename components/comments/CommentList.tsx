'use client';

import { useEffect, useState } from 'react';
import { CommentWithReplies } from '@/lib/firestore';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  instanteId: string;
  instantOwnerId: string;
}

export default function CommentList({ instanteId, instantOwnerId }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/comments/by-instante/${instanteId}`);

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
  }, [instanteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-violet-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
        {error}
        <button
          onClick={loadComments}
          className="ml-4 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Deja un comentario
        </h3>
        <CommentForm instanteId={instanteId} onSuccess={loadComments} />
      </div>

      {/* Comments List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Comentarios ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aún no hay comentarios. ¡Sé el primero en participar!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                instantOwnerId={instantOwnerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
