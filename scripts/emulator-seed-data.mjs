/**
 * Firestore documents seeded when running local emulators.
 * Edit this file to add test access codes or other local-only data.
 */
export const EMULATOR_SEED = {
  accessCodes: {
    test123: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@test.com',
      permissions: {
        feedback: { access: true },
      },
    },
  },
};
