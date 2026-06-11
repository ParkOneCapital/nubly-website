import admin from 'firebase-admin';
import { EMULATOR_SEED } from './emulator-seed-data.mjs';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'livenublylanding';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    'Refusing to seed: set FIRESTORE_EMULATOR_HOST (e.g. localhost:8080).',
  );
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();

async function seed() {
  for (const [collection, documents] of Object.entries(EMULATOR_SEED)) {
    for (const [docId, data] of Object.entries(documents)) {
      await db.collection(collection).doc(docId).set(data, { merge: true });
      console.log(`Seeded ${collection}/${docId}`);
    }
  }
}

seed()
  .then(() => {
    console.log('Emulator seed complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Emulator seed failed:', error);
    process.exit(1);
  });
