import {
  getLocalStorageWithExpiry,
  removeLocalStorageItem,
  setLocalStorageWithExpiry,
} from '@/lib/utils';

export type ConferenceRole = 'participant' | 'interviewer';

export type ConferenceSessionState = {
  role: ConferenceRole;
  accessCode: string;
  roomCode: string;
  displayName: string;
};

const PARTICIPANT_ACCESS_KEY = 'nubly-conference-room-participant-access-granted';
const INTERVIEWER_ACCESS_KEY = 'nubly-conference-room-interviewer-access-granted';

export function saveConferenceSession(state: ConferenceSessionState): void {
  setLocalStorageWithExpiry('conference-role', state.role);
  setLocalStorageWithExpiry('conference-access-code', state.accessCode);
  setLocalStorageWithExpiry('conference-room-code', state.roomCode);
  setLocalStorageWithExpiry('conference-display-name', state.displayName);
  setLocalStorageWithExpiry(
    state.role === 'participant' ? PARTICIPANT_ACCESS_KEY : INTERVIEWER_ACCESS_KEY,
    'true',
  );
}

export function getConferenceSession(): ConferenceSessionState | null {
  const role = getLocalStorageWithExpiry('conference-role');
  const accessCode = getLocalStorageWithExpiry('conference-access-code');
  const roomCode = getLocalStorageWithExpiry('conference-room-code');
  const displayName = getLocalStorageWithExpiry('conference-display-name');
  const participantGranted = getLocalStorageWithExpiry(PARTICIPANT_ACCESS_KEY);
  const interviewerGranted = getLocalStorageWithExpiry(INTERVIEWER_ACCESS_KEY);

  if (
    (role !== 'participant' && role !== 'interviewer') ||
    !accessCode ||
    !roomCode ||
    !displayName
  ) {
    return null;
  }

  if (role === 'participant' && participantGranted !== 'true') {
    return null;
  }

  if (role === 'interviewer' && interviewerGranted !== 'true') {
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
  removeLocalStorageItem(PARTICIPANT_ACCESS_KEY);
  removeLocalStorageItem(INTERVIEWER_ACCESS_KEY);
}

