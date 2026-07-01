import {
  ParticipantEvent,
  ParticipantKind,
  RoomEvent,
  type RemoteParticipant,
  type Room,
} from 'livekit-client';
import { isAvatarParticipantIdentity } from './conferenceParticipant';

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

export function isConferenceMediaAgentParticipant(
  participant: RemoteParticipant,
): boolean {
  if (LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE in participant.attributes) {
    return false;
  }

  if (participant.kind === ParticipantKind.AGENT) {
    return true;
  }

  const identity = participant.identity;
  return Boolean(
    identity?.startsWith('agent-') && !isAvatarParticipantIdentity(identity),
  );
}

export function findConferenceMediaAgentParticipant(
  room: Room,
): RemoteParticipant | undefined {
  return Array.from(room.remoteParticipants.values()).find(
    isConferenceMediaAgentParticipant,
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

export function formatConferenceAgentStateLabel(
  agentState: ConferenceAgentState | undefined,
): string | undefined {
  if (!agentState) {
    return undefined;
  }

  switch (agentState) {
    case 'thinking':
      return 'Thinking';
    case 'idle':
    case 'listening':
      return 'Ready';
    case 'speaking':
      return 'Speaking';
    case 'connecting':
    case 'pre-connect-buffering':
    case 'initializing':
      return 'Connecting';
    case 'disconnected':
      return 'Disconnected';
    case 'failed':
      return 'Failed';
    default:
      return agentState.charAt(0).toUpperCase() + agentState.slice(1);
  }
}

export function readConferenceAgentThinking(
  room: Room | null | undefined,
): boolean {
  return shouldShowAvatarThinkingIndicator(readConferenceAgentState(room));
}

export function subscribeConferenceAgentState(
  room: Room,
  onStateChange: (state: ConferenceAgentState | undefined) => void,
): () => void {
  const participantCleanups = new Map<string, () => void>();

  const sync = () => {
    onStateChange(readConferenceAgentState(room));
  };

  const attachParticipantListener = (participant: RemoteParticipant) => {
    if (!isConferenceMediaAgentParticipant(participant)) {
      return;
    }

    const sid = participant.sid;
    if (!sid || participantCleanups.has(sid)) {
      return;
    }

    const onAttributesChanged = () => sync();
    participant.on(ParticipantEvent.AttributesChanged, onAttributesChanged);
    participantCleanups.set(sid, () => {
      participant.off(ParticipantEvent.AttributesChanged, onAttributesChanged);
    });
  };

  const onParticipantConnected = (participant: RemoteParticipant) => {
    attachParticipantListener(participant);
    sync();
  };

  const onParticipantDisconnected = (participant: RemoteParticipant) => {
    const cleanup = participant.sid
      ? participantCleanups.get(participant.sid)
      : undefined;
    cleanup?.();
    if (participant.sid) {
      participantCleanups.delete(participant.sid);
    }
    sync();
  };

  sync();
  room.on(RoomEvent.ParticipantAttributesChanged, sync);
  room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
  room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

  for (const participant of room.remoteParticipants.values()) {
    attachParticipantListener(participant);
  }

  return () => {
    room.off(RoomEvent.ParticipantAttributesChanged, sync);
    room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    for (const cleanup of participantCleanups.values()) {
      cleanup();
    }
    participantCleanups.clear();
  };
}

export function subscribeConferenceAgentThinking(
  room: Room,
  onThinkingChange: (isThinking: boolean) => void,
): () => void {
  return subscribeConferenceAgentState(room, (state) => {
    onThinkingChange(shouldShowAvatarThinkingIndicator(state));
  });
}
