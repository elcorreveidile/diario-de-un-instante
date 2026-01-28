import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import InstanteCard from '@/components/InstanteCard';

export const dynamic = 'force-dynamic';

export default async function TestFirebasePage() {
  const results: any[] = [];

  // Inicializar Firebase directamente en este contexto
  function initFirebase() {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey) {
      throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY no está configurada');
    }

    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    }
    return getApps()[0];
  }

  try {
    results.push({ test: 'Variables de entorno', status: 'OK', message: 'Verificando...' });

    const envVars = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    results.push({
      test: 'Variables de entorno',
      status: Object.values(envVars).every(v => v) ? 'OK' : 'WARNING',
      message: JSON.stringify(envVars),
    });

    const app = initFirebase();
    results.push({ test: 'initializeApp()', status: 'OK', message: 'App inicializada' });

    const firestore = getFirestore(app);
    results.push({ test: 'getFirestore()', status: 'OK', message: 'Firestore obtenido' });

    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);

    results.push({
      test: 'getDocs(users)',
      status: 'OK',
      message: `Encontrados ${snapshot.docs.length} usuarios`
    });

    if (snapshot.docs.length > 0) {
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
    }

    // Probar obtener instantes
    const instantesRef = collection(firestore, 'instantes');
    const instantesSnapshot = await getDocs(instantesRef);

    results.push({
      test: 'getDocs(instantes)',
      status: 'OK',
      message: `Encontrados ${instantesSnapshot.docs.length} instantes`
    });

  } catch (error: any) {
    results.push({
      test: 'Error',
      status: 'ERROR',
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
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
                  : result.status === 'WARNING'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{result.test}</h3>
                  {result.message && (
                    <p className="text-sm text-gray-600 mt-1 font-mono">{result.message}</p>
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
                <span className={`text-2xl ml-4 ${
                  result.status === 'OK' ? 'text-green-600' :
                  result.status === 'WARNING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.status === 'OK' ? '✓' : result.status === 'WARNING' ? '⚠' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Información del entorno</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>NODE_ENV: {process.env.NODE_ENV}</li>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'No configurada'}</li>
            <li>Timestamp: {new Date().toISOString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
