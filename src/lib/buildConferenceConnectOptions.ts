import type { RoomConnectOptions } from 'livekit-client';

export type ConferenceIceServer = {
  urls: string[];
  username?: string;
  credential?: string;
};

export type ConferenceTokenConnectInfo = {
  ice_servers?: ConferenceIceServer[];
  ice_transport_policy?: 'relay' | 'all';
  turn_url?: string;
  turn_username?: string;
  turn_password?: string;
};

export function buildConferenceConnectOptions(
  token: ConferenceTokenConnectInfo,
  options?: { preferRelayIce?: boolean },
): RoomConnectOptions {
  const iceServers =
    token.ice_servers?.length
      ? token.ice_servers
      : token.turn_url?.trim()
        ? [
            {
              urls: [token.turn_url.trim()],
              ...(token.turn_username?.trim()
                ? { username: token.turn_username.trim() }
                : {}),
              ...(token.turn_password?.trim()
                ? { credential: token.turn_password.trim() }
                : {}),
            },
          ]
        : undefined;

  // Relay-only ICE requires TURN credentials. Forcing relay without iceServers
  // breaks Firefox/Safari in production where LiveKit uses direct UDP (no TURN).
  if (!iceServers?.length) {
    return {
      autoSubscribe: true,
      ...(options?.preferRelayIce ? { peerConnectionTimeout: 30_000 } : {}),
    };
  }

  const useRelayPolicy =
    token.ice_transport_policy === 'relay' || options?.preferRelayIce === true;

  return {
    autoSubscribe: true,
    ...(useRelayPolicy ? { peerConnectionTimeout: 30_000 } : {}),
    rtcConfig: {
      ...(useRelayPolicy ? { iceTransportPolicy: 'relay' as const } : {}),
      iceServers: iceServers.map((server) => ({
        ...server,
        ...(server.credential
          ? { credentialType: 'password' as const }
          : {}),
      })),
    },
  };
}
