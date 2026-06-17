import { describe, expect, it } from 'vitest';
import {
  formatConferenceJoinError,
  resolveConferenceBackendUrl,
  resolveConferenceBackendUrlFromContext,
} from './resolveConferenceBackendUrl';

describe('resolveConferenceBackendUrl', () => {
  it('returns configured url on localhost browser', () => {
    expect(
      resolveConferenceBackendUrl('http://localhost:3000', 'localhost'),
    ).toBe('http://localhost:3000');
  });

  it('rewrites localhost backend to LAN host when page is opened from phone', () => {
    expect(
      resolveConferenceBackendUrl('http://localhost:3000', '192.168.1.6'),
    ).toBe('http://192.168.1.6:3000');
  });

  it('keeps explicit LAN backend url unchanged', () => {
    expect(
      resolveConferenceBackendUrl('http://192.168.1.6:3000', '192.168.1.6'),
    ).toBe('http://192.168.1.6:3000');
  });

  it('uses same-origin proxy over HTTPS in development', () => {
    expect(
      resolveConferenceBackendUrlFromContext({
        configuredUrl: 'http://localhost:3000',
        pageHostname: 'abc123.ngrok-free.app',
        pageProtocol: 'https:',
        nodeEnv: 'development',
      }),
    ).toBe('/api/nubly');
  });
});

describe('formatConferenceJoinError', () => {
  it('maps Safari load failures to actionable guidance', () => {
    expect(formatConferenceJoinError(new Error('Load failed'))).toContain(
      'Could not reach the Nubly backend',
    );
  });
});
