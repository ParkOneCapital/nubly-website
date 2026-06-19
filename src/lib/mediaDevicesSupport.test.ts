import { describe, expect, it } from 'vitest';
import {
  getMediaDevicesUnavailableMessage,
  isLocalDevHostname,
  isMediaDevicesAvailable,
  isScreenShareSupported,
} from './mediaDevicesSupport';

describe('mediaDevicesSupport', () => {
  it('detects localhost hostnames', () => {
    expect(isLocalDevHostname('localhost')).toBe(true);
    expect(isLocalDevHostname('192.168.1.6')).toBe(false);
  });

  it('explains HTTPS requirement for LAN HTTP on phones', () => {
    const message = getMediaDevicesUnavailableMessage('192.168.1.6', 'http:');
    expect(message).toContain('HTTPS');
    expect(message).toContain('getUserMedia');
  });

  it('reports unavailable when navigator.mediaDevices is missing', () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {},
    });

    expect(isMediaDevicesAvailable()).toBe(false);
    expect(isScreenShareSupported()).toBe(false);

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });
});
