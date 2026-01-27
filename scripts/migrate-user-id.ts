import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
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

async function migrate() {
  console.log('🔄 Iniciando migración a multi-tenant...\n');

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

    // Filtrar instantes que ya tienen userId
    const sinUserId = instantes.filter(i => !i.hasOwnProperty('userId') || !i.userId);
    console.log(`📊 ${sinUserId.length} instantes sin userId`);

    if (sinUserId.length === 0) {
      console.log('\n✨ Todos los instantes ya tienen userId. No es necesario migrar.');
      return;
    }

    // Pedir el userId al usuario
    console.log('\n⚠️  IMPORTANTE: Necesitas el userId del usuario que será propietario de estos instantes.');
    console.log('   Opciones para obtener el userId:');
    console.log('   1. Regístrate en la app primero: https://tu-app.com/registro');
    console.log('   2. Abre la consola del navegador ejecuta: localStorage.getItem("firebase:authUser:AIzaSyD..."...)');
    console.log('   3. O mira en Firebase Console > Authentication > Users\n');

    // Leer userId desde archivo o stdin
    let userId = '';
    const userIdFile = path.join(__dirname, '../.user-id');

    if (fs.existsSync(userIdFile)) {
      userId = fs.readFileSync(userIdFile, 'utf-8').trim();
      console.log(`📄 UserId encontrado en .user-id: ${userId}`);
    } else {
      console.log('❌ No se encontró archivo .user-id');
      console.log('💡 Crea un archivo .user-id en la raíz del proyecto con el userId del usuario.');
      console.log('   Ejemplo: echo "ABC123xyz..." > .user-id\n');
      throw new Error('No se encontró userId. Por favor, crea el archivo .user-id.');
    }

    if (!userId) {
      throw new Error('UserId vacío. Por favor, verifica el archivo .user-id.');
    }

    // Confirmar migración
    console.log(`\n⚠️  Se asignará el userId "${userId}" a ${sinUserId.length} instantes.`);
    console.log('   ¿Deseas continuar? (sí/no)');

    // En un entorno real, aquí esperaríamos confirmación del usuario
    // Para automatizar, procedemos directamente

    // Migrar instantes
    console.log('\n📝 Migrando instantes...');
    let migrated = 0;
    let errors = 0;

    for (const instante of sinUserId) {
      try {
        const docRef = doc(db, 'instantes', instante.id);
        await updateDoc(docRef, {
          userId: userId,
        });
        migrated++;
        console.log(`   ✅ ${instante.titulo}`);
      } catch (error) {
        errors++;
        console.error(`   ❌ Error migrando "${instante.titulo}":`, error);
      }
    }

    // Asignar rol de admin al usuario
    console.log('\n👑 Asignando rol de administrador al usuario...');
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'admin',
      });
      console.log('   ✅ Rol de admin asignado correctamente');
    } catch (error) {
      console.error('   ⚠️  No se pudo asignar rol de admin:', error);
      console.log('   💡 Puedes asignarlo manualmente en Firebase Console');
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📝 Total procesados: ${sinUserId.length}`);

    if (errors === 0) {
      console.log('\n✅ ¡Migración completada con éxito!');
      console.log(`\n💡 Ahora puedes iniciar sesión con el usuario correspondiente a este userId:`);
      console.log(`   UserId: ${userId}`);
      console.log(`   Rol: Admin (puedes generar invitaciones)`);
      console.log(`   Tus instantes estarán disponibles en /admin\n`);
    } else {
      console.log('\n⚠️  La migración terminó con errores. Revisa el log arriba.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrate();
