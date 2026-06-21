import type {
  LocalParticipant,
  LocalTrackPublication,
  RemoteParticipant,
  RemoteTrackPublication,
} from 'livekit-client';
import { Track } from 'livekit-client';

export const AVATAR_DISPLAY_NAME = 'Mary';

export function isAvatarParticipantIdentity(
  identity: string | undefined,
): boolean {
  return typeof identity === 'string' && identity.includes('avatar-agent');
}

export function isMediaAgentWorkerParticipant(
  identity: string | undefined,
): boolean {
  if (!identity || isAvatarParticipantIdentity(identity)) {
    return false;
  }

  return identity.startsWith('agent-');
}

export function shouldShowParticipantInConferenceGrid(
  participant: LocalParticipant | RemoteParticipant,
  isLocal: boolean,
): boolean {
  if (isLocal) {
    return true;
  }

  return !isMediaAgentWorkerParticipant(participant.identity);
}

export function getParticipantDisplayName(
  participant: LocalParticipant | RemoteParticipant,
): string {
  if (isAvatarParticipantIdentity(participant.identity)) {
    return AVATAR_DISPLAY_NAME;
  }

  const name = participant.name?.trim();
  if (name) {
    return name;
  }

  return participant.identity || participant.sid;
}

type VideoPublication = LocalTrackPublication | RemoteTrackPublication;

function getPublicationVideoArea(publication: VideoPublication): number {
  const dimensions = publication.dimensions;
  if (!dimensions) {
    return 0;
  }

  return dimensions.width * dimensions.height;
}

function pickAvatarVideoPublication(
  publications: VideoPublication[],
): VideoPublication | null {
  const videoPublications = publications.filter((publication) =>
    Boolean(publication.videoTrack),
  );
  if (videoPublications.length === 0) {
    return null;
  }

  if (videoPublications.length === 1) {
    return videoPublications[0];
  }

  return videoPublications.reduce((best, current) => {
    const bestArea = getPublicationVideoArea(best);
    const currentArea = getPublicationVideoArea(current);
    return currentArea > bestArea ? current : best;
  });
}

export function getConferenceVideoPublications(
  participant: LocalParticipant | RemoteParticipant,
): VideoPublication[] {
  const publications = [
    ...participant.videoTrackPublications.values(),
  ] as VideoPublication[];

  if (!isAvatarParticipantIdentity(participant.identity)) {
    return publications.filter((publication) => Boolean(publication.videoTrack));
  }

  const selectedPublication = pickAvatarVideoPublication(publications);
  return selectedPublication ? [selectedPublication] : [];
}

export function getConferenceVideoSourceLabel(
  participant: LocalParticipant | RemoteParticipant,
  source: Track.Source,
): string {
  if (isAvatarParticipantIdentity(participant.identity)) {
    return 'Avatar';
  }

  if (source === Track.Source.ScreenShare) {
    return 'Screen';
  }

  return 'Camera';
}
