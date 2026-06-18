import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE,
  isConferenceBackendAvailable,
} from './conferenceBackendAvailability';

describe('conferenceBackendAvailability', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the login unavailable message', () => {
    expect(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE).toContain(
      'not available at this time',
    );
  });

  it('returns false when backend url is empty', async () => {
    await expect(isConferenceBackendAvailable('')).resolves.toBe(false);
  });

  it('returns true when health endpoint responds ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
      }),
    );

    await expect(
      isConferenceBackendAvailable('http://localhost:3000'),
    ).resolves.toBe(true);
  });

  it('returns false when health endpoint is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

    await expect(
      isConferenceBackendAvailable('http://localhost:3000'),
    ).resolves.toBe(false);
  });
});
