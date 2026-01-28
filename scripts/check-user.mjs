import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUser() {
  const usersRef = collection(db, 'users');
  
  // Buscar por username
  const q1 = query(usersRef, where('username', '==', 'javier'));
  const snap1 = await getDocs(q1);
  console.log('Username=javier:', snap1.size);
  if (!snap1.empty) {
    snap1.forEach(d => console.log('  ', d.data()));
  }
  
  // Buscar por displayName
  const q2 = query(usersRef, where('displayName', '==', 'Javier'));
  const snap2 = await getDocs(q2);
  console.log('DisplayName=Javier:', snap2.size);
  if (!snap2.empty) {
    snap2.forEach(d => console.log('  ', d.data()));
  }
  
  // Listar todos
  const all = await getDocs(usersRef);
  console.log('\nTodos los usuarios:');
  all.forEach(d => {
    const data = d.data();
    console.log(`  - ${data.displayName} (username: ${data.username})`);
  });
}

checkUser();
