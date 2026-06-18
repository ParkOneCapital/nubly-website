const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

const isPrivateLanHost = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(hostname) ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

type ResolveLiveKitContext = {
  serverUrl: string;
  pageHostname?: string;
  pageProtocol?: string;
  nodeEnv?: string;
};

/**
 * Align LiveKit signaling host with the page host during local dev.
 */
export function resolveConferenceLiveKitUrl(
  serverUrl: string,
  pageHostname?: string,
  pageProtocol?: string,
): string {
  return resolveConferenceLiveKitUrlFromContext({
    serverUrl,
    pageHostname,
    pageProtocol,
    nodeEnv: process.env.NODE_ENV,
  });
}

export function resolveConferenceLiveKitUrlFromContext(
  context: ResolveLiveKitContext,
): string {
  const normalized = context.serverUrl.trim();
  if (!normalized || !context.pageHostname) {
    return normalized;
  }

  const nodeEnv = context.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== 'development' || context.pageProtocol === 'https:') {
    return normalized;
  }

  if (!isPrivateLanHost(context.pageHostname)) {
    return normalized;
  }

  try {
    const isSecure = /^wss:/i.test(normalized);
    const wsProtocol = isSecure ? 'wss:' : 'ws:';
    const httpProtocol = isSecure ? 'https:' : 'http:';
    const parsed = new URL(
      normalized.replace(/^ws(s)?:/i, `${httpProtocol}//`),
    );

    if (!isPrivateLanHost(parsed.hostname)) {
      return normalized;
    }

    const port = parsed.port || '7880';
    if (parsed.hostname === context.pageHostname) {
      return normalized;
    }

    return `${wsProtocol}//${context.pageHostname}:${port}`;
  } catch {
    return normalized;
  }
}
