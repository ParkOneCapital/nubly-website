import { describe, expect, it } from 'vitest';
import { formatScreenShareError } from './formatScreenShareError';

describe('formatScreenShareError', () => {
  it('explains LiveKit token permission failures', () => {
    const message = formatScreenShareError(
      new Error('failed to publish track, insufficient permissions'),
      true,
    );

    expect(message).toContain('room token');
    expect(message).toContain('rejoin');
  });

  it('explains macOS browser capture denials', () => {
    const message = formatScreenShareError(new Error('Permission denied'), true);

    expect(message).toContain('System Settings');
  });

  it('explains when getDisplayMedia is unavailable', () => {
    const message = formatScreenShareError(
      new Error('getDisplayMedia not supported'),
      true,
    );

    expect(message).toContain('not supported');
  });
});
