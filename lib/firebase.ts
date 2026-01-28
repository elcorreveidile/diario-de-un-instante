import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
function initializeAppIfNecessary() {
  // Verificar que todas las variables necesarias estén configuradas
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('[Firebase] Variables de entorno no configuradas:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain,
    });
    throw new Error('Firebase: Variables de entorno no configuradas');
  }

  if (getApps().length === 0) {
    console.log('[Firebase] Inicializando app con config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
    return initializeApp(firebaseConfig);
  }

  console.log('[Firebase] Reutilizando app existente');
  return getApps()[0];
}

// Inicializar la app
const app = initializeAppIfNecessary();

// Configurar Auth
const authInstance = getAuth(app);
authInstance.languageCode = 'es';

// Configurar providers para OAuth
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Exportar servicios
export const db = getFirestore(app);
export const auth = authInstance;
export const storage = getStorage(app);
export { googleProvider, appleProvider };
export default app;
