'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  type AudioTrack,
  type LocalParticipant,
  type LocalTrackPublication,
  type RemoteParticipant,
  type RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  type VideoTrack,
} from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildConferenceConnectOptions } from '@/lib/buildConferenceConnectOptions';
import { buildConferenceRoomOptions } from '@/lib/buildConferenceRoomOptions';
import { shouldPreferRelayIce } from '@/lib/conferenceBrowser';
import {
  clearConferenceSession,
  getConferenceSession,
} from '@/lib/conferenceSession';
import {
  AVATAR_DISPLAY_NAME,
  formatConferenceParticipantTileHeaderLabel,
  getConferenceVideoPublicationsForGrid,
  getParticipantDisplayName,
  isAvatarParticipantIdentity,
  isHumanConferenceIdentity,
  shouldShowParticipantInConferenceGrid,
} from '@/lib/conferenceParticipant';
import {
  isAvatarConnectingFromMetadata,
  isAvatarListeningPausedFromMetadata,
  parseConferenceRoomMetadata,
} from '@/lib/conferenceRoomMetadata';
import { formatScreenShareError } from '@/lib/formatScreenShareError';
import { resolveConferenceLiveKitUrl } from '@/lib/resolveConferenceLiveKitUrl';
import {
  formatConferenceJoinError,
  resolveConferenceBackendUrl,
} from '@/lib/resolveConferenceBackendUrl';
import {
  getMediaDevicesUnavailableMessage,
  isMediaDevicesAvailable,
  isScreenShareSupported,
} from '@/lib/mediaDevicesSupport';
import {
  formatConferenceAgentStateLabel,
  formatConferenceAvatarTileHeaderLabel,
  subscribeConferenceAgentState,
  type ConferenceAgentState,
  type ConferenceAvatarTileStatusInput,
} from '@/lib/conferenceAgentState';
import ConferenceFeedbackDialog from '@/components/conference/ConferenceFeedbackDialog';

type ConferenceTokenResponse = {
  server_url: string;
  participant_token: string;
  room_name: string;
  participant_identity: string;
  expected_avatar_identity?: string;
  ice_servers?: Array<{
    urls: string[];
    username?: string;
    credential?: string;
  }>;
  ice_transport_policy?: 'relay' | 'all';
  turn_url?: string;
  turn_username?: string;
  turn_password?: string;
};

type EgressResponse = {
  egress_id?: string;
  status?: string;
  filepath?: string;
  error?: string;
  message?: string;
};

const formatRecordingStatus = (
  status: string | undefined,
  action: 'start' | 'stop',
): string => {
  const normalized = String(status ?? '').trim();
  const labels: Record<string, string> = {
    '0': 'starting',
    '1': 'active',
    '2': 'ending',
    '3': 'complete',
    '4': 'failed',
    '5': 'aborted',
    EGRESS_STARTING: 'starting',
    EGRESS_ACTIVE: 'active',
    EGRESS_ENDING: 'ending',
    EGRESS_COMPLETE: 'complete',
    EGRESS_FAILED: 'failed',
    EGRESS_ABORTED: 'aborted',
  };
  return labels[normalized] || normalized || (action === 'start' ? 'started' : 'stopped');
};

type AvatarDispatchResponse = {
  already_dispatched?: boolean;
  expected_avatar_identity?: string;
  linked_participant_identity?: string;
  error?: string;
  message?: string;
};

type AvatarStopResponse = {
  removed_identities?: string[];
  deleted_dispatch_ids?: string[];
  expected_avatar_identity?: string;
  error?: string;
  message?: string;
};

type Tile = {
  id: string;
  displayName: string;
  isLocal: boolean;
  source: Track.Source;
  track: VideoTrack | null;
  isPending: boolean;
  participant: LocalParticipant | RemoteParticipant;
};

type AudioAttachment = {
  id: string;
  track: AudioTrack;
};

const syncConferenceRoomMetadata = (
  metadata: string | undefined,
  setters: {
    setAvatarListeningPaused: (value: boolean) => void;
    setAvatarConnecting: (value: boolean) => void;
    setExpectedAvatarIdentity: (value: string) => void;
  },
) => {
  setters.setAvatarListeningPaused(
    isAvatarListeningPausedFromMetadata(metadata),
  );
  setters.setAvatarConnecting(isAvatarConnectingFromMetadata(metadata));
  const parsed = parseConferenceRoomMetadata(metadata);
  if (parsed.expected_avatar_identity) {
    setters.setExpectedAvatarIdentity(parsed.expected_avatar_identity);
  }
};

const getVideoTilesForParticipant = (
  participant: LocalParticipant | RemoteParticipant,
  isLocal: boolean,
): Tile[] => {
  if (!shouldShowParticipantInConferenceGrid(participant, isLocal)) {
    return [];
  }

  const tiles: Tile[] = [];
  for (const publication of getConferenceVideoPublicationsForGrid(participant)) {
    const source = publication.source ?? Track.Source.Camera;
    const track = publication.videoTrack ?? null;
    tiles.push({
      id: `${participant.sid}-${publication.trackSid || source}`,
      displayName: getParticipantDisplayName(participant),
      isLocal,
      source,
      track,
      isPending: !track,
      participant,
    });
  }

  if (tiles.length === 0 && !isAvatarParticipantIdentity(participant.identity)) {
    tiles.push({
      id: `${participant.sid}-empty-camera`,
      displayName: getParticipantDisplayName(participant),
      isLocal,
      source: Track.Source.Camera,
      track: null,
      isPending: false,
      participant,
    });
  }
  return tiles;
};

function AvatarConnectingPlaceholder() {
  return (
    <div className="rounded-lg border border-slate-300 bg-black/90 p-2">
      <p className="mb-1 text-xs text-slate-200">
        {formatConferenceAvatarTileHeaderLabel(AVATAR_DISPLAY_NAME, {
          isAvatarWaitingToJoin: true,
        })}
      </p>
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded bg-slate-800 px-4 text-center text-sm text-slate-300">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Waiting for participant to join</span>
        </div>
      </div>
    </div>
  );
}

function VideoTile({
  tile,
  avatarTileStatus,
}: {
  tile: Tile;
  avatarTileStatus?: ConferenceAvatarTileStatusInput;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isScreenShare = tile.source === Track.Source.ScreenShare;

  useEffect(() => {
    if (!videoRef.current || !tile.track) return;
    const element = videoRef.current;
    tile.track.attach(element);
    return () => {
      tile.track?.detach(element);
    };
  }, [tile.track]);

  return (
    <div className="relative rounded-lg border border-slate-300 bg-black/90 p-2">
      <p className="mb-1 text-xs text-slate-200">
        {formatConferenceParticipantTileHeaderLabel({
          displayName: tile.displayName,
          isLocal: tile.isLocal,
          participant: tile.participant,
          source: tile.source,
          avatarTileStatus,
        })}
      </p>
      {tile.track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={tile.isLocal}
          className={
            isScreenShare
              ? 'max-h-[70vh] w-full rounded object-contain'
              : 'aspect-[4/3] w-full rounded object-cover'
          }
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded bg-slate-800 text-sm text-slate-300 ${
            isScreenShare ? 'min-h-[240px]' : 'aspect-[4/3] w-full'
          }`}>
          {isScreenShare
            ? 'Screen share unavailable'
            : tile.isPending
              ? 'Camera connecting...'
              : 'Camera unavailable'}
        </div>
      )}
    </div>
  );
}

function RoomAudioAttachments({
  attachments,
}: {
  attachments: AudioAttachment[];
}) {
  return (
    <div className="hidden">
      {attachments.map((attachment) => (
        <RemoteAudioElement key={attachment.id} track={attachment.track} />
      ))}
    </div>
  );
}

function RemoteAudioElement({ track }: { track: AudioTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const element = audioRef.current;
    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
}

export default function ConferenceRoomClient() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [avatarListeningPaused, setAvatarListeningPaused] = useState(false);
  const [avatarConnecting, setAvatarConnecting] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [audioAttachments, setAudioAttachments] = useState<AudioAttachment[]>(
    [],
  );
  const [session, setSession] =
    useState<ReturnType<typeof getConferenceSession>>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [isUpdatingAvatarControl, setIsUpdatingAvatarControl] = useState(false);
  const [isAvatarStarting, setIsAvatarStarting] = useState(false);
  const [isAvatarStopping, setIsAvatarStopping] = useState(false);
  const [isScreenSharePublishing, setIsScreenSharePublishing] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isMicrophoneUpdating, setIsMicrophoneUpdating] = useState(false);
  const [isRecordingUpdating, setIsRecordingUpdating] = useState(false);
  const [egressId, setEgressId] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('');
  const [expectedAvatarIdentity, setExpectedAvatarIdentity] = useState('');
  const [remoteParticipantIdentities, setRemoteParticipantIdentities] = useState<
    string[]
  >([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [avatarAgentState, setAvatarAgentState] = useState<
    ConferenceAgentState | undefined
  >(undefined);

  const backendBaseUrl = useMemo(
    () =>
      resolveConferenceBackendUrl(
        process.env.NEXT_PUBLIC_NUBLY_BACKEND_URL,
        typeof window !== 'undefined' ? window.location.hostname : undefined,
        typeof window !== 'undefined' ? window.location.protocol : undefined,
      ),
    [],
  );

  const refreshTiles = useCallback((targetRoom: Room) => {
    const localTiles = getVideoTilesForParticipant(
      targetRoom.localParticipant,
      true,
    );

    const remoteTiles: Tile[] = [];
    const remoteAudioAttachments: AudioAttachment[] = [];
    const remoteIdentities: string[] = [];
    for (const participant of targetRoom.remoteParticipants.values()) {
      if (participant.identity) {
        remoteIdentities.push(participant.identity);
      }
      remoteTiles.push(...getVideoTilesForParticipant(participant, false));
      for (const publication of participant.audioTrackPublications.values()) {
        if (publication.audioTrack) {
          remoteAudioAttachments.push({
            id: `${participant.sid}-${publication.trackSid}`,
            track: publication.audioTrack,
          });
        }
      }
    }

    setTiles([...localTiles, ...remoteTiles]);
    setAudioAttachments(remoteAudioAttachments);
    setRemoteParticipantIdentities(remoteIdentities);
  }, []);

  const updateAvatarControl = useCallback(
    async (paused: boolean) => {
      if (!session || !backendBaseUrl || isUpdatingAvatarControl) return;
      setIsUpdatingAvatarControl(true);
      setError('');
      try {
        const response = await fetch(
          `${backendBaseUrl}/api/v1/livekit/conference/avatar-control`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_code: session.accessCode,
              room_code: session.roomCode,
              role: session.role,
              avatar_listening_paused: paused,
            }),
          },
        );
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || 'Unable to update avatar control.');
        }
        setAvatarListeningPaused(paused);
      } catch (value: unknown) {
        setError(
          value instanceof Error
            ? value.message
            : 'Avatar control update failed.',
        );
      } finally {
        setIsUpdatingAvatarControl(false);
      }
    },
    [backendBaseUrl, isUpdatingAvatarControl, session],
  );

  const avatarAgentStateLabel = useMemo(
    () => formatConferenceAgentStateLabel(avatarAgentState),
    [avatarAgentState],
  );

  useEffect(() => {
    if (!room) {
      setAvatarAgentState(undefined);
      return;
    }

    return subscribeConferenceAgentState(room, setAvatarAgentState);
  }, [room]);

  useEffect(() => {
    setSession(getConferenceSession());
    setHasLoadedSession(true);
  }, []);

  useEffect(() => {
    if (!room) {
      setIsMicrophoneEnabled(true);
      return;
    }

    const syncMicrophoneState = () => {
      setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);
    };

    syncMicrophoneState();
    room.on(RoomEvent.LocalTrackPublished, syncMicrophoneState);
    room.on(RoomEvent.LocalTrackUnpublished, syncMicrophoneState);
    room.on(RoomEvent.TrackMuted, syncMicrophoneState);
    room.on(RoomEvent.TrackUnmuted, syncMicrophoneState);

    return () => {
      room.off(RoomEvent.LocalTrackPublished, syncMicrophoneState);
      room.off(RoomEvent.LocalTrackUnpublished, syncMicrophoneState);
      room.off(RoomEvent.TrackMuted, syncMicrophoneState);
      room.off(RoomEvent.TrackUnmuted, syncMicrophoneState);
    };
  }, [room]);

  useEffect(() => {
    if (!hasLoadedSession) {
      return;
    }
    if (!session) {
      router.replace('/conference-room/access');
      return;
    }
    if (!backendBaseUrl) {
      setError('NEXT_PUBLIC_NUBLY_BACKEND_URL is not configured.');
      setIsConnecting(false);
      return;
    }

    let disposed = false;
    let activeRoom: Room | null = null;

    const joinRoom = async () => {
      setIsConnecting(true);
      setError('');

      if (typeof window !== 'undefined' && !isMediaDevicesAvailable()) {
        setError(
          getMediaDevicesUnavailableMessage(
            window.location.hostname,
            window.location.protocol,
          ),
        );
        setIsConnecting(false);
        return;
      }

      const livekitRoom = new Room(buildConferenceRoomOptions());
      activeRoom = livekitRoom;
      const preferRelayIce = shouldPreferRelayIce();
      try {
        const tokenResponse = await fetch(
          `${backendBaseUrl}/api/v1/livekit/conference/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_code: session.accessCode,
              room_code: session.roomCode,
              role: session.role,
              display_name: session.displayName,
              ...(process.env.NEXT_PUBLIC_DEMO_RECORDING_ENABLED === 'true'
                ? { demo_recording: true }
                : {}),
              ...(process.env.NEXT_PUBLIC_LIVEKIT_AVATAR_PROVIDER?.trim()
                ? {
                    avatar_provider:
                      process.env.NEXT_PUBLIC_LIVEKIT_AVATAR_PROVIDER.trim(),
                  }
                : {}),
            }),
          },
        );
        const payload =
          (await tokenResponse.json()) as ConferenceTokenResponse & {
            error?: string;
            message?: string;
          };
        if (!tokenResponse.ok) {
          throw new Error(
            payload.message || payload.error || 'Unable to join room.',
          );
        }

        if (disposed) {
          return;
        }

        const livekitUrl =
          typeof window !== 'undefined'
            ? resolveConferenceLiveKitUrl(
                payload.server_url,
                window.location.hostname,
                window.location.protocol,
              )
            : payload.server_url;

        await livekitRoom.connect(
          livekitUrl,
          payload.participant_token,
          buildConferenceConnectOptions(payload, { preferRelayIce }),
        );

        if (disposed) {
          await livekitRoom.disconnect();
          return;
        }

        await livekitRoom.localParticipant.setMicrophoneEnabled(true);
        await livekitRoom.localParticipant.setCameraEnabled(true);

        const handleRoomRefresh = () => refreshTiles(livekitRoom);
        livekitRoom.on(RoomEvent.TrackSubscribed, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackUnsubscribed, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackPublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackUnpublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.ParticipantConnected, handleRoomRefresh);
        livekitRoom.on(RoomEvent.ParticipantDisconnected, handleRoomRefresh);
        livekitRoom.on(RoomEvent.ParticipantAttributesChanged, handleRoomRefresh);
        livekitRoom.on(RoomEvent.LocalTrackPublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.LocalTrackUnpublished, handleRoomRefresh);
        livekitRoom.on(
          RoomEvent.TrackSubscriptionFailed,
          (trackSid, participant, reason) => {
            console.warn('Track subscription failed', {
              trackSid,
              participant: participant.identity,
              reason,
            });
            handleRoomRefresh();
          },
        );
        livekitRoom.on(RoomEvent.RoomMetadataChanged, () => {
          syncConferenceRoomMetadata(livekitRoom.metadata, {
            setAvatarListeningPaused,
            setAvatarConnecting,
            setExpectedAvatarIdentity,
          });
        });

        syncConferenceRoomMetadata(livekitRoom.metadata, {
          setAvatarListeningPaused,
          setAvatarConnecting,
          setExpectedAvatarIdentity,
        });
        if (!livekitRoom.metadata && payload.expected_avatar_identity) {
          setExpectedAvatarIdentity(payload.expected_avatar_identity);
        }
        refreshTiles(livekitRoom);
        setRoom(livekitRoom);
      } catch (value: unknown) {
        if (!disposed) {
          setError(formatConferenceJoinError(value));
        }
        try {
          await livekitRoom.disconnect();
        } catch {
          // ignore disconnect errors during failed startup
        }
      } finally {
        if (!disposed) {
          setIsConnecting(false);
        }
      }
    };

    void joinRoom();

    return () => {
      disposed = true;
      if (activeRoom) {
        void activeRoom.disconnect();
      }
    };
  }, [backendBaseUrl, hasLoadedSession, refreshTiles, router, session]);

  const handleLeave = async () => {
    const activeSession = session;
    if (room) {
      const hasLocalScreenShare = Array.from(
        room.localParticipant.videoTrackPublications.values(),
      ).some(
        (publication) =>
          publication.source === Track.Source.ScreenShare &&
          Boolean(publication.track),
      );
      if (hasLocalScreenShare) {
        try {
          await room.localParticipant.setScreenShareEnabled(false);
        } catch {
          // Continue leaving even if screen share cleanup fails.
        }
      }
      await room.disconnect();
    }
    if (activeSession && backendBaseUrl) {
      try {
        await fetch(`${backendBaseUrl}/api/v1/livekit/conference/session-ended`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_code: activeSession.accessCode,
            room_code: activeSession.roomCode,
            role: activeSession.role,
          }),
        });
      } catch {
        // LiveKit webhooks perform authoritative teardown if this notify fails.
      }
    }
    clearConferenceSession();
    setSession(null);
    router.push('/conference-room/access');
  };

  const toggleMicrophone = async () => {
    if (!room || isMicrophoneUpdating) return;
    setIsMicrophoneUpdating(true);
    setError('');
    try {
      const nextEnabled = !room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(nextEnabled);
      setIsMicrophoneEnabled(nextEnabled);
    } catch (value: unknown) {
      setError(
        value instanceof Error ? value.message : 'Unable to update microphone.',
      );
    } finally {
      setIsMicrophoneUpdating(false);
    }
  };

  const isDemoScreenShareEnabled =
    process.env.NEXT_PUBLIC_DEMO_RECORDING_ENABLED === 'true';
  const canShareScreen =
    isDemoScreenShareEnabled && isScreenShareSupported();

  const setScreenShareEnabled = async (enabled: boolean) => {
    if (!room || isScreenSharePublishing) return;
    setIsScreenSharePublishing(true);
    setError('');
    try {
      await room.localParticipant.setScreenShareEnabled(enabled);
      refreshTiles(room);
    } catch (value: unknown) {
      setError(formatScreenShareError(value, enabled && isDemoScreenShareEnabled));
    } finally {
      setIsScreenSharePublishing(false);
    }
  };

  const targetParticipantIdentity = (() => {
    const localIdentity = room?.localParticipant.identity;
    if (localIdentity && isHumanConferenceIdentity(localIdentity)) {
      return localIdentity;
    }
    return remoteParticipantIdentities.find((identity) =>
      isHumanConferenceIdentity(identity),
    );
  })();
  const hasAvatarParticipant = expectedAvatarIdentity
    ? remoteParticipantIdentities.includes(expectedAvatarIdentity)
    : remoteParticipantIdentities.some((identity) =>
        identity.includes('avatar-agent'),
      );

  useEffect(() => {
    if (hasAvatarParticipant) {
      setIsAvatarStarting(false);
      setAvatarConnecting(false);
    }
  }, [hasAvatarParticipant]);

  const isAvatarWaitingToJoin =
    !hasAvatarParticipant && (isAvatarStarting || avatarConnecting);

  const avatarTileStatus = useMemo<ConferenceAvatarTileStatusInput>(
    () => ({
      isAvatarWaitingToJoin,
      isAvatarStopping,
      avatarListeningPaused,
      agentStateLabel: avatarAgentStateLabel,
    }),
    [
      avatarAgentStateLabel,
      avatarListeningPaused,
      isAvatarStopping,
      isAvatarWaitingToJoin,
    ],
  );

  const dispatchAvatar = async () => {
    if (!session || !backendBaseUrl || !room || isAvatarStarting) return;
    if (!targetParticipantIdentity) {
      setError(
        'A moderator or participant must join before starting the avatar.',
      );
      return;
    }

    setIsAvatarStarting(true);
    setError('');
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/v1/livekit/conference/avatar-dispatch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_code: session.accessCode,
            room_code: session.roomCode,
            role: session.role,
            participant_identity: targetParticipantIdentity,
            ...(process.env.NEXT_PUBLIC_LIVEKIT_AVATAR_PROVIDER?.trim()
              ? {
                  avatar_provider:
                    process.env.NEXT_PUBLIC_LIVEKIT_AVATAR_PROVIDER.trim(),
                }
              : {}),
          }),
        },
      );
      const payload = (await response.json()) as AvatarDispatchResponse;
      if (!response.ok) {
        throw new Error(
          payload.message || payload.error || 'Unable to start avatar.',
        );
      }
      if (payload.expected_avatar_identity) {
        setExpectedAvatarIdentity(payload.expected_avatar_identity);
      }
      refreshTiles(room);
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : 'Unable to start avatar.');
      setIsAvatarStarting(false);
    }
  };

  const stopAvatar = async () => {
    if (!session || !backendBaseUrl || !room || isAvatarStopping) return;

    setIsAvatarStopping(true);
    setError('');
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/v1/livekit/conference/avatar-stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_code: session.accessCode,
            room_code: session.roomCode,
            role: session.role,
          }),
        },
      );
      const payload = (await response.json()) as AvatarStopResponse;
      if (!response.ok) {
        throw new Error(
          payload.message || payload.error || 'Unable to stop avatar.',
        );
      }
      refreshTiles(room);
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : 'Unable to stop avatar.');
    } finally {
      setIsAvatarStopping(false);
    }
  };

  const updateRecording = async (action: 'start' | 'stop') => {
    if (!session || !backendBaseUrl || isRecordingUpdating) return;
    if (session.role !== 'moderator') {
      setError('Only moderators can control demo recording.');
      return;
    }
    setIsRecordingUpdating(true);
    setError('');
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/v1/livekit/conference/egress/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_code: session.accessCode,
            room_code: session.roomCode,
            role: session.role,
            ...(action === 'stop' ? { egress_id: egressId } : {}),
          }),
        },
      );
      const payload = (await response.json()) as EgressResponse;
      if (!response.ok) {
        throw new Error(
          payload.message || payload.error || `Unable to ${action} recording.`,
        );
      }
      if (action === 'stop') {
        setEgressId('');
      } else {
        setEgressId(payload.egress_id || '');
      }
      setRecordingStatus(formatRecordingStatus(payload.status, action));
    } catch (value: unknown) {
      setError(
        value instanceof Error ? value.message : 'Recording update failed.',
      );
    } finally {
      setIsRecordingUpdating(false);
    }
  };

  const screenShareTiles = tiles.filter(
    (tile) => tile.source === Track.Source.ScreenShare,
  );
  const isLocalScreenShareActive = screenShareTiles.some(
    (tile) => tile.isLocal && Boolean(tile.track),
  );
  const cameraTiles = tiles.filter(
    (tile) => tile.source !== Track.Source.ScreenShare,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Conference Room</CardTitle>
            <p className="text-sm text-muted-foreground">
              Room code:{' '}
              <span className="font-semibold">{session?.roomCode || '-'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Role: {session?.role || '-'} | Display name:{' '}
              {session?.displayName || '-'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void toggleMicrophone()}
              disabled={!room || isMicrophoneUpdating}
              variant={isMicrophoneEnabled ? 'outline' : 'default'}>
              {isMicrophoneUpdating
                ? 'Updating Mic'
                : isMicrophoneEnabled
                  ? 'Mute'
                  : 'Unmute'}
            </Button>
            {!hasAvatarParticipant ? (
              <Button
                onClick={() => void dispatchAvatar()}
                disabled={
                  !room || isAvatarStarting || !targetParticipantIdentity
                }>
                {isAvatarStarting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Starting Avatar
                  </>
                ) : (
                  'Start Avatar'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => void stopAvatar()}
                disabled={!room || isAvatarStopping}
                variant="destructive">
                {isAvatarStopping ? 'Stopping Avatar' : 'Stop Avatar'}
              </Button>
            )}
            <Button
              onClick={() => void updateAvatarControl(!avatarListeningPaused)}
              disabled={
                isUpdatingAvatarControl || !room || !hasAvatarParticipant
              }
              variant={avatarListeningPaused ? 'default' : 'outline'}>
              {avatarListeningPaused ? 'Resume Avatar' : 'Pause Avatar'}
            </Button>
            {canShareScreen ? (
              isLocalScreenShareActive ? (
                <Button
                  onClick={() => void setScreenShareEnabled(false)}
                  disabled={!room || isScreenSharePublishing}
                  variant="destructive">
                  {isScreenSharePublishing
                    ? 'Stopping Share'
                    : 'Stop Screen Share'}
                </Button>
              ) : (
                <Button
                  onClick={() => void setScreenShareEnabled(true)}
                  disabled={!room || isScreenSharePublishing}
                  variant="outline">
                  {isScreenSharePublishing ? 'Starting Share' : 'Share Screen'}
                </Button>
              )
            ) : null}
            {process.env.NEXT_PUBLIC_DEMO_RECORDING_ENABLED === 'true' &&
            session?.role === 'moderator' ? (
              egressId ? (
                <Button
                  onClick={() => void updateRecording('stop')}
                  disabled={isRecordingUpdating}
                  variant="destructive">
                  {isRecordingUpdating
                    ? 'Stopping Recording'
                    : 'Stop Recording'}
                </Button>
              ) : (
                <Button
                  onClick={() => void updateRecording('start')}
                  disabled={isRecordingUpdating || !room}>
                  {isRecordingUpdating
                    ? 'Starting Recording'
                    : 'Start Recording'}
                </Button>
              )
            ) : null}
            <Button
              onClick={() => setIsFeedbackOpen(true)}
              variant="outline"
              disabled={!session}>
              Feedback
            </Button>
            <Button onClick={() => void handleLeave()} variant="outline">
              Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnecting ? (
            <p className="text-sm">Connecting to conference room...</p>
          ) : null}
          <p className="text-sm">
            Microphone:{' '}
            <span className="font-semibold">
              {isMicrophoneEnabled ? 'On' : 'Muted'}
            </span>
          </p>
          {recordingStatus ? (
            <p className="text-sm">
              Recording status:{' '}
              <span className="font-semibold">{recordingStatus}</span>
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <RoomAudioAttachments attachments={audioAttachments} />
          {screenShareTiles.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">Shared app screen</h2>
              <div className="grid grid-cols-1 gap-3">
                {screenShareTiles.map((tile) => (
                  <VideoTile
                    key={tile.id}
                    tile={tile}
                    avatarTileStatus={avatarTileStatus}
                  />
                ))}
              </div>
            </section>
          ) : null}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Participants</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cameraTiles.map((tile) => (
                <VideoTile
                  key={tile.id}
                  tile={tile}
                  avatarTileStatus={avatarTileStatus}
                />
              ))}
              {isAvatarWaitingToJoin ? (
                <AvatarConnectingPlaceholder key="avatar-connecting" />
              ) : null}
            </div>
          </section>
        </CardContent>
      </Card>
      {session ? (
        <ConferenceFeedbackDialog
          open={isFeedbackOpen}
          onOpenChange={setIsFeedbackOpen}
          accessCode={session.accessCode}
          displayName={session.displayName}
        />
      ) : null}
    </main>
  );
}
