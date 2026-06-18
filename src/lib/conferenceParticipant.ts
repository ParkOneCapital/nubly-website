import type { LocalParticipant, RemoteParticipant } from 'livekit-client';

export function getParticipantDisplayName(
  participant: LocalParticipant | RemoteParticipant,
): string {
  const name = participant.name?.trim();
  if (name) {
    return name;
  }
  return participant.identity || participant.sid;
}
