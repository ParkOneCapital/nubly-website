import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const functionsDir = join(scriptDir, '..');
const sharedFeedbackDir = join(functionsDir, '..', 'shared', 'feedback');
const destinationDir = join(functionsDir, 'src', 'shared', 'feedback');

rmSync(destinationDir, { recursive: true, force: true });
mkdirSync(destinationDir, { recursive: true });
cpSync(sharedFeedbackDir, destinationDir, {
  recursive: true,
  filter: (source) => !source.endsWith('.test.ts'),
});
