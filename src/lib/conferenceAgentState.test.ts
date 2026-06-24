import { ParticipantKind } from 'livekit-client';
import { describe, expect, it } from 'vitest';
import {
  LIVEKIT_AGENT_STATE_ATTRIBUTE,
  LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE,
  readConferenceAgentState,
  shouldShowAvatarThinkingIndicator,
} from './conferenceAgentState';

function buildRoom(participants: Array<Record<string, unknown>>) {
  const remoteParticipants = new Map(
    participants.map((participant, index) => [
      `sid-${index}`,
      {
        kind: participant.kind,
        identity: participant.identity,
        attributes: participant.attributes ?? {},
      },
    ]),
  );

  return {
    remoteParticipants,
  } as Parameters<typeof readConferenceAgentState>[0];
}

describe('conferenceAgentState', () => {
  it('reads thinking state from the media agent participant', () => {
    const room = buildRoom([
      {
        kind: ParticipantKind.AGENT,
        identity: 'agent-AJ_123',
        attributes: {
          [LIVEKIT_AGENT_STATE_ATTRIBUTE]: 'thinking',
        },
      },
    ]);

    expect(readConferenceAgentState(room)).toBe('thinking');
    expect(shouldShowAvatarThinkingIndicator('thinking')).toBe(true);
    expect(shouldShowAvatarThinkingIndicator('speaking')).toBe(false);
  });

  it('ignores avatar worker participants that publish on behalf of the agent', () => {
    const room = buildRoom([
      {
        kind: ParticipantKind.AGENT,
        identity: 'anam-avatar-agent',
        attributes: {
          [LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE]: 'agent-AJ_123',
          [LIVEKIT_AGENT_STATE_ATTRIBUTE]: 'thinking',
        },
      },
    ]);

    expect(readConferenceAgentState(room)).toBeUndefined();
  });
});
