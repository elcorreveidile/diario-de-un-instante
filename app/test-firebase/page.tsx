import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export default async function TestFirebasePage() {
  const results: any[] = [];

  try {
    results.push({ test: 'Conexión a Firebase', status: 'OK', message: 'Inicializado correctamente' });

    const firestore = getFirestore();
    results.push({ test: 'getFirestore()', status: 'OK', message: 'Firestore obtenido' });

    const usersRef = collection(firestore, 'users');
    results.push({ test: 'collection(users)', status: 'OK', message: 'Referencia creada' });

    const snapshot = await getDocs(usersRef);
    results.push({
      test: 'getDocs(users)',
      status: 'OK',
      message: `Encontrados ${snapshot.docs.length} usuarios`
    });

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      results.push({
        test: `Usuario: ${doc.id}`,
        status: 'OK',
        data: {
          displayName: data.displayName,
          username: data.username,
          email: data.email,
        }
      });
    });

  } catch (error: any) {
    results.push({
      test: 'Error',
      status: 'ERROR',
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test de Conexión Firebase</h1>

        <div className="space-y-4">
          {results.map((result, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                result.status === 'OK'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{result.test}</h3>
                  {result.message && (
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  )}
                  {result.data && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  {result.code && (
                    <p className="text-xs text-red-600 mt-1">Código: {result.code}</p>
                  )}
                  {result.stack && (
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800">
                      {result.stack}
                    </pre>
                  )}
                </div>
                <span className={`text-2xl ${
                  result.status === 'OK' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.status === 'OK' ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Variables de entorno</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Configurada' : '✗ No configurada'}</li>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '✗ No configurada'}</li>
            <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '✗ No configurada'}</li>
            <li>NODE_ENV: {process.env.NODE_ENV}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
