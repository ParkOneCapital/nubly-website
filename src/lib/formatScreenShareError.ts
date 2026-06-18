export function formatScreenShareError(error: unknown, enabled: boolean): string {
  if (error instanceof Error) {
    if (/insufficient permissions/i.test(error.message)) {
      if (!enabled) {
        return (
          'Screen share is disabled for this conference. Set NEXT_PUBLIC_DEMO_RECORDING_ENABLED=true ' +
          'and DEMO_SCREENSHARE_ENABLED=true on the backend, then rejoin the room.'
        );
      }

      return (
        'Screen share is not allowed for your current room token. Leave and rejoin the conference ' +
        'room so a fresh token is issued with screen-share permissions.'
      );
    }

    if (/notallowed|permission denied|denied/i.test(error.message)) {
      return (
        'The browser blocked screen capture. On macOS, allow screen recording for this browser ' +
        'in System Settings → Privacy & Security → Screen & System Audio Recording, then retry.'
      );
    }

    return error.message;
  }

  return enabled ? 'Unable to start screen share.' : 'Unable to stop screen share.';
}
