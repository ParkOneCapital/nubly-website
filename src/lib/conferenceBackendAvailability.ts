export const CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE =
  'Conference login is not available at this time.';

export async function isConferenceBackendAvailable(
  backendBaseUrl: string,
  options?: { timeoutMs?: number },
): Promise<boolean> {
  const trimmed = backendBaseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return false;
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 5000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${trimmed}/api/v1/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
