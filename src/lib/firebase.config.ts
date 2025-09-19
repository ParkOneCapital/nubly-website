import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/app-check';
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions';

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

// // Callable functions for onCall
// const emailExistsCallable = httpsCallable(functions, 'emailexists');
// const viewAppAccessCodeCallable = httpsCallable(functions, 'viewappaccesscode');
// const researchAccessCodeCallable = httpsCallable(
//   functions,
//   'researchaccesscode',
// );
// const saveSignUpCallable = httpsCallable(functions, 'savesignup');
// const saveFeedbackCallable = httpsCallable(functions, 'savefeedback');
// const saveViewAppLoginAttemptCallable = httpsCallable(
//   functions,
//   'saveviewapploginattempt',
// );
// const saveResearchLoginAttemptCallable = httpsCallable(
//   functions,
//   'saveresearchloginattempt',
// );
// const logResearchInteractionCallable = httpsCallable(
//   functions,
//   'logresearchinteraction',
// );

// export const emailExists = async (email: string): Promise<boolean> => {
//   try {
//     const result = await emailExistsCallable({ email });
//     return (result.data as { exists: boolean }).exists;
//   } catch (error) {
//     console.error('Error checking if email exists:', error);
//     return false;
//   }
// };

// export const viewAppAccessCode = async (
//   accessCode: string,
// ): Promise<boolean> => {
//   try {
//     const result = await viewAppAccessCodeCallable({ accessCode });
//     return (result.data as { exists: boolean }).exists;
//   } catch (error) {
//     console.error('Error checking if access code exists:', error);
//     return false;
//   }
// };

// export const researchAccessCode = async (
//   accessCode: string,
// ): Promise<boolean> => {
//   try {
//     const result = await researchAccessCodeCallable({ accessCode });
//     return (result.data as { exists: boolean }).exists;
//   } catch (error) {
//     console.error('Error checking if access code exists:', error);
//     return false;
//   }
// };

// export const save = async (data: any) => {
//   try {
//     const result = await saveSignUpCallable(data);
//     return {
//       status: 200,
//       message: 'Successfully signed up',
//       response: result.data,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: 400,
//       message: 'There was an error saving. Please try again.',
//       response: error,
//     };
//   }
// };

// export const saveFeedback = async (data: any) => {
//   try {
//     const result = await saveFeedbackCallable(data);
//     return {
//       status: 200,
//       message: 'Feedback submitted',
//       response: result.data,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: 400,
//       message: 'There was an error submitting feedback. Please try again',
//       response: error,
//     };
//   }
// };

// export const saveViewAppLoginAttempt = async (data: any) => {
//   try {
//     await saveViewAppLoginAttemptCallable(data);
//     return { status: 200, message: 'View App login attempt logged' };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: 400,
//       message: 'Error logging View App login attempt',
//       response: error,
//     };
//   }
// };

// export const saveResearchLoginAttempt = async (data: any) => {
//   try {
//     await saveResearchLoginAttemptCallable(data);
//     return { status: 200, message: 'Research login attempt logged' };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: 400,
//       message: 'Error logging research login attempt',
//       response: error,
//     };
//   }
// };

// export const logResearchInteraction = async (data: any) => {
//   try {
//     await logResearchInteractionCallable(data);
//     return { status: 200, message: 'Research interaction logged' };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: 400,
//       message: 'Error logging research interaction',
//       response: error,
//     };
//   }
// };
