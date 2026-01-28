'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Subscriber {
  email: string;
  status: string;
  subscribedAt?: Date;
  confirmedAt?: Date;
}

export default function NewslettersPage() {
  const { user, isAdmin } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para enviar newsletter
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
      } else {
        console.error('Error cargando suscriptores:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando suscriptores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setSendResult({ success: false, message: 'No autorizado. Solo administradores pueden enviar newsletters.' });
      return;
    }

    if (!subject.trim() || !content.trim()) {
      setSendResult({ success: false, message: 'Por favor completa todos los campos' });
      return;
    }

    if (!user) {
      setSendResult({ success: false, message: 'No autorizado' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          message: `Newsletter enviado exitosamente a ${data.sent} suscriptores`,
        });
        setSubject('');
        setContent('');
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Error al enviar newsletter',
        });
      }
    } catch (error) {
      console.error('Error enviando newsletter:', error);
      setSendResult({
        success: false,
        message: 'Error al enviar newsletter. Inténtalo de nuevo.',
      });
    } finally {
      setSending(false);
    }
  };

  // Mostrar error si no es admin
  if (user && !isAdmin) {
    return (
      <div className="container-page max-w-6xl">
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
            Solo los administradores pueden enviar newsletters.
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

  return (
    <div className="container-page max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletters
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Envía newsletters a los suscriptores activos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
            {subscribers.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Suscriptores activos
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            ✓
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Double opt-in activado
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Resend
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Proveedor de emails
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de envío */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Enviar nueva newsletter
            </h2>

            <form onSubmit={handleSendNewsletter} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asunto *
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Instantes de la semana - Edición #1"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenido (HTML) *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="<p>Hola a todos,</p>&#10;<p>Esta semana...</p>"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Puedes usar etiquetas HTML básicas: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;
                </p>
              </div>

              {sendResult && (
                <div
                  className={`p-4 rounded-lg ${
                    sendResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <p
                    className={
                      sendResult.success
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-red-800 dark:text-red-200'
                    }
                  >
                    {sendResult.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sending || subscribers.length === 0}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando...' : `Enviar a ${subscribers.length} suscriptores`}
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de suscriptores */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Suscriptores
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Cargando...
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay suscriptores activos
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {subscribers.map((sub, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {sub.email}
                    </div>
                    {sub.confirmedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Confirmado: {new Date(sub.confirmedAt).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
