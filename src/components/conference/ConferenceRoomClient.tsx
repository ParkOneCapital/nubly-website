'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { clearConferenceSession, getConferenceSession } from '@/lib/conferenceSession';
import { isSafariBrowser } from '@/lib/isSafariBrowser';
import {
  formatConferenceJoinError,
  resolveConferenceBackendUrl,
} from '@/lib/resolveConferenceBackendUrl';
import {
  getMediaDevicesUnavailableMessage,
  isMediaDevicesAvailable,
} from '@/lib/mediaDevicesSupport';

type ConferenceTokenResponse = {
  server_url: string;
  participant_token: string;
  room_name: string;
  participant_identity: string;
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

type Tile = {
  id: string;
  identity: string;
  isLocal: boolean;
  source: Track.Source;
  track: VideoTrack | null;
};

type AudioAttachment = {
  id: string;
  track: AudioTrack;
};

const parseAvatarListeningPaused = (metadata: string | undefined): boolean => {
  if (!metadata) return false;
  try {
    const parsed = JSON.parse(metadata) as { avatar_listening_paused?: boolean };
    return parsed.avatar_listening_paused === true;
  } catch {
    return false;
  }
};

const getVideoTilesForParticipant = (
  participant: LocalParticipant | RemoteParticipant,
  isLocal: boolean,
): Tile[] => {
  const publications = participant.videoTrackPublications.values();
  const tiles: Tile[] = [];
  for (const publication of publications as Iterable<
    LocalTrackPublication | RemoteTrackPublication
  >) {
    const track = publication.videoTrack;
    if (track && track.kind === 'video') {
      const source = publication.source ?? Track.Source.Camera;
      tiles.push({
        id: `${participant.sid}-${publication.trackSid || source}`,
        identity: participant.identity || participant.sid,
        isLocal,
        source,
        track,
      });
    }
  }
  if (tiles.length === 0) {
    tiles.push({
      id: `${participant.sid}-empty-camera`,
      identity: participant.identity || participant.sid,
      isLocal,
      source: Track.Source.Camera,
      track: null,
    });
  }
  return tiles;
};

function VideoTile({ tile }: { tile: Tile }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !tile.track) return;
    const element = videoRef.current;
    tile.track.attach(element);
    return () => {
      tile.track?.detach(element);
    };
  }, [tile.track]);

  return (
    <div className="rounded-lg border border-slate-300 bg-black/90 p-2">
      <p className="mb-1 text-xs text-slate-200">
        {tile.identity} {tile.isLocal ? '(You)' : ''}{' '}
        {tile.source === Track.Source.ScreenShare ? 'Screen' : 'Camera'}
      </p>
      {tile.track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={tile.isLocal}
          className="h-48 w-full rounded object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded bg-slate-800 text-sm text-slate-300">
          {tile.source === Track.Source.ScreenShare
            ? 'Screen share unavailable'
            : 'Camera unavailable'}
        </div>
      )}
    </div>
  );
}

function RoomAudioAttachments({ attachments }: { attachments: AudioAttachment[] }) {
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
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [audioAttachments, setAudioAttachments] = useState<AudioAttachment[]>([]);
  const [session, setSession] = useState<ReturnType<typeof getConferenceSession>>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [isUpdatingAvatarControl, setIsUpdatingAvatarControl] = useState(false);
  const [isScreenSharePublishing, setIsScreenSharePublishing] = useState(false);
  const [isRecordingUpdating, setIsRecordingUpdating] = useState(false);
  const [egressId, setEgressId] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('');

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
    for (const participant of targetRoom.remoteParticipants.values()) {
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
        setError(value instanceof Error ? value.message : 'Avatar control update failed.');
      } finally {
        setIsUpdatingAvatarControl(false);
      }
    },
    [backendBaseUrl, isUpdatingAvatarControl, session],
  );

  useEffect(() => {
    setSession(getConferenceSession());
    setHasLoadedSession(true);
  }, []);

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

    let createdRoom: Room | null = null;
    const joinRoom = async () => {
      setIsConnecting(true);
      setError('');

      if (
        typeof window !== 'undefined' &&
        !isMediaDevicesAvailable()
      ) {
        setError(
          getMediaDevicesUnavailableMessage(
            window.location.hostname,
            window.location.protocol,
          ),
        );
        setIsConnecting(false);
        return;
      }

      const livekitRoom = new Room(
        isSafariBrowser()
          ? {
              // Safari is stricter about host ICE; dual PC mode is more reliable locally.
              singlePeerConnection: false,
              publishDefaults: { videoCodec: 'h264' },
            }
          : undefined,
      );
      createdRoom = livekitRoom;
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
            }),
          },
        );
        const payload = (await tokenResponse.json()) as ConferenceTokenResponse & {
          error?: string;
          message?: string;
        };
        if (!tokenResponse.ok) {
          throw new Error(payload.message || payload.error || 'Unable to join room.');
        }

        await livekitRoom.connect(
          payload.server_url,
          payload.participant_token,
          buildConferenceConnectOptions(payload),
        );
        await livekitRoom.localParticipant.setMicrophoneEnabled(true);
        await livekitRoom.localParticipant.setCameraEnabled(true);

        const handleRoomRefresh = () => refreshTiles(livekitRoom);
        livekitRoom.on(RoomEvent.TrackSubscribed, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackUnsubscribed, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackPublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.TrackUnpublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.ParticipantConnected, handleRoomRefresh);
        livekitRoom.on(RoomEvent.ParticipantDisconnected, handleRoomRefresh);
        livekitRoom.on(RoomEvent.LocalTrackPublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.LocalTrackUnpublished, handleRoomRefresh);
        livekitRoom.on(RoomEvent.RoomMetadataChanged, () => {
          setAvatarListeningPaused(parseAvatarListeningPaused(livekitRoom.metadata));
        });

        setAvatarListeningPaused(parseAvatarListeningPaused(livekitRoom.metadata));
        refreshTiles(livekitRoom);
        setRoom(livekitRoom);
      } catch (value: unknown) {
        setError(formatConferenceJoinError(value));
        try {
          await livekitRoom.disconnect();
        } catch {
          // ignore disconnect errors during failed startup
        }
      } finally {
        setIsConnecting(false);
      }
    };

    void joinRoom();

    return () => {
      if (createdRoom) {
        void createdRoom.disconnect();
      }
    };
  }, [backendBaseUrl, hasLoadedSession, refreshTiles, router, session]);

  const handleLeave = async () => {
    if (room) {
      await room.disconnect();
    }
    clearConferenceSession();
    setSession(null);
    router.push('/conference-room/access');
  };

  const publishScreenShare = async () => {
    if (!room || isScreenSharePublishing) return;
    setIsScreenSharePublishing(true);
    setError('');
    try {
      await room.localParticipant.setScreenShareEnabled(true);
      refreshTiles(room);
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : 'Unable to start screen share.');
    } finally {
      setIsScreenSharePublishing(false);
    }
  };

  const updateRecording = async (action: 'start' | 'stop') => {
    if (!session || !backendBaseUrl || isRecordingUpdating) return;
    if (session.role !== 'interviewer') {
      setError('Only interviewers can control demo recording.');
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
      setEgressId(payload.egress_id || '');
      setRecordingStatus(payload.status || (action === 'start' ? 'started' : 'stopped'));
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : 'Recording update failed.');
    } finally {
      setIsRecordingUpdating(false);
    }
  };

  const screenShareTiles = tiles.filter(
    (tile) => tile.source === Track.Source.ScreenShare,
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
              Room code: <span className="font-semibold">{session?.roomCode || '-'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Role: {session?.role || '-'} | Display name: {session?.displayName || '-'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void updateAvatarControl(!avatarListeningPaused)}
              disabled={isUpdatingAvatarControl || !room}
              variant={avatarListeningPaused ? 'default' : 'outline'}>
              {avatarListeningPaused ? 'Resume Avatar' : 'Pause Avatar'}
            </Button>
            {process.env.NEXT_PUBLIC_DEMO_RECORDING_ENABLED === 'true' ? (
              <Button
                onClick={() => void publishScreenShare()}
                disabled={!room || isScreenSharePublishing}
                variant="outline">
                {isScreenSharePublishing ? 'Starting Share' : 'Share Screen'}
              </Button>
            ) : null}
            {process.env.NEXT_PUBLIC_DEMO_RECORDING_ENABLED === 'true' &&
            session?.role === 'interviewer' ? (
              egressId ? (
                <Button
                  onClick={() => void updateRecording('stop')}
                  disabled={isRecordingUpdating}
                  variant="destructive">
                  {isRecordingUpdating ? 'Stopping Recording' : 'Stop Recording'}
                </Button>
              ) : (
                <Button
                  onClick={() => void updateRecording('start')}
                  disabled={isRecordingUpdating || !room}>
                  {isRecordingUpdating ? 'Starting Recording' : 'Start Recording'}
                </Button>
              )
            ) : null}
            <Button onClick={() => void handleLeave()} variant="outline">
              Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnecting ? <p className="text-sm">Connecting to conference room...</p> : null}
          <p className="text-sm">
            Avatar listening:{' '}
            <span className="font-semibold">
              {avatarListeningPaused ? 'Paused' : 'Active'}
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
                  <VideoTile key={tile.id} tile={tile} />
                ))}
              </div>
            </section>
          ) : null}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Participants</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {cameraTiles.map((tile) => (
              <VideoTile key={tile.id} tile={tile} />
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

