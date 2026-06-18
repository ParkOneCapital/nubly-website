import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FirebaseFunctionRequestError,
  postFirebaseFunction,
} from './firebaseFunctions';

describe('postFirebaseFunction', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 404 verifyAccess responses instead of emulator connection errors', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          hasPermission: false,
          error: 'Invalid access code.',
        }),
      }),
    );

    const { response, data } = await postFirebaseFunction<{
      hasPermission?: boolean;
      error?: string;
    }>('verifyAccess', {
      accessCode: 'missing',
      resource: 'conference-room',
    });

    expect(response.status).toBe(404);
    expect(data.error).toBe('Invalid access code.');
  });

  it('throws when the request cannot reach the functions endpoint', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(
      postFirebaseFunction('verifyAccess', { accessCode: 'x', resource: 'feedback' }),
    ).rejects.toBeInstanceOf(FirebaseFunctionRequestError);
  });
});
