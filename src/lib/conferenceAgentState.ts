import {
  ParticipantKind,
  type RemoteParticipant,
  type Room,
} from 'livekit-client';

export type ConferenceAgentState =
  | 'connecting'
  | 'pre-connect-buffering'
  | 'initializing'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'disconnected'
  | 'failed'
  | string;

export const LIVEKIT_AGENT_STATE_ATTRIBUTE = 'lk.agent.state';
export const LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE = 'lk.publish_on_behalf';

export function findConferenceMediaAgentParticipant(
  room: Room,
): RemoteParticipant | undefined {
  return Array.from(room.remoteParticipants.values()).find(
    (participant) =>
      participant.kind === ParticipantKind.AGENT &&
      !participant.attributes[LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE],
  );
}

export function readConferenceAgentState(
  room: Room | null | undefined,
): ConferenceAgentState | undefined {
  if (!room) {
    return undefined;
  }

  const state = findConferenceMediaAgentParticipant(room)?.attributes[
    LIVEKIT_AGENT_STATE_ATTRIBUTE
  ];
  return typeof state === 'string' && state.trim() ? state.trim() : undefined;
}

export function shouldShowAvatarThinkingIndicator(
  agentState: ConferenceAgentState | undefined,
): boolean {
  return agentState === 'thinking';
}
