import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer,
  terminate,
  clearIndexedDbPersistence,
  setLogLevel
} from 'firebase/firestore';
import localConfig from '../../firebase-applet-config.json';

// Silence verbose internal Firestore SDK console warnings/info logs
try {
  setLogLevel('error');
} catch (e) {
  console.warn('[Firebase] Failed to set log level:', e);
}

// Suppress known benign stream cancellation errors to keep the application console pristine
function isBenignFirestoreMessage(args: any[]): boolean {
  try {
    const message = args.map(arg => {
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ').toLowerCase();

    return (
      message.includes('disconnecting idle stream') ||
      message.includes('cancelled') ||
      message.includes('timed out waiting for new targets') ||
      message.includes('grpcconnection') ||
      message.includes("listen' stream") ||
      message.includes('firebase/firestore')
    );
  } catch {
    return false;
  }
}

const originalError = console.error;
console.error = function (...args: any[]) {
  if (isBenignFirestoreMessage(args)) return;
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = function (...args: any[]) {
  if (isBenignFirestoreMessage(args)) return;
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = function (...args: any[]) {
  if (isBenignFirestoreMessage(args)) return;
  originalLog.apply(console, args);
};

const originalInfo = console.info;
console.info = function (...args: any[]) {
  if (isBenignFirestoreMessage(args)) return;
  originalInfo.apply(console, args);
};

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

// Use initializeFirestore with experimentalForceLongPolling to bypass potential connection issues
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');

export const auth = getAuth(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    console.log('[Firebase] Initiating connection test to database:', firebaseConfig.firestoreDatabaseId);
    // Testing connection to a dummy doc
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log('[Firebase] Connection successful');
  } catch (error: any) {
    console.error('[Firebase] Connection Error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'unavailable') {
      console.warn('[Firebase] Service unavailable. This might be a transient network issue. Retrying with persistence clear...');
      try {
        await terminate(db);
        await clearIndexedDbPersistence(db);
      } catch (e) {
        console.error('[Firebase] Failed to reset persistence:', e);
      }
    }
  }
}

testConnection();
