export function isMediaDevicesAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

export function isScreenShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getDisplayMedia === 'function'
  );
}

export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function getScreenShareUnavailableMessage(): string {
  if (isIOSDevice()) {
    return (
      'Screen sharing is not available on iPhone or iPad in the browser. ' +
      'Use a desktop computer (Chrome, Safari, or Firefox) to share your screen.'
    );
  }

  return (
    'Screen sharing is not supported in this browser. ' +
    'Use Chrome, Firefox, or Safari on a desktop computer.'
  );
}

export function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * iOS Safari only exposes camera/microphone in secure contexts (HTTPS or localhost).
 * Plain http://192.168.x.x on a phone will throw when LiveKit calls getUserMedia.
 */
export function getMediaDevicesUnavailableMessage(
  hostname: string,
  protocol: string,
): string {
  if (protocol === 'https:') {
    return (
      'Camera and microphone are unavailable in this browser. ' +
      'Check Safari site permissions (Settings → Safari → Camera/Microphone).'
    );
  }

  if (!isLocalDevHostname(hostname)) {
    return (
      'iPhone Safari requires HTTPS to use the camera and microphone. ' +
      'Plain http:// on your LAN IP cannot access getUserMedia. ' +
      'Use an HTTPS tunnel (for example ngrok http 3002) or test on a deployed staging URL. ' +
      'For local dev without a phone, use Chrome or Firefox on your Mac.'
    );
  }

  return (
    'Camera and microphone are not available. Use a supported browser and allow permissions.'
  );
}
