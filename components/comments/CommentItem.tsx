'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { CommentWithReplies } from '@/lib/firestore';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: CommentWithReplies;
  instantOwnerId: string;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onModerate?: (commentId: string, action: string) => void;
  level?: number;
}

export default function CommentItem({
  comment,
  instantOwnerId,
  level = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.uid === comment.userId;
  const isInstantOwner = user?.uid === instantOwnerId;
  const canModerate = isInstantOwner && comment.userId !== instantOwnerId;
  const maxLevel = 3; // Máximo nivel de anidación
  const canReply = level < maxLevel;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar comentario');
      }

      // Recargar la página para actualizar la lista
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar comentario');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      }
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `Hace ${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-8 md:ml-12 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        {/* Header: Avatar + Name + Date */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {comment.userPhoto ? (
              <img
                src={comment.userPhoto}
                alt={comment.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {comment.userName}
              </p>

              {comment.editedAt && (
                <span className="text-xs text-gray-400">(editado)</span>
              )}

              {isInstantOwner && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                  Autor
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(new Date(comment.createdAt))}
            </p>
          </div>

          {/* Actions dropdown */}
          <div className="flex-shrink-0 relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-10">
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Responder
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Editar
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {!showEditForm ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p>{comment.content}</p>
          </div>
        ) : (
          <div className="mb-4">
            <CommentForm
              instanteId={comment.instanteId}
              parentId={comment.parentId || null}
              onSuccess={() => {
                setShowEditForm(false);
                window.location.reload();
              }}
              onCancel={() => setShowEditForm(false)}
              placeholder="Edita tu comentario..."
              autoFocus
            />
          </div>
        )}

        {/* Reply button (mobile friendly) */}
        {canReply && !showReplyForm && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-3 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
          >
            Responder
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 ml-4">
          <CommentForm
            instanteId={comment.instanteId}
            parentId={comment.id}
            onSuccess={() => {
              setShowReplyForm(false);
              window.location.reload();
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Escribe tu respuesta..."
            autoFocus
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              instantOwnerId={instantOwnerId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
