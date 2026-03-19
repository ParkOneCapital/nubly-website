## Environment configuration (`NUBLY_BACKEND_URL`)

This Functions codebase reads `NUBLY_BACKEND_URL` via `process.env.NUBLY_BACKEND_URL` (see `src/index.ts`).

There are **two supported ways** to provide that value depending on whether you’re running locally or deployed.

---

### Option 1 (Recommended): Local via `functions/.env` + Production via **Firebase Functions Secrets (v2)**

This is the best fit for this repo because the functions are implemented using the **v2** API (`firebase-functions/v2/...`).

#### Local (Functions emulator)

- **Set the variable** in `functions/.env`:

```bash
# functions/.env
NUBLY_BACKEND_URL='http://localhost:3000'
```

- **Load the `.env` file** in your functions runtime (the emulator does not automatically load parent `.env` files):
  - Use `dotenv` (or `dotenv-cli`) so `process.env.NUBLY_BACKEND_URL` is set before you read it.

- **Start the emulator** (from the `functions/` directory):

```bash
npm run serve
```

#### Production (deployed Functions)

- **Create/update the secret**:

```bash
firebase functions:secrets:set NUBLY_BACKEND_URL
```

- **Declare the secret** in your function configuration so it’s available at runtime (v2 requires declaring which secrets a function can access).
  - After declaring it, read it in code as `process.env.NUBLY_BACKEND_URL`.

- **Deploy**:

```bash
firebase deploy --only functions
```

Notes:
- Secrets are the recommended way to store sensitive configuration for deployed functions.
- If you need local overrides for secrets, the Functions emulator supports local secret override files (see Firebase Emulator docs for `.secret.local`).

---

### Option 2: Production via **`functions.config()`** (v1-style runtime config)

This is a legacy/1st-gen pattern. Use it only if you explicitly want the `functions.config()` workflow.

#### Production (deployed Functions)

- **Set runtime config**:

```bash
firebase functions:config:set nubly.backend_url="https://api.livenubly.com"
```

- **Access it in code** using `functions.config()`:
  - Example shape: `functions.config().nubly.backend_url`

- **Deploy**:

```bash
firebase deploy --only functions
```

Important tradeoffs:
- `functions.config()` is primarily a **v1** approach. If you’re using v2 functions, prefer **Secrets** (Option 1).
- If you adopt this option, you may need to change how your functions are defined/imported so `functions.config()` is supported in your chosen runtime/API style.

---

### Which option should we use?

- **Use Option 1 (Secrets)** if you want the most straightforward setup with the current v2 Functions code and best-practice production configuration.
- **Use Option 2 (`functions.config()`)** only if you have an explicit reason to keep v1-style runtime config.

