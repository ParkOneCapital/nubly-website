This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local Firebase emulators

Feedback and other protected flows call Cloud Functions via `NEXT_PUBLIC_FIREBASE_FUNCTION_URL`. For local testing, run emulators in one terminal and Next.js in another.

**Run both commands from the project root** (`nubly-landing-v2/`). The `emulators` script, `firebase.json`, and `.firebaserc` all live there. Running from `functions/` or another directory will not work.

```bash
cd /path/to/nubly-landing-v2

# Terminal 1
npm run emulators

# Terminal 2
npm run dev
```

The `functions/` folder has its own `npm run serve`, but that starts only the Functions emulator. For feedback testing (login + Firestore reads/writes), use `npm run emulators` from the root.

- Emulator UI: [http://localhost:4000](http://localhost:4000)
- Functions: `http://localhost:5001/livenublylanding/us-central1` (set in `.env.development.local`)
- Firestore is seeded automatically on startup with access code `test123` (Bob Smith, `bob.smith@test.com`) — see [`scripts/emulator-seed-data.mjs`](scripts/emulator-seed-data.mjs). To re-seed while emulators are running: `npm run seed:emulator`

Use **`npx firebase`**, not a global `firebase` command. The CLI (`firebase-tools`) is installed as a dev dependency in this repo — if you run `firebase deploy` and see `command not found`, use `npx` from the project root instead.

If Socket blocks installing `firebase-tools` because of a transitive `uuid` CVE, accept the risk once:

```bash
SOCKET_CLI_ACCEPT_RISKS=1 npm install
```

## Deploy Cloud Functions

Run all Firebase CLI commands from the **project root** (`nubly-landing-v2/`). `firebase.json` and `.firebaserc` live there — not in `functions/`.

Build TypeScript, then deploy:

```bash
cd /path/to/nubly-landing-v2

npm run build:functions
npx firebase deploy --only functions
```

First time (or after switching Google accounts):

```bash
npx firebase login
```

Other useful commands:

```bash
npx firebase deploy --only functions:getFeedbackSurvey   # single function
npx firebase functions:log
```

Do **not** rely on a globally installed `firebase` binary unless you maintain it yourself. This project expects `npx firebase` so everyone uses the same `firebase-tools` version from `package.json`.

## Updating the feedback survey

Survey versions live in [`shared/feedback/surveys/`](shared/feedback/surveys/) — one file per version. The registry in [`shared/feedback/surveys/index.ts`](shared/feedback/surveys/index.ts) assembles `SURVEY_DEFINITIONS`. Active version and email field config are in [`shared/feedback/surveyDefinitions.ts`](shared/feedback/surveyDefinitions.ts).

The Next.js form, client validation, and Cloud Functions validation all read from this folder. You do **not** edit a separate functions copy — `npm run build:functions` copies `shared/feedback/` into `functions/src/shared/feedback/` automatically before compiling.

### What is stored in Firestore

Each submission saves:

- `surveyVersion` — e.g. `"1"` or `"2"`
- `email`, `accessCode`, `firstName`, `lastName`
- `responses` — keyed by generic question ids (`q1`, `q2`, …), each with `type` and `value` only

Example:

```json
{
  "surveyVersion": "2",
  "email": "user@example.com",
  "responses": {
    "q1": { "type": "single_select", "value": "b" },
    "q2": { "type": "single_select", "value": "a" },
    "q3": { "type": "text", "value": "Great product" }
  }
}
```

Question labels, option text, and the full survey definition are **not** stored in Firestore. For pandas analysis, join `surveyVersion` against `SURVEY_DEFINITIONS` in this file (or export that map to JSON in your ETL).

The email field is configured separately via `EMAIL_FIELD` in the same file and is stored top-level on the document, not inside `responses`.

### Question structure

- **Question ids** — use generic keys: `q1`, `q2`, `q3`, … (not semantic names like `overallExperience`).
- **Question types** — supported today:
  - `single_select` — A/B/C-style buttons; each option needs `value` (stored in Firestore) and `label` (UI only).
  - `text` — free-text textarea; set `placeholder` and `maxLength`.

When adding a new version, you can change labels, options, question count, and order freely within that version’s `questions` array.

### Change wording only (same instrument)

If you are only fixing typos or clarifying copy and the questions mean the same thing, you can edit the current version in place. Existing Firestore docs keep their answers; new submissions use the updated labels in the UI.

### Ship a new survey version (recommended for structural changes)

Use a new version when you add/remove/reorder questions or change what a question measures.

1. **Create a new survey file** — copy an existing file in `shared/feedback/surveys/` (e.g. `v3.ts` → `v4.ts`) and edit the questions:

   ```ts
   import type { SurveyDefinitionInput } from '../types';

   export const surveyV4 = {
     version: '4',
     questions: [
       { id: 'q1', type: 'single_select', label: '...', options: [...] },
       { id: 'q2', type: 'text', label: '...', placeholder: '...', maxLength: 2000 },
     ],
   } as const satisfies SurveyDefinitionInput;
   ```

2. **Register it** in `shared/feedback/surveys/index.ts`:

   ```ts
   import { surveyV4 } from './v4';

   export const SURVEY_DEFINITIONS = {
     [surveyV1.version]: surveyV1,
     // ...
     [surveyV4.version]: surveyV4,
   } as const satisfies Record<string, SurveyDefinitionInput>;
   ```

   `SurveyVersion` is inferred from these keys — no separate union to maintain.

3. **Point active users at the new version** in `surveyDefinitions.ts`:

   ```ts
   export const CURRENT_SURVEY_VERSION = '4' satisfies SurveyVersion;
   ```

   TypeScript errors if `'4'` is not registered. Keep older survey files so historical Firestore rows remain interpretable.

4. **Rebuild and deploy**:

   ```bash
   npm test
   npm run build:functions
   npm run build
   npx firebase deploy --only functions
   ```

   Deploy the Next.js site separately (e.g. Vercel). Restart local emulators if testing locally (`npm run emulators`).

5. **Verify** at [http://localhost:3000/feedback](http://localhost:3000/feedback).

6. **Restart emulators** if testing locally — the Functions emulator keeps old code in memory until restarted:

   ```bash
   # Stop the running emulator (Ctrl+C), then:
   npm run emulators
   ```

   If you see `surveyVersion is not supported` after bumping the version, the Functions emulator is almost always still running stale code. Run `npm run build:functions`, restart emulators, and hard-refresh the browser.

### Build Cloud Functions (Socket npm note)

From the **project root**, use:

```bash
npm run build:functions
```

Do **not** use `npm --prefix functions run build` if you have Socket Safe npm enabled — it can mis-resolve the script and fail with `Cannot find module '.../build'`.

Alternative from the `functions/` directory:

```bash
cd functions && npm run build
```

### Behaviour notes

- **New submissions** use `CURRENT_SURVEY_VERSION` and validate against that version’s question set.
- **Returning users** who already submitted see their saved answers pre-filled (same `accessCode` document, upserted on resubmit).
- **Resubmitting** overwrites `responses` and `surveyVersion` on that user’s doc — old answers for that access code are replaced, not appended.
- **Server validation** (allowed option values, max text length, required questions) is derived from `SURVEY_DEFINITIONS` in [`shared/feedback/validateSaveFeedback.ts`](shared/feedback/validateSaveFeedback.ts) — no second spec to maintain.

### Related files (usually no edits needed)

| File                                                                                 | Role                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [`shared/feedback/surveys/`](shared/feedback/surveys/)                               | **Add/edit version files** — one file per survey |
| [`shared/feedback/surveys/index.ts`](shared/feedback/surveys/index.ts)               | Register imports into `SURVEY_DEFINITIONS`       |
| [`shared/feedback/surveyDefinitions.ts`](shared/feedback/surveyDefinitions.ts)       | `CURRENT_SURVEY_VERSION`, `EMAIL_FIELD`          |
| [`shared/feedback/validateSaveFeedback.ts`](shared/feedback/validateSaveFeedback.ts) | Server validation logic (reads definitions)      |
| [`src/components/FeedbackSurveyForm.tsx`](src/components/FeedbackSurveyForm.tsx)     | Renders form from `ACTIVE_SURVEY`                |
| [`src/lib/feedback/schema.ts`](src/lib/feedback/schema.ts)                           | Client Zod schema (built from `ACTIVE_SURVEY`)   |

## Node 24 + Socket Safe npm

This project targets **Node.js 24** and is compatible with [Socket Safe npm](https://docs.socket.dev/docs/socket-npm-socket-npx) (`socket npm` / `alias npm="socket-npm"`).

### Known issue

On Node 24, Socket injects Node permission flags into `npm run` via `--node-options`. A quoting bug in Socket CLI causes npm to set a malformed `NODE_OPTIONS` value (literal `'` characters included). Next.js re-parses that value for build workers, drops `--permission`, but keeps the `--allow-*` flags. Node 24 then crashes with:

```text
TypeError [ERR_MISSING_OPTION]: --permission is required
```

Tracked upstream: [socket-cli#1160](https://github.com/SocketDev/socket-cli/issues/1160).

### Workaround (already applied)

`dev`, `build`, and `start` scripts in `package.json` clear `NODE_OPTIONS` before invoking Next.js:

```json
"dev": "env -u NODE_OPTIONS next dev --turbopack"
```

This does **not** weaken Socket's install-time protection — scanning still runs on `npm install`. It only affects `npm run` scripts, which do not install packages.

If you add new scripts that spawn Node workers (e.g. `vitest`, custom build tools), use the same pattern:

```bash
env -u NODE_OPTIONS <command>
```

### What does _not_ help

- **`unset NODE_OPTIONS` in your shell** — works, but must be done every session.
- **`npm config delete node-options`** — Socket injects permission flags at runtime; this setting was already `null` and does not control Socket's behavior.
- **Setting `NODE_OPTIONS` in `~/.bashrc`** — Socket replaces it anyway ([socket-cli#1036](https://github.com/SocketDev/socket-cli/issues/1036)).

### After Socket fixes the bug

Upgrade the CLI (`npm install -g @socketsecurity/cli@latest`) and try removing `env -u NODE_OPTIONS` from scripts. If Next.js still needs extra permissions under Node 24, add a project `.npmrc`:

```ini
node-options=--allow-addons --allow-worker --allow-fs-write=$HOME/Library/Caches/next-swc/*
```

Socket merges project `node-options` with its own permission flags.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
