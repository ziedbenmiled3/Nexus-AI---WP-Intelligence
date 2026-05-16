import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import localConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Testing connection to a dummy doc
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log('[Firebase] Connection successful');
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase] Please check your Firebase configuration: Client is offline.");
    } else {
      console.warn('[Firebase] Connection test result:', error);
    }
  }
}

testConnection();
