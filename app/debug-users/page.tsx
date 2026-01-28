import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Helper para obtener la URL base
function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export default async function DebugUsersPage() {
  const baseUrl = getBaseUrl();

  // Obtener usuarios desde la API
  const res = await fetch(`${baseUrl}/api/debug/users`, {
    cache: 'no-store',
  });

  let users: any[] = [];
  let error: string | null = null;

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    error = `${errorData.error || 'Error al cargar usuarios'}: ${errorData.message || errorData.code || 'Desconocido'}`;
    console.error('[DebugUsers] Error al cargar usuarios:', errorData);
  } else {
    users = await res.json();
    console.log('[DebugUsers] Usuarios cargados:', users.length);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug: Usuarios en Firestore</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-2">URL: {baseUrl}/api/debug/users</p>
          </div>
        )}

        {!error && users.length === 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">No hay usuarios en la base de datos o la API no devolvió datos.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.displayName || '(sin nombre)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.username ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.username}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        No configurado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Instrucciones</h2>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Busca tu usuario en la tabla anterior (por email o display name)</li>
            <li>Si ves &quot;No configurado&quot; en Username, ve a <a href="/admin/configuracion-blog" className="underline font-semibold">/admin/configuracion-blog</a></li>
            <li>Ingresa el username que quieras usar (ej: &quot;javier&quot;)</li>
            <li>Guarda la configuración</li>
            <li>Luego tu blog estará accesible en <code>/u/[username]</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
