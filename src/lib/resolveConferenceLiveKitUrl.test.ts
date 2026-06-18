import { describe, expect, it } from 'vitest';
import { resolveConferenceLiveKitUrlFromContext } from './resolveConferenceLiveKitUrl';

describe('resolveConferenceLiveKitUrlFromContext', () => {
  it('rewrites LAN livekit url to localhost when the page is opened on localhost', () => {
    expect(
      resolveConferenceLiveKitUrlFromContext({
        serverUrl: 'ws://192.168.1.6:7880',
        pageHostname: 'localhost',
        pageProtocol: 'http:',
        nodeEnv: 'development',
      }),
    ).toBe('ws://localhost:7880');
  });
});
