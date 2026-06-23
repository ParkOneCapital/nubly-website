'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { getParticipantDisplayName } from '@/lib/conferenceParticipant';

type RecordingTile = {
  id: string;
  displayName: string;
  source: Track.Source;
  track: VideoTrack | null;
};

type AudioAttachment = {
  id: string;
  track: AudioTrack;
};

function getVideoTiles(
  participant: LocalParticipant | RemoteParticipant,
): RecordingTile[] {
  const tiles: RecordingTile[] = [];
  for (const publication of participant.videoTrackPublications.values() as Iterable<
    LocalTrackPublication | RemoteTrackPublication
  >) {
    const track = publication.videoTrack;
    if (!track) continue;
    const source = publication.source ?? Track.Source.Camera;
    tiles.push({
      id: `${participant.sid}-${publication.trackSid || source}`,
      displayName: getParticipantDisplayName(participant),
      source,
      track,
    });
  }
  return tiles;
}

function RecordingVideoTile({ tile, primary }: { tile: RecordingTile; primary?: boolean }) {
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
    <div className="flex h-full min-h-0 flex-col rounded-xl bg-black p-2 text-white">
      <div className="mb-2 text-sm font-semibold">
        {tile.displayName}{' '}
        <span className="text-xs text-slate-300">
          {tile.source === Track.Source.ScreenShare ? 'Screen' : 'Camera'}
        </span>
      </div>
      {tile.track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`min-h-0 flex-1 rounded-lg ${
            primary ? 'object-contain' : 'object-cover'
          }`}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg bg-slate-900">
          Waiting for track
        </div>
      )}
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

export default function RecordingViewClient() {
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [tiles, setTiles] = useState<RecordingTile[]>([]);
  const [audioAttachments, setAudioAttachments] = useState<AudioAttachment[]>([]);
  const [error, setError] = useState('');

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
      ...getVideoTiles(targetRoom.localParticipant),
      ...remoteParticipants.flatMap((participant) => getVideoTiles(participant)),
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

    const beginRecordingCapture = () => {
      if (hasStartedRecording) return;
      hasStartedRecording = true;
      if (startRecordingInterval) {
        clearInterval(startRecordingInterval);
        startRecordingInterval = undefined;
      }
      // Let React mount/play attached audio elements before Chrome captures.
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

    void recordingRoom
      .connect(connection.url, connection.token, { autoSubscribe: true })
      .then(() => {
        setRoom(recordingRoom);
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

  const screenTiles = tiles.filter((tile) => tile.source === Track.Source.ScreenShare);
  const cameraTiles = tiles.filter((tile) => tile.source !== Track.Source.ScreenShare);
  const primaryTile = screenTiles[0] || cameraTiles[0];
  const sideTiles = primaryTile
    ? tiles.filter((tile) => tile.id !== primaryTile.id)
    : tiles;

  return (
    <main className="flex h-screen w-screen gap-4 bg-slate-950 p-4 text-white">
      <RecordingAudio attachments={audioAttachments} />
      {error ? (
        <div className="m-auto rounded-xl bg-red-950 p-6 text-lg">{error}</div>
      ) : null}
      {!error && primaryTile ? (
        <>
          <section className="min-w-0 flex-[4]">
            <RecordingVideoTile tile={primaryTile} primary />
          </section>
          <aside className="grid w-80 grid-cols-1 gap-3 overflow-hidden">
            {sideTiles.map((tile) => (
              <RecordingVideoTile key={tile.id} tile={tile} />
            ))}
            {sideTiles.length === 0 && room ? (
              <div className="flex items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-300">
                Waiting for more participants
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
      {!error && !primaryTile ? (
        <div className="m-auto rounded-xl bg-slate-900 p-6 text-lg">
          Waiting for participants...
        </div>
      ) : null}
    </main>
  );
}
