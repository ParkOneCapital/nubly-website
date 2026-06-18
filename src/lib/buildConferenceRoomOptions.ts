import type { RoomOptions } from 'livekit-client';
import { isSafariBrowser } from './isSafariBrowser';

export function buildConferenceRoomOptions(): RoomOptions | undefined {
  if (!isSafariBrowser()) {
    return undefined;
  }

  return {
    publishDefaults: {
      videoCodec: 'h264',
      backupCodec: false,
    },
  };
}
