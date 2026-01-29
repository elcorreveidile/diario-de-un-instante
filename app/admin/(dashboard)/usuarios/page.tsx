'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getAllUsuarios, updateUsuarioRole, deleteUsuario, Usuario } from '@/lib/firestore';
import Link from 'next/link';

export default function UsuariosPage() {
  const { user, isAdmin, loading } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    setMessage('');
    try {
      const token = await user?.getIdToken();
      if (!token) {
        setMessage('Error: No hay token de autenticación');
        setLoadingUsuarios(false);
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Convertir timestamps a Date objects
        const usersWithDates = result.users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
        }));
        setUsuarios(usersWithDates);
      } else {
        setMessage(result.error || 'Error al cargar usuarios');
      }
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      setMessage(`Error al cargar: ${error.message || 'Verifica la consola para más detalles'}`);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadUsuarios();
    }
  }, [user, isAdmin]);

  const handleChangeRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(uid);
    setMessage('');

    try {
      await updateUsuarioRole(uid, newRole);
      setUsuarios(usuarios.map(u =>
        u.uid === uid ? { ...u, role: newRole } : u
      ));
      setMessage(`Rol actualizado a ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error cambiando rol:', error);
      setMessage('Error al cambiar rol');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: string, email: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?\n\n⚠️ NOTA: Esto solo elimina el perfil de Firestore. Para eliminar completamente la cuenta, también debes hacerlo desde Firebase Console > Authentication.`)) {
      return;
    }

    setActionLoading(uid);
    setMessage('');

    try {
      await deleteUsuario(uid);
      setUsuarios(usuarios.filter(u => u.uid !== uid));
      setMessage('Usuario eliminado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setMessage('Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendVerification = async (uid: string, email: string) => {
    setActionLoading(uid);
    setMessage('');

    try {
      const token = await user?.getIdToken();
      if (!token) {
        setMessage('Error: No hay token de autenticación');
        setActionLoading(null);
        return;
      }

      const response = await fetch('/api/admin/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Email de verificación reenviado a ${email}`);
      } else {
        setMessage(data.error || 'Error al enviar email');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error reenviando verificación:', error);
      setMessage('Error al reenviar email de verificación');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || loadingUsuarios) {
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
        <p className="text-gray-500 mt-2">No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Usuarios</h1>
        <p className="text-gray-500 mt-1">Gestiona los usuarios registrados en la plataforma</p>
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

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email verificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.email}
                    </div>
                    {usuario.uid === user?.uid && (
                      <span className="text-xs text-gray-500">(Tú)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.displayName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {usuario.emailVerified ? (
                        <span className="text-green-600">✓ Sí</span>
                      ) : (
                        <>
                          <span className="text-red-600">✗ No</span>
                          <button
                            onClick={() => handleResendVerification(usuario.uid, usuario.email)}
                            disabled={actionLoading === usuario.uid}
                            className="text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50 underline"
                            title="Reenviar email de verificación"
                          >
                            Reenviar email
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.createdAt.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {usuario.uid !== user?.uid && (
                        <>
                          <button
                            onClick={() => handleChangeRole(usuario.uid, usuario.role)}
                            disabled={actionLoading === usuario.uid}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                            title={usuario.role === 'admin' ? 'Hacer usuario' : 'Hacer admin'}
                          >
                            {actionLoading === usuario.uid ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.uid, usuario.email)}
                            disabled={actionLoading === usuario.uid}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Eliminar usuario"
                          >
                            {actionLoading === usuario.uid ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </>
                      )}
                      {usuario.uid === user?.uid && (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuarios.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">👥</span>
            <p className="text-gray-500">No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
