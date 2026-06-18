import {
  getLocalStorageWithExpiry,
  removeLocalStorageItem,
  setLocalStorageWithExpiry,
} from '@/lib/utils';

export type ConferenceRole = 'participant' | 'moderator';

export type ConferenceSessionState = {
  role: ConferenceRole;
  accessCode: string;
  roomCode: string;
  displayName: string;
};

const ACCESS_KEY = 'nubly-conference-room-access-granted';

export function saveConferenceSession(state: ConferenceSessionState): void {
  setLocalStorageWithExpiry('conference-role', state.role);
  setLocalStorageWithExpiry('conference-access-code', state.accessCode);
  setLocalStorageWithExpiry('conference-room-code', state.roomCode);
  setLocalStorageWithExpiry('conference-display-name', state.displayName);
  setLocalStorageWithExpiry(ACCESS_KEY, 'true');
}

export function getConferenceSession(): ConferenceSessionState | null {
  const role = getLocalStorageWithExpiry('conference-role');
  const accessCode = getLocalStorageWithExpiry('conference-access-code');
  const roomCode = getLocalStorageWithExpiry('conference-room-code');
  const displayName = getLocalStorageWithExpiry('conference-display-name');
  const accessGranted = getLocalStorageWithExpiry(ACCESS_KEY);

  if (
    (role !== 'participant' && role !== 'moderator') ||
    !accessCode ||
    !roomCode ||
    !displayName ||
    accessGranted !== 'true'
  ) {
    return null;
  }

  return {
    role,
    accessCode,
    roomCode,
    displayName,
  };
}

export function clearConferenceSession(): void {
  removeLocalStorageItem('conference-role');
  removeLocalStorageItem('conference-access-code');
  removeLocalStorageItem('conference-room-code');
  removeLocalStorageItem('conference-display-name');
  removeLocalStorageItem(ACCESS_KEY);
  removeLocalStorageItem('nubly-conference-room-participant-access-granted');
  removeLocalStorageItem('nubly-conference-room-interviewer-access-granted');
}
