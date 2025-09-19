import { LocalStorageKey } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Safe localStorage access with SSR support
function isClientSide(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function setLocalStorageWithExpiry(
  key: LocalStorageKey,
  value: string,
  ttl: number = DEFAULT_TTL,
) {
  if (!isClientSide()) {
    console.warn(`Attempted to set localStorage key "${key}" on server side`);
    return false;
  }

  try {
    const now = new Date();
    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

export function getLocalStorageWithExpiry(key: LocalStorageKey) {
  if (!isClientSide()) {
    console.warn(`Attempted to get localStorage key "${key}" on server side`);
    return null;
  }

  try {
    const itemStr = localStorage.getItem(key);

    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return null
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
    return null;
  }
}

export function removeLocalStorageItem(key: LocalStorageKey): void {
  if (!isClientSide()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
  }
}
