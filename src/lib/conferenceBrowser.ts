import { isSafariBrowser } from './isSafariBrowser';

/**
 * Non-Chromium browsers used to prefer TURN relay in dev, but relay-only ICE
 * requires TURN credentials from the join token. Prefer relay only when the
 * token includes ice_servers / turn_url (see buildConferenceConnectOptions).
 */
export function shouldPreferRelayIce(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  if (isSafariBrowser()) {
    return true;
  }

  const userAgent = navigator.userAgent;
  const isChromium =
    /Chrome|CriOS|Chromium/i.test(userAgent) &&
    !/Firefox|FxIOS|EdgiOS|Edg|OPR/i.test(userAgent);

  return !isChromium;
}
