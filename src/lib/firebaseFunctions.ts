const FIREBASE_FUNCTIONS_BASE =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL ?? '';

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
    if (process.env.NODE_ENV === 'development') {
      throw new FirebaseFunctionRequestError(
        'Could not reach Firebase emulators. Run "npm run emulators" in one terminal and "npm run dev" in another, then try again.',
      );
    }

    throw new FirebaseFunctionRequestError(
      'Network error. Please check your connection and try again.',
    );
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    throw new FirebaseFunctionRequestError(
      'Unexpected server response. Please try again.',
    );
  }

  return { response, data };
}
