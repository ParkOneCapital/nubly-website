import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const READY_MARKER = 'All emulators ready';

let seeded = false;
let seeding = false;

function runSeed() {
  if (seeded || seeding) {
    return;
  }

  seeding = true;

  const seed = spawn('node', ['scripts/seed-emulator.mjs'], {
    cwd: rootDir,
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST,
      FIREBASE_PROJECT_ID: 'livenublylanding',
    },
    stdio: 'inherit',
  });

  seed.on('exit', (code) => {
    seeding = false;
    if (code === 0) {
      seeded = true;
      console.log('Use access code "test123" for /feedback/access.');
      return;
    }

    console.error('Emulator seed failed; you can retry with: npm run seed:emulator');
  });
}

function handleEmulatorOutput(chunk) {
  if (!seeded && !seeding && chunk.toString().includes(READY_MARKER)) {
    runSeed();
  }
}

const emulator = spawn(
  'npx',
  ['firebase', 'emulators:start', '--only', 'functions,firestore'],
  {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  },
);

emulator.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  handleEmulatorOutput(chunk);
});

emulator.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  handleEmulatorOutput(chunk);
});

emulator.on('exit', (code) => {
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    emulator.kill(signal);
  });
}
