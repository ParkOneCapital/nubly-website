import { isSafariBrowser } from './isSafariBrowser';

/**
 * Chromium tolerates local host ICE in dev more than Firefox/Safari.
 * Prefer TURN relay so LiveKit embedded TURN credentials from join are used.
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
