export type ConferenceRoomMetadata = {
  room_name?: string;
  avatar_listening_paused?: boolean;
  avatar_connecting?: boolean;
  expected_avatar_identity?: string;
  recording_active?: boolean;
};

export const parseConferenceRoomMetadata = (
  metadata: string | undefined,
): ConferenceRoomMetadata => {
  if (!metadata?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === 'object'
      ? (parsed as ConferenceRoomMetadata)
      : {};
  } catch {
    return {};
  }
};

export const isAvatarConnectingFromMetadata = (
  metadata: string | undefined,
): boolean => parseConferenceRoomMetadata(metadata).avatar_connecting === true;

export const isAvatarListeningPausedFromMetadata = (
  metadata: string | undefined,
): boolean =>
  parseConferenceRoomMetadata(metadata).avatar_listening_paused === true;

export const isConferenceRecordingActiveFromMetadata = (
  metadata: string | undefined,
): boolean => parseConferenceRoomMetadata(metadata).recording_active === true;
