import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION_NAME = 'instantes';

async function migrateInstantes() {
  console.log('🔄 Iniciando migración de instantes...');

  try {
    // Obtener todos los instantes
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    if (snapshot.empty) {
      console.log('✅ No hay instantes para migrar');
      return;
    }

    console.log(`📝 Encontrados ${snapshot.docs.length} instantes`);

    let migrados = 0;
    let yaMigrados = 0;
    let errores = 0;

    // Migrar cada documento
    for (const docSnapshot of snapshot.docs) {
      try {
        const data = docSnapshot.data();
        const docRef = doc(db, COLLECTION_NAME, docSnapshot.id);

        // Solo actualizar si no tienen los campos nuevos
        if (!data.hasOwnProperty('estado') || !data.hasOwnProperty('privado')) {
          await updateDoc(docRef, {
            estado: 'publicado',
            privado: false
          });
          migrados++;
          console.log(`✅ Migrado: ${data.titulo}`);
        } else {
          yaMigrados++;
          console.log(`⏭️  Ya migrado: ${data.titulo}`);
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando documento ${docSnapshot.id}:`, error);
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Migrados exitosamente: ${migrados}`);
    console.log(`   ⏭️  Ya tenían campos: ${yaMigrados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log('\n🎉 Migración completada');

  } catch (error) {
    console.error('❌ Error fatal en migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateInstantes()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error no manejado:', error);
    process.exit(1);
  });
