import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

/**
 * @fileoverview Firebase initialization module.
 * Initializes the Firebase application using environment variables and
 * configures authentication persistence to survive browser reloads.
 *
 * @module hooks/init
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('❌ Error configuring persistence:', error.message);
  });
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export { app, auth };
