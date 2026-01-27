import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

async function backup() {
  console.log('🔄 Iniciando backup de instantes...\n');

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Obtener todos los instantes
    console.log('📥 Obteniendo instantes de Firestore...');
    const instantesRef = collection(db, 'instantes');
    const snapshot = await getDocs(instantesRef);

    const instantes: any[] = [];
    snapshot.forEach((doc) => {
      instantes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`✅ ${instantes.length} instantes obtenidos`);

    // Crear backup con metadatos
    const backup = {
      version: '0.4',
      fecha: new Date().toISOString(),
      totalInstantes: instantes.length,
      instantes,
    };

    // Guardar en archivo JSON
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`💾 Backup guardado en: ${filename}`);
    console.log(`📍 Ruta completa: ${filepath}`);

    // Mostrar resumen
    console.log('\n📊 Resumen:');
    console.log(`   Total instantes: ${instantes.length}`);
    console.log(`   Tamaño archivo: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // Mostrar algunos instantes como muestra
    if (instantes.length > 0) {
      console.log('\n📝 Muestra de instantes:');
      instantes.slice(0, 3).forEach((instante, index) => {
        console.log(`   ${index + 1}. ${instante.titulo} (${instante.area})`);
      });
      if (instantes.length > 3) {
        console.log(`   ... y ${instantes.length - 3} más`);
      }
    }

    console.log('\n✅ Backup completado con éxito!');
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    process.exit(1);
  }
}

backup();
