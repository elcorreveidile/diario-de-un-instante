/**
 * Script de depuración para verificar usuarios en Firestore
 * Uso: npx tsx scripts/debug-user.ts <username>
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase-admin/firestore';

// Credenciales desde variable de entorno o archivo
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

if (!serviceAccount) {
  console.error('❌ Error: No se encontraron credenciales de Firebase');
  console.log('📝 Configura la variable de entorno GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}

// Inicializar Firebase Admin
const app = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0];

const db = getFirestore(app);

async function debugUser(username: string) {
  console.log(`🔍 Buscando usuario: "${username}"`);
  console.log('---');

  const usersRef = collection(db, 'users');
  const usernameLower = username.toLowerCase();

  // 1. Buscar por campo username
  console.log('1️⃣ Buscando por campo username...');
  const qByUsername = query(usersRef, where('username', '==', usernameLower));
  const snapshotByUsername = await getDocs(qByUsername);

  if (!snapshotByUsername.empty) {
    console.log(`✅ Encontrado por username (${snapshotByUsername.size} resultados):`);
    snapshotByUsername.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   UID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   displayName: ${data.displayName}`);
      console.log(`   username: ${data.username}`);
    });
  } else {
    console.log('❌ No encontrado por username');
  }

  console.log('---');

  // 2. Buscar por displayName (fallback)
  console.log('2️⃣ Buscando por displayName (fallback)...');
  const qByDisplayName = query(usersRef, where('displayName', '==', username));
  const snapshotByDisplayName = await getDocs(qByDisplayName);

  if (!snapshotByDisplayName.empty) {
    console.log(`✅ Encontrado por displayName (${snapshotByDisplayName.size} resultados):`);
    snapshotByDisplayName.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   UID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   displayName: ${data.displayName}`);
      console.log(`   username: ${data.username || '⚠️ SIN CAMPO USERNAME'}`);
    });
  } else {
    console.log('❌ No encontrado por displayName');
  }

  console.log('---');

  // 3. Listar todos los usuarios para ver qué hay
  console.log('3️⃣ Listando todos los usuarios (primeros 10)...');
  const allUsers = await getDocs(usersRef);
  console.log(`📊 Total de usuarios: ${allUsers.size}`);

  let count = 0;
  allUsers.docs.forEach(doc => {
    if (count < 10) {
      const data = doc.data();
      console.log(`   - ${data.email} | displayName: "${data.displayName}" | username: "${data.username || 'SIN USERNAME'}"`);
      count++;
    }
  });

  console.log('---');
  console.log('✨ Depuración completada');
}

// Obtener username de argumentos
const username = process.argv[2];

if (!username) {
  console.log('Uso: npx tsx scripts/debug-user.ts <username>');
  console.log('Ejemplo: npx tsx scripts/debug-user.ts informa');
  process.exit(1);
}

debugUser(username).catch(console.error);
