'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { getGlobalAreasConUltimoInstante, getGlobalEstadisticas, AreaConUltimoInstante } from '@/lib/firestore';
import AreaCard from '@/components/AreaCard';
import Stats from '@/components/Stats';
import { createInvitationRequest } from '@/lib/invites';

export default function HomeContent() {
  const [areas, setAreas] = useState<AreaConUltimoInstante[]>([]);
  const [stats, setStats] = useState({
    totalInstantes: 0,
    pensamientos: 0,
    acciones: 0,
    areasActivas: 0,
    totalAreas: 11,
  });
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de solicitud
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteReason, setInviteReason] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Estados para newsletter
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [areasData, statsData] = await Promise.all([
          getGlobalAreasConUltimoInstante(),
          getGlobalEstadisticas(),
        ]);
        setAreas(areasData);
        setStats(statsData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSubmittingInvite(true);
    setInviteError('');

    try {
      await createInvitationRequest(inviteName, inviteEmail, inviteReason);
      setInviteSuccess(true);
      setInviteName('');
      setInviteEmail('');
      setInviteReason('');
    } catch (error: any) {
      console.error('Error enviando solicitud:', error);
      setInviteError(error.message || 'Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) {
      setNewsletterError('Por favor ingresa tu email');
      return;
    }

    setSubmittingNewsletter(true);
    setNewsletterError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
      } else {
        setNewsletterError(data.message || 'Error al suscribirse');
      }
    } catch (error: any) {
      console.error('Error suscribiendo newsletter:', error);
      setNewsletterError('Error al suscribirse. Inténtalo de nuevo.');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando tu diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Diario de un Instante
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Un jardín digital para cultivar un año 2026 más consciente y con propósito.
          Capturando pensamientos y acciones, un instante a la vez.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Panel de admin
          </Link>

          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Solicitar invitación
            </button>
          ) : null}
        </div>

        {/* Formulario de solicitud de invitación */}
        {showInviteForm && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-left">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Solicita tu invitación
              </h3>

              {inviteSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-2">
                    ¡Solicitud enviada! 🎉
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                    Hemos recibido tu solicitud. Te contactaremos pronto con tu código de invitación.
                  </p>
                  <button
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteSuccess(false);
                    }}
                    className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  {inviteError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-red-800 dark:text-red-200 text-sm">{inviteError}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="inviteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre * <span className="text-gray-400">(o cómo te gustaría que te llamáramos)</span>
                    </label>
                    <input
                      id="inviteName"
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email * <span className="text-gray-400">(te enviaremos el código aquí)</span>
                    </label>
                    <input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="inviteReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ¿Por qué te interesa? <span className="text-gray-400">(opcional)</span>
                    </label>
                    <textarea
                      id="inviteReason"
                      value={inviteReason}
                      onChange={(e) => setInviteReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Cuéntanos brevemente por qué te gustaría tener tu propio diario..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingInvite}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
                    >
                      {submittingInvite ? 'Enviando...' : 'Enviar solicitud'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteError('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Texto de invitación cuando no se muestra el formulario */}
        {!showInviteForm && (
          <div className="max-w-3xl mx-auto mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Quieres tu propio Diario de un Instante?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Únete a nuestra comunidad y comienza tu viaje hacia una vida más consciente.
              Crea tu diario personal, captura tus pensamientos y acciones, y cultiva tu propio jardín digital.
            </p>
          </div>
        )}
      </section>

      {/* Estadísticas */}
      <section className="mb-12">
        <Stats
          totalInstantes={stats.totalInstantes}
          pensamientos={stats.pensamientos}
          acciones={stats.acciones}
          areasActivas={stats.areasActivas}
          totalAreas={stats.totalAreas}
        />
      </section>

      {/* Grid de Áreas */}
      <section>
        <h2 className="section-title">
          Las 11 áreas de mi vida
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800 p-8 sm:p-10">
          <div className="text-center max-w-2xl mx-auto">
            {!showNewsletterForm ? (
              <>
                <div className="text-4xl mb-4">📧</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Newsletter
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Recibe los mejores instantes directamente en tu email. Sin spam, solo contenido valioso cuando haya novedades interesantes.
                </p>
                <button
                  onClick={() => setShowNewsletterForm(true)}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Suscribirse
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Suscríbete a la Newsletter
                </h3>

                {newsletterSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-2">
                      ¡Solicitud enviada! 🎉
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                      Te hemos enviado un email para confirmar tu suscripción. Por favor revisa tu bandeja de entrada.
                    </p>
                    <button
                      onClick={() => {
                        setShowNewsletterForm(false);
                        setNewsletterSuccess(false);
                      }}
                      className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    {newsletterError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-red-800 dark:text-red-200 text-sm">{newsletterError}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="newsletterEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        id="newsletterEmail"
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submittingNewsletter}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
                      >
                        {submittingNewsletter ? 'Enviando...' : 'Suscribirse'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewsletterForm(false);
                          setNewsletterError('');
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
