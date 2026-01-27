'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  getAllInvitationRequests,
  updateInvitationRequestStatus,
  createInviteCode,
  markInviteCodeSent,
  InvitationRequest
} from '@/lib/invites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SolicitudesPage() {
  const { user, isAdmin, loading } = useAuth();
  const [requests, setRequests] = useState<InvitationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ code: string; email: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await getAllInvitationRequests();
      const filtered = filter === 'all' ? data : data.filter(r => r.status === filter);
      setRequests(filtered);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async (requestId: string, email: string) => {
    if (!user?.uid) return;

    setProcessing(requestId);
    try {
      // Generar código de invitación
      const invite = await createInviteCode(user.uid, email);

      // Actualizar estado de la solicitud
      await updateInvitationRequestStatus(requestId, 'approved', user.uid);

      setGeneratedCode({ code: invite.code, email });
      await loadRequests();
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user?.uid) return;

    if (!confirm('¿Rechazar esta solicitud?')) return;

    setProcessing(requestId);
    try {
      await updateInvitationRequestStatus(requestId, 'rejected', user.uid);
      await loadRequests();
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setProcessing(null);
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado al portapapeles');
  };

  const sendCodeToUser = async (requestId: string) => {
    try {
      await markInviteCodeSent(requestId);
      await loadRequests();
      alert('Marcado como enviado. Ahora puedes copiar el código y enviárselo al usuario por email.');
    } catch (error) {
      console.error('Error marcando como enviado:', error);
      alert('Error al marcar como enviado');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tienes permiso para ver esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Invitación</h1>
        <p className="text-gray-500 mt-1">Gestiona las solicitudes para unirse a la plataforma</p>
      </div>

      {/* Código generado */}
      {generatedCode && (
        <div className="mb-6 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-2">
            Código de invitación generado
          </h3>
          <p className="text-violet-700 dark:text-violet-300 mb-4">
            Para: <strong>{generatedCode.email}</strong>
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400">
              {generatedCode.code}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => copyCodeToClipboard(generatedCode.code)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Copiar código
            </button>
            <button
              onClick={() => setGeneratedCode(null)}
              className="px-4 py-2 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Todas ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'approved'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Aprobadas
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'rejected'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Rechazadas
        </button>
      </div>

      {/* Lista de solicitudes */}
      {loadingRequests ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-4xl mb-4 block">📨</span>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">No hay solicitudes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {filter === 'pending' && 'No hay solicitudes pendientes de revisión.'}
            {filter === 'all' && 'Aún nadie ha solicitado una invitación.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : request.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {request.status === 'pending' && 'Pendiente'}
                      {request.status === 'approved' && 'Aprobada'}
                      {request.status === 'rejected' && 'Rechazada'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{request.email}</p>
                  {request.reason && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="font-medium">¿Por qué le interesa?</span>
                      <br />
                      "{request.reason}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Solicitado:{' '}
                  {format(request.createdAt.toDate(), "d MMM yyyy, HH:mm", { locale: es })}
                </p>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id!, request.email)}
                      disabled={processing === request.id}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-sm disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {processing === request.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processing === request.id}
                      className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-3 py-1.5 rounded-lg text-sm disabled:cursor-not-allowed"
                    >
                      Rechazar
                    </button>
                  </div>
                )}

                {request.status === 'approved' && !request.inviteCodeSent && (
                  <button
                    onClick={() => sendCodeToUser(request.id!)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    Marcar como enviado
                  </button>
                )}

                {request.status === 'approved' && request.inviteCodeSent && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    ✓ Código enviado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
