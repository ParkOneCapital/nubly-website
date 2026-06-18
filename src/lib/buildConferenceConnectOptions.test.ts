import { describe, expect, it } from 'vitest';
import { buildConferenceConnectOptions } from './buildConferenceConnectOptions';

describe('buildConferenceConnectOptions', () => {
  it('returns autoSubscribe only when no relay policy or ice servers are provided', () => {
    expect(buildConferenceConnectOptions({})).toEqual({ autoSubscribe: true });
  });

  it('applies relay policy and ice servers from token payload', () => {
    const options = buildConferenceConnectOptions({
      ice_transport_policy: 'relay',
      ice_servers: [
        {
          urls: ['turn:relay.example.com:3478'],
          username: 'user',
          credential: 'pass',
        },
      ],
    });

    expect(options.autoSubscribe).toBe(true);
    expect(options.rtcConfig?.iceTransportPolicy).toBe('relay');
    expect(options.rtcConfig?.iceServers).toEqual([
      {
        urls: ['turn:relay.example.com:3478'],
        username: 'user',
        credential: 'pass',
        credentialType: 'password',
      },
    ]);
  });

  it('builds ice servers from turn_url fields when ice_servers is absent', () => {
    const options = buildConferenceConnectOptions({
      turn_url: 'turn:192.168.1.6:3478',
      turn_username: 'lk-user',
      turn_password: 'lk-pass',
    });

    expect(options.rtcConfig?.iceServers).toEqual([
      {
        urls: ['turn:192.168.1.6:3478'],
        username: 'lk-user',
        credential: 'lk-pass',
        credentialType: 'password',
      },
    ]);
  });

  it('does not force relay ICE for Firefox and Safari when token has no TURN', () => {
    const options = buildConferenceConnectOptions({}, { preferRelayIce: true });

    expect(options.rtcConfig).toBeUndefined();
    expect(options.peerConnectionTimeout).toBe(30_000);
  });
});
