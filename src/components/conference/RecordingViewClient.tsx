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

type RecordingTile = {
  id: string;
  identity: string;
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
      identity: participant.identity || participant.sid,
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
        {tile.identity}{' '}
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
    <div className="hidden">
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

  return <audio ref={audioRef} autoPlay />;
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
        .filter((publication) => Boolean(publication.audioTrack))
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
    const markReady = () => {
      refreshTiles(recordingRoom);
      if (!hasStartedRecording) {
        hasStartedRecording = true;
        console.log('START_RECORDING');
      }
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
      })
      .catch((value: unknown) => {
        setError(value instanceof Error ? value.message : 'Unable to connect recorder.');
      });

    return () => {
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
