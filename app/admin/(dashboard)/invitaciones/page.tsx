'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { createInviteCode, getAllInviteCodes, InviteCode } from '@/lib/invites';
import Link from 'next/link';

export default function InvitacionesPage() {
  const { user, isAdmin, loading } = useAuth();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const loadInvites = async () => {
    try {
      const data = await getAllInviteCodes();
      setInvites(data);
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadInvites();
    }
  }, [user, isAdmin]);

  const handleCreate = async () => {
    if (!user?.uid) return;

    setCreating(true);
    setMessage('');

    try {
      const newInvite = await createInviteCode(user.uid, email || undefined);
      setInvites([newInvite, ...invites]);
      setEmail('');
      setMessage('Código creado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creando código:', error);
      setMessage('Error al crear código');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setMessage('Código copiado al portapapeles');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading || loadingInvites) {
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
        <span className="text-4xl mb-4 block">🔒</span>
        <h2 className="text-lg font-medium text-gray-900">Acceso denegado</h2>
        <p className="text-gray-500 mt-2">No tienes permisos para gestionar invitaciones.</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Invitaciones</h1>
        <p className="text-gray-500 mt-1">Gestiona los códigos de invitación para nuevos usuarios</p>
      </div>

      {/* Crear nueva invitación */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear nueva invitación</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si dejas el email vacío, cualquiera podrá usar este código
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creando...' : 'Generar código'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Lista de invitaciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Códigos de invitación ({invites.length})
        </h2>

        {invites.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay códigos de invitación creados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email (opcional)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usado por</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Creado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {invite.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.email || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {invite.used ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Usado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.usedBy || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.createdAt?.toDate()?.toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4">
                      {!invite.used && (
                        <button
                          onClick={() => copyToClipboard(invite.code)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Copiar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
