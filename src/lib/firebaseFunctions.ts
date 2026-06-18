const FIREBASE_FUNCTIONS_BASE =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL ?? '';

function isLocalFunctionsBaseUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

/**
 * In development, route calls through the Next.js dev server so phones on the
 * same network can reach Firebase emulators (localhost on the device is wrong).
 */
export function getFirebaseFunctionUrl(functionName: string): string {
  if (process.env.NODE_ENV === 'development') {
    return `/api/firebase/${functionName}`;
  }

  if (!FIREBASE_FUNCTIONS_BASE) {
    return '';
  }

  return `${FIREBASE_FUNCTIONS_BASE}/${functionName}`;
}

export function isFirebaseFunctionsConfigured(): boolean {
  return (
    process.env.NODE_ENV === 'development' || FIREBASE_FUNCTIONS_BASE.length > 0
  );
}

function unreachableFunctionsMessage(): string {
  if (process.env.NODE_ENV === 'development') {
    return (
      'Could not reach Firebase emulators. Run "npm run emulators" on your Mac, ' +
      'then open this page via your Mac LAN IP (for example http://192.168.1.6:3002), not localhost.'
    );
  }

  if (isLocalFunctionsBaseUrl(FIREBASE_FUNCTIONS_BASE)) {
    return (
      'This site build is configured for local Firebase emulators (localhost). ' +
      'For local testing, use "npm run dev" with emulators running. ' +
      'For production, remove NEXT_PUBLIC_FIREBASE_FUNCTION_URL from .env.local ' +
      'and keep the emulator URL in .env.development.local only, then rebuild.'
    );
  }

  return 'Network error. Please check your connection and try again.';
}

export class FirebaseFunctionRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseFunctionRequestError';
  }
}

export async function postFirebaseFunction<T>(
  functionName: string,
  body: unknown,
): Promise<{ response: Response; data: T }> {
  const url = getFirebaseFunctionUrl(functionName);
  if (!url) {
    throw new FirebaseFunctionRequestError(
      'Server configuration error. Please contact support.',
    );
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FirebaseFunctionRequestError(unreachableFunctionsMessage());
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    throw new FirebaseFunctionRequestError(
      process.env.NODE_ENV === 'development'
        ? unreachableFunctionsMessage()
        : 'Unexpected server response. Please try again.',
    );
  }

  return { response, data };
}
