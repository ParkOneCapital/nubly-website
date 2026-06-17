import { getMediaDevicesUnavailableMessage } from './mediaDevicesSupport';

const LOCALHOST_BACKEND_PATTERN = /localhost|127\.0\.0\.1/i;

type ResolveBackendContext = {
  configuredUrl: string | undefined;
  pageHostname: string | undefined;
  pageProtocol?: string | undefined;
  nodeEnv?: string | undefined;
};

/**
 * Resolves the Nubly backend base URL for conference API calls.
 *
 * In local dev, `.env` often sets `NEXT_PUBLIC_NUBLY_BACKEND_URL` to localhost.
 * That works on the Mac browser but fails on a phone (Safari reports "Load failed")
 * because localhost on the phone is the phone itself.
 *
 * When the page is opened via LAN IP, rewrite localhost to the same host on port 3000.
 * When the page is HTTPS (ngrok/staging), use the same-origin dev proxy to avoid mixed content.
 */
export function resolveConferenceBackendUrl(
  configuredUrl: string | undefined,
  pageHostname: string | undefined,
  pageProtocol?: string | undefined,
): string {
  return resolveConferenceBackendUrlFromContext({
    configuredUrl,
    pageHostname,
    pageProtocol,
    nodeEnv: process.env.NODE_ENV,
  });
}

export function resolveConferenceBackendUrlFromContext(
  context: ResolveBackendContext,
): string {
  const nodeEnv = context.nodeEnv ?? process.env.NODE_ENV;
  const configured = (context.configuredUrl ?? '').replace(/\/+$/, '');

  if (nodeEnv === 'development' && context.pageProtocol === 'https:') {
    return '/api/nubly';
  }

  if (!configured) {
    return '';
  }

  if (
    context.pageHostname &&
    context.pageHostname !== 'localhost' &&
    context.pageHostname !== '127.0.0.1' &&
    LOCALHOST_BACKEND_PATTERN.test(configured)
  ) {
    return `http://${context.pageHostname}:3000`;
  }

  return configured;
}

export function formatConferenceJoinError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unable to connect to the conference room.';
  }

  if (/mediaDevices|getUserMedia/i.test(error.message)) {
    if (typeof window !== 'undefined') {
      return getMediaDevicesUnavailableMessage(
        window.location.hostname,
        window.location.protocol,
      );
    }

    return 'Camera and microphone are unavailable in this browser.';
  }

  if (/load failed|failed to fetch|networkerror/i.test(error.message)) {
    return (
      'Could not reach the Nubly backend from this device. ' +
      'On phone testing, open the site via your Mac LAN IP (for example http://192.168.1.6:3002) ' +
      'and ensure the backend is running on port 3000.'
    );
  }

  return error.message;
}
