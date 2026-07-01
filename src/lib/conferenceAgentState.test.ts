import { ParticipantKind } from 'livekit-client';
import { describe, expect, it } from 'vitest';
import {
  LIVEKIT_AGENT_STATE_ATTRIBUTE,
  LIVEKIT_PUBLISH_ON_BEHALF_ATTRIBUTE,
  formatConferenceAgentStateLabel,
  isConferenceMediaAgentParticipant,
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
        sid: `sid-${index}`,
        attributes: participant.attributes ?? {},
        on: () => {},
        off: () => {},
      },
    ]),
  );

  return {
    remoteParticipants,
    on: () => {},
    off: () => {},
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

  it('finds media agent by identity when participant kind is not agent yet', () => {
    const room = buildRoom([
      {
        kind: ParticipantKind.STANDARD,
        identity: 'agent-AJ_123',
        attributes: {
          [LIVEKIT_AGENT_STATE_ATTRIBUTE]: 'thinking',
        },
      },
    ]);

    expect(readConferenceAgentState(room)).toBe('thinking');
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
    expect(
      isConferenceMediaAgentParticipant(
        room!.remoteParticipants.get('sid-0') as never,
      ),
    ).toBe(false);
  });

  it('maps LiveKit agent states to conference UI labels', () => {
    expect(formatConferenceAgentStateLabel('thinking')).toBe('Thinking');
    expect(formatConferenceAgentStateLabel('listening')).toBe('Ready');
    expect(formatConferenceAgentStateLabel('idle')).toBe('Ready');
    expect(formatConferenceAgentStateLabel('speaking')).toBe('Speaking');
    expect(formatConferenceAgentStateLabel('initializing')).toBe('Connecting');
    expect(formatConferenceAgentStateLabel(undefined)).toBeUndefined();
  });
});
