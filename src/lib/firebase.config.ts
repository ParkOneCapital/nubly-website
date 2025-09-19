import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/app-check';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const reCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

if (typeof window !== 'undefined' && reCAPTCHA_SITE_KEY) {
  const appCheck = firebase.appCheck();
  appCheck.activate(reCAPTCHA_SITE_KEY, true);
}

const functions = getFunctions(firebase.app());

if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
  // The db instance can still be used for local emulator connection
  // if you have any read-only client-side logic or subscriptions.
  const db = firebase.firestore();
  db.useEmulator('localhost', 4000);
}
