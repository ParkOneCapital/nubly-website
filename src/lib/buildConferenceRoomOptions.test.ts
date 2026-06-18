import { describe, expect, it, vi } from 'vitest';
import { buildConferenceRoomOptions } from './buildConferenceRoomOptions';

vi.mock('./isSafariBrowser', () => ({
  isSafariBrowser: vi.fn(),
}));

import { isSafariBrowser } from './isSafariBrowser';

describe('buildConferenceRoomOptions', () => {
  it('returns undefined for non-Safari browsers', () => {
    vi.mocked(isSafariBrowser).mockReturnValue(false);
    expect(buildConferenceRoomOptions()).toBeUndefined();
  });

  it('uses H.264 publish defaults on Safari', () => {
    vi.mocked(isSafariBrowser).mockReturnValue(true);
    expect(buildConferenceRoomOptions()).toEqual({
      publishDefaults: {
        videoCodec: 'h264',
        backupCodec: false,
      },
    });
  });
});
