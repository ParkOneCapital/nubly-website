import type { ResourcePermissions } from '@/types';

export const CONFERENCE_RESOURCE = 'conference-room';

export function isConferenceModerator(
  permissions?: ResourcePermissions,
): boolean {
  const conferencePermissions = permissions?.[CONFERENCE_RESOURCE];
  if (!conferencePermissions || typeof conferencePermissions !== 'object') {
    return false;
  }

  return (
    'moderator' in conferencePermissions &&
    conferencePermissions.moderator === true
  );
}
