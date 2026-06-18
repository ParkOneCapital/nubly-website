import { describe, expect, it } from 'vitest';
import {
  CONFERENCE_RESOURCE,
  isConferenceModerator,
} from './conferencePermissions';

describe('isConferenceModerator', () => {
  it('returns true when conference-room permissions include moderator: true', () => {
    expect(
      isConferenceModerator({
        [CONFERENCE_RESOURCE]: { access: true, moderator: true },
      }),
    ).toBe(true);
  });

  it('returns false when conference-room access exists without moderator', () => {
    expect(
      isConferenceModerator({
        [CONFERENCE_RESOURCE]: { access: true },
      }),
    ).toBe(false);
  });
});
