'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { subscribeConferenceAgentThinking } from '@/lib/conferenceAgentState';
import {
  AVATAR_DISPLAY_NAME,
  getConferenceVideoPublicationsForGrid,
  getConferenceVideoSourceLabel,
  getParticipantDisplayName,
  isAvatarParticipantIdentity,
  shouldShowParticipantInConferenceGrid,
} from '@/lib/conferenceParticipant';
import {
  isAvatarConnectingFromMetadata,
  parseConferenceRoomMetadata,
} from '@/lib/conferenceRoomMetadata';

type RecordingTile = {
  id: string;
  displayName: string;
  source: Track.Source;
  track: VideoTrack | null;
  participant: LocalParticipant | RemoteParticipant;
};

type AudioAttachment = {
  id: string;
  track: AudioTrack;
};

function getVideoTilesForParticipant(
  participant: LocalParticipant | RemoteParticipant,
  isLocal: boolean,
): RecordingTile[] {
  if (!shouldShowParticipantInConferenceGrid(participant, isLocal)) {
    return [];
  }

  const tiles: RecordingTile[] = [];
  for (const publication of getConferenceVideoPublicationsForGrid(participant)) {
    const source = publication.source ?? Track.Source.Camera;
    const track = publication.videoTrack ?? null;
    tiles.push({
      id: `${participant.sid}-${publication.trackSid || source}`,
      displayName: getParticipantDisplayName(participant),
      source,
      track,
      participant,
    });
  }

  return tiles;
}

function AvatarConnectingPlaceholder({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex min-h-0 flex-col rounded-xl bg-black p-2 text-white ${
        compact ? 'h-full' : ''
      }`}
    >
      <div className="mb-2 text-sm font-semibold">
        {AVATAR_DISPLAY_NAME}{' '}
        <span className="text-xs text-slate-300">Camera</span>
      </div>
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-3 rounded-lg bg-slate-800 px-4 text-center text-sm text-slate-300 ${
          compact ? 'min-h-[180px]' : 'aspect-[4/3] w-full'
        }`}
      >
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <span>Waiting for participant to join</span>
      </div>
    </div>
  );
}

function RecordingVideoTile({
  tile,
  primary,
  showThinkingOverlay = false,
}: {
  tile: RecordingTile;
  primary?: boolean;
  showThinkingOverlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceLabel = getConferenceVideoSourceLabel(tile.participant, tile.source);

  useEffect(() => {
    if (!videoRef.current || !tile.track) return;
    const element = videoRef.current;
    tile.track.attach(element);
    return () => {
      tile.track?.detach(element);
    };
  }, [tile.track]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl bg-black p-2 text-white">
      <div className="mb-2 text-sm font-semibold">
        {tile.displayName}{' '}
        <span className="text-xs text-slate-300">{sourceLabel}</span>
      </div>
      <div className="relative min-h-0 flex-1">
        {tile.track ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full rounded-lg ${
              primary ? 'object-contain' : 'object-cover'
            } ${tile.source === Track.Source.ScreenShare ? 'min-h-[240px]' : 'aspect-[4/3]'}`}
          />
        ) : (
          <div className="flex h-full min-h-[180px] flex-1 items-center justify-center rounded-lg bg-slate-900">
            Waiting for track
          </div>
        )}
        {showThinkingOverlay ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-black/50 px-3 text-sm text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RecordingAudio({ attachments }: { attachments: AudioAttachment[] }) {
  return (
    <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
      {attachments.map((attachment) => (
        <RecordingAudioElement key={attachment.id} track={attachment.track} />
      ))}
    </div>
  );
}

function RecordingAudioElement({ track }: { track: AudioTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const element = audioRef.current;
    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

const FRAME_DECODE_TIMEOUT_MS = 5000;
const MIN_SUBSCRIBE_DELAY_MS = 500;

async function hasDecodedVideoFrame(
  publication: LocalTrackPublication | RemoteTrackPublication,
): Promise<boolean> {
  if (publication.kind !== Track.Kind.Video || !publication.videoTrack) {
    return false;
  }
  const stats = await publication.videoTrack.getRTCStatsReport();
  if (!stats) return false;
  return Array.from(stats).some(
    (item) =>
      item[1].type === 'inbound-rtp' &&
      'framesDecoded' in item[1] &&
      Number(item[1].framesDecoded) > 0,
  );
}

async function shouldStartRecording(room: Room, elapsedMs: number): Promise<boolean> {
  let hasVideoTracks = false;
  let hasDecodedFrames = false;
  let hasSubscribedTracks = false;
  let hasPublishedAudio = false;
  let hasSubscribedAudio = false;

  for (const participant of room.remoteParticipants.values()) {
    for (const publication of participant.trackPublications.values()) {
      if (publication.isSubscribed) {
        hasSubscribedTracks = true;
      }
      if (publication.kind === Track.Kind.Audio) {
        hasPublishedAudio = true;
        if (publication.isSubscribed && publication.audioTrack) {
          hasSubscribedAudio = true;
        }
      }
      if (publication.kind === Track.Kind.Video) {
        hasVideoTracks = true;
        if (await hasDecodedVideoFrame(publication)) {
          hasDecodedFrames = true;
        }
      }
    }
  }

  const audioReady = !hasPublishedAudio || hasSubscribedAudio;
  if (hasDecodedFrames && audioReady) {
    return true;
  }
  if (
    !hasVideoTracks &&
    hasSubscribedTracks &&
    elapsedMs > MIN_SUBSCRIBE_DELAY_MS &&
    audioReady
  ) {
    return true;
  }
  if (elapsedMs > FRAME_DECODE_TIMEOUT_MS && hasSubscribedTracks && audioReady) {
    return true;
  }

  return false;
}

function syncConferenceRoomMetadata(
  metadata: string | undefined,
  setters: {
    setAvatarConnecting: (value: boolean) => void;
    setExpectedAvatarIdentity: (value: string) => void;
  },
) {
  setters.setAvatarConnecting(isAvatarConnectingFromMetadata(metadata));
  const parsed = parseConferenceRoomMetadata(metadata);
  if (parsed.expected_avatar_identity) {
    setters.setExpectedAvatarIdentity(parsed.expected_avatar_identity);
  }
}

export default function RecordingViewClient() {
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [tiles, setTiles] = useState<RecordingTile[]>([]);
  const [audioAttachments, setAudioAttachments] = useState<AudioAttachment[]>([]);
  const [error, setError] = useState('');
  const [avatarConnecting, setAvatarConnecting] = useState(false);
  const [expectedAvatarIdentity, setExpectedAvatarIdentity] = useState('');
  const [isAvatarThinking, setIsAvatarThinking] = useState(false);

  const connection = useMemo(
    () => ({
      url: searchParams.get('url') || '',
      token: searchParams.get('token') || '',
    }),
    [searchParams],
  );

  const refreshTiles = (targetRoom: Room) => {
    const remoteParticipants = [...targetRoom.remoteParticipants.values()];
    const nextTiles = [
      ...getVideoTilesForParticipant(targetRoom.localParticipant, true),
      ...remoteParticipants.flatMap((participant) =>
        getVideoTilesForParticipant(participant, false),
      ),
    ];
    const nextAudioAttachments = remoteParticipants.flatMap((participant) =>
      [...participant.audioTrackPublications.values()]
        .filter(
          (publication) =>
            publication.isSubscribed && Boolean(publication.audioTrack),
        )
        .map((publication) => ({
          id: `${participant.sid}-${publication.trackSid}`,
          track: publication.audioTrack as AudioTrack,
        })),
    );
    setTiles(nextTiles);
    setAudioAttachments(nextAudioAttachments);
  };

  useEffect(() => {
    if (!room) {
      setIsAvatarThinking(false);
      return;
    }

    return subscribeConferenceAgentThinking(room, setIsAvatarThinking);
  }, [room]);

  useEffect(() => {
    if (!connection.url || !connection.token) {
      setError('Missing LiveKit recorder URL or token.');
      return;
    }

    const recordingRoom = new Room();
    let hasStartedRecording = false;
    let startRecordingInterval: ReturnType<typeof setInterval> | undefined;

    const markReady = () => {
      refreshTiles(recordingRoom);
    };

    const syncMetadata = () => {
      syncConferenceRoomMetadata(recordingRoom.metadata, {
        setAvatarConnecting,
        setExpectedAvatarIdentity,
      });
    };

    const beginRecordingCapture = () => {
      if (hasStartedRecording) return;
      hasStartedRecording = true;
      if (startRecordingInterval) {
        clearInterval(startRecordingInterval);
        startRecordingInterval = undefined;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('START_RECORDING');
        });
      });
    };

    recordingRoom.on(RoomEvent.TrackSubscribed, markReady);
    recordingRoom.on(RoomEvent.TrackUnsubscribed, markReady);
    recordingRoom.on(RoomEvent.TrackPublished, markReady);
    recordingRoom.on(RoomEvent.TrackUnpublished, markReady);
    recordingRoom.on(RoomEvent.ParticipantConnected, markReady);
    recordingRoom.on(RoomEvent.ParticipantDisconnected, markReady);
    recordingRoom.on(RoomEvent.ParticipantAttributesChanged, markReady);
    recordingRoom.on(RoomEvent.RoomMetadataChanged, syncMetadata);

    void recordingRoom
      .connect(connection.url, connection.token, { autoSubscribe: true })
      .then(() => {
        setRoom(recordingRoom);
        syncMetadata();
        markReady();
        const startTime = Date.now();
        startRecordingInterval = setInterval(() => {
          void shouldStartRecording(
            recordingRoom,
            Date.now() - startTime,
          ).then((ready) => {
            if (ready) {
              beginRecordingCapture();
            }
          });
        }, 100);
      })
      .catch((value: unknown) => {
        setError(value instanceof Error ? value.message : 'Unable to connect recorder.');
      });

    return () => {
      if (startRecordingInterval) {
        clearInterval(startRecordingInterval);
      }
      console.log('END_RECORDING');
      void recordingRoom.disconnect();
    };
  }, [connection.token, connection.url]);

  const remoteParticipantIdentities = room
    ? Array.from(room.remoteParticipants.values()).map(
        (participant) => participant.identity,
      )
    : [];
  const hasAvatarParticipant = expectedAvatarIdentity
    ? remoteParticipantIdentities.includes(expectedAvatarIdentity)
    : remoteParticipantIdentities.some((identity) =>
        identity.includes('avatar-agent'),
      );

  useEffect(() => {
    if (hasAvatarParticipant) {
      setAvatarConnecting(false);
    }
  }, [hasAvatarParticipant]);

  const isAvatarWaitingToJoin = !hasAvatarParticipant && avatarConnecting;

  const screenTiles = tiles.filter((tile) => tile.source === Track.Source.ScreenShare);
  const cameraTiles = tiles.filter((tile) => tile.source !== Track.Source.ScreenShare);
  const primaryTile = screenTiles[0] || cameraTiles[0];
  const sideTiles = primaryTile
    ? tiles.filter((tile) => tile.id !== primaryTile.id)
    : tiles;

  const showThinkingOnTile = (tile: RecordingTile) =>
    isAvatarParticipantIdentity(tile.participant.identity) && isAvatarThinking;

  return (
    <main className="flex h-screen w-screen gap-4 bg-slate-950 p-4 text-white">
      <RecordingAudio attachments={audioAttachments} />
      {error ? (
        <div className="m-auto rounded-xl bg-red-950 p-6 text-lg">{error}</div>
      ) : null}
      {!error && primaryTile ? (
        <>
          <section className="min-w-0 flex-[4]">
            <RecordingVideoTile
              tile={primaryTile}
              primary
              showThinkingOverlay={showThinkingOnTile(primaryTile)}
            />
          </section>
          <aside className="grid w-80 grid-cols-1 gap-3 overflow-hidden">
            {sideTiles.map((tile) => (
              <RecordingVideoTile
                key={tile.id}
                tile={tile}
                showThinkingOverlay={showThinkingOnTile(tile)}
              />
            ))}
            {isAvatarWaitingToJoin ? (
              <AvatarConnectingPlaceholder key="avatar-connecting" compact />
            ) : null}
            {sideTiles.length === 0 && !isAvatarWaitingToJoin && room ? (
              <div className="flex items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-300">
                Waiting for more participants
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
      {!error && !primaryTile && isAvatarWaitingToJoin ? (
        <section className="m-auto w-full max-w-2xl">
          <AvatarConnectingPlaceholder />
        </section>
      ) : null}
      {!error && !primaryTile && !isAvatarWaitingToJoin ? (
        <div className="m-auto rounded-xl bg-slate-900 p-6 text-lg">
          Waiting for participants...
        </div>
      ) : null}
    </main>
  );
}
