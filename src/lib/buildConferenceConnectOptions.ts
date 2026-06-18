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
  const forceRelay = token.ice_transport_policy === 'relay';
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

  const useRelayPolicy = forceRelay || options?.preferRelayIce === true;

  const rtcConfig =
    useRelayPolicy || iceServers?.length
      ? {
          ...(useRelayPolicy ? { iceTransportPolicy: 'relay' as const } : {}),
          ...(iceServers?.length
            ? {
                iceServers: iceServers.map((server) => ({
                  ...server,
                  ...(server.credential
                    ? { credentialType: 'password' as const }
                    : {}),
                })),
              }
            : {}),
        }
      : undefined;

  return {
    autoSubscribe: true,
    ...(options?.preferRelayIce ? { peerConnectionTimeout: 30_000 } : {}),
    ...(rtcConfig ? { rtcConfig } : {}),
  };
}
