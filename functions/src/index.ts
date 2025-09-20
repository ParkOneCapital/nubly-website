// /**
//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// import { setGlobalOptions } from 'firebase-functions';
// import { onRequest } from 'firebase-functions/https';
// import * as logger from 'firebase-functions/logger';

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// // export const helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

import * as admin from 'firebase-admin';
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldValue } from 'firebase-admin/firestore';
import cors from 'cors';

const corsHandler = cors({ origin: true });

admin.initializeApp();
const db = admin.firestore();

export const verifyAccess = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { accessCode, resource } = req.body;

    if (
      !accessCode ||
      typeof accessCode !== 'string' ||
      !resource ||
      typeof resource !== 'string'
    ) {
      res.status(400).json({
        error:
          'Request body must contain string properties "accessCode" and "resource".',
      });
      return;
    }

    try {
      const accessCodeRef = db.collection('accessCodes').doc(accessCode);
      const doc = await accessCodeRef.get();

      if (!doc.exists) {
        res.status(404).json({ hasPermission: false });
        return;
      }

      const data = doc.data();
      const permissions = data?.permissions;
      const firstName = data?.firstName;
      const lastName = data?.lastName;

      if (
        permissions &&
        typeof permissions === 'object' &&
        permissions[resource] &&
        permissions[resource].access === true
      ) {
        res.status(200).json({
          hasPermission: true,
          permisions: permissions,
          accessCode: { accessCode, firstName, lastName },
        });
      } else {
        res
          .status(200)
          .json({ hasPermission: false, permissions: permissions });
      }
    } catch (error) {
      logger.error('Error verifying access:', error);
      res.status(500).json({ error: 'Could not verify access.' });
    }
  });
});

export const researchAccessCode = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Access code is required.' });
      return;
    }

    try {
      const researchCodesDocRef = db
        .collection('accessCodes')
        .doc('researchCodes');
      const docSnapshot = await researchCodesDocRef.get();

      if (!docSnapshot.exists) {
        logger.error('researchCodes document does not exist.');
        res.status(500).json({ error: 'Access code configuration not found.' });
        return;
      }

      const docData = docSnapshot.data();

      if (docData && Object.prototype.hasOwnProperty.call(docData, code)) {
        res.status(200).json({ success: true });
      } else {
        res.status(403).json({ error: 'Invalid access code.' });
      }
    } catch (error) {
      logger.error('Error verifying access code:', error);
      res.status(500).json({ error: 'Could not verify access code.' });
    }
  });
});

export const saveSignUp = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { email, firstName, lastName } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email is required.' });
      return;
    }

    // Query for existing email (in case of legacy or duplicate signups)
    const signUpsRef = db.collection('signUps');
    const existing = await signUpsRef
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Email already exists
      res.status(409).json({
        status: 409,
        message: 'A signup with this email already exists.',
        response: { exists: true },
      });
      return;
    }

    try {
      const response = await db.collection('signUps').add({
        email,
        firstName,
        lastName,
        createdAt: FieldValue.serverTimestamp(),
      });
      res.status(200).json({
        status: 200,
        message: 'Successfully signed up',
        response: { id: response.id },
      });
    } catch (error) {
      logger.error('Error saving signup:', error);
      res.status(500).json({
        status: 500,
        message: 'There was an error saving. Please try again.',
        response: error instanceof Error ? error.message : error,
      });
    }
  });
});

export const savefeedback = onCall(async (request) => {
  const data = request.data;
  // TODO: Add server-side validation for the data object.
  try {
    const response = await db
      .collection('feedback')
      .add({ ...data, createdAt: FieldValue.serverTimestamp() });
    return {
      status: 200,
      message: 'Feedback submitted',
      response: { id: response.id },
    };
  } catch (error) {
    logger.error('Error saving feedback:', error);
    throw new HttpsError(
      'internal',
      'There was an error submitting feedback. Please try again',
    );
  }
});

export const saveViewAppLoginAttempt = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const data = req.body;
    const { accessCode } = data || {};

    if (!accessCode || typeof accessCode !== 'string') {
      res.status(400).json({ error: 'accessCode is required' });
      return;
    }

    const epochMs = Number.isFinite(Date.parse(data?.clientTimestamp))
      ? new Date(data.clientTimestamp).getTime()
      : Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const attemptKey = `${epochMs}_${rand}`;

    const payload = {
      inviteeName: accessCode ?? null,
      [`loginAttempts.${attemptKey}`]: {
        success: data.success,
        interactionType: data.interactionType || null,
        clientTimestamp: data.clientTimestamp || new Date().toISOString(),
        userAgent: data.userAgent || null,
        context: data.context || 'ViewApp',
        createdAt: FieldValue.serverTimestamp(),
      },
    };

    try {
      await db
        .collection('viewAppLogins')
        .doc(accessCode)
        .set(payload, { merge: true });
      res
        .status(200)
        .json({ status: 200, message: 'View App login attempt logged' });
    } catch (error) {
      logger.error('Error logging View App login attempt:', error);
      res.status(500).json({
        status: 500,
        message: 'Error logging View App login attempt',
        response: error instanceof Error ? error.message : error,
      });
    }
  });
});

export const saveResearchLoginAttempt = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const data = req.body;
    const { accessCode, success } = data || {};

    if (!accessCode || typeof accessCode !== 'string') {
      res.status(400).json({ error: 'accessCode is required' });
      return;
    }

    const epochMs = Number.isFinite(Date.parse(data?.clientTimestamp))
      ? new Date(data.clientTimestamp).getTime()
      : Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const attemptKey = `${epochMs}_${rand}`;

    const payload = {
      inviteeName: accessCode ?? null,
      [`loginAttempts.${attemptKey}`]: {
        success: success,
        clientTimestamp: data.clientTimestamp || new Date().toISOString(),
        userAgent: data.userAgent || null,
        context: data.context || 'NublyResearchAuth',
        createdAt: FieldValue.serverTimestamp(),
      },
    };

    try {
      await db
        .collection('researchLogins')
        .doc(accessCode)
        .set(payload, { merge: true });
      res
        .status(200)
        .json({ status: 200, message: 'Research login attempt logged' });
    } catch (error) {
      logger.error('Error logging research login attempt:', error);
      res.status(500).json({
        status: 500,
        message: 'Error logging research login attempt',
        response: error instanceof Error ? error.message : error,
      });
    }
  });
});

export const logResearchInteraction = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // const userAgent =
    //   typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const userAgent = String(req.headers['user-agent']) || 'unknown';

    const data = req.body;
    const { accessCode, cardId, action, success, clientTimestamp, context } =
      data || {};

    if (!accessCode || typeof accessCode !== 'string') {
      res.status(400).json({ error: 'accessCode is required' });
      return;
    }
    if (!cardId || !action) {
      res.status(400).json({ error: 'cardId and action are required' });
      return;
    }

    const epochMs = Number.isFinite(Date.parse(data?.clientTimestamp))
      ? new Date(data.clientTimestamp).getTime()
      : Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const eventKey = `${epochMs}_${rand}`;

    const payload = {
      inviteeName: accessCode ?? null,
      [`events.${eventKey}`]: {
        cardId: cardId,
        action: action, // 'view' | 'download'
        clientTimestamp: clientTimestamp || new Date().toISOString(),
        userAgent: userAgent || null,
        context: context || 'NublyResearch',
        createdAt: FieldValue.serverTimestamp(),
        success: success,
      },
    };

    try {
      await db
        .collection('researchInteractions')
        .doc(accessCode)
        .set(payload, { merge: true });
      res
        .status(200)
        .json({ status: 200, message: 'Research interaction logged' });
    } catch (error) {
      logger.error('Error logging research interaction:', error);
      res.status(500).json({
        status: 500,
        message: 'Error logging research interaction',
        response: error instanceof Error ? error.message : error,
      });
    }
  });
});
