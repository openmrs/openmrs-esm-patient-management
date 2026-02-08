import { useCallback } from 'react';

// Tracks in-progress actions to prevent handling the same action multiple times
const actionLockMap = new Map<string, boolean>();

export function useActionLock() {
  const isLocked = useCallback((key: string) => {
    return actionLockMap.get(key) === true;
  }, []);

  const runWithLock = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (actionLockMap.get(key)) {
      return;
    }

    actionLockMap.set(key, true);
    try {
      await fn();
    } finally {
      actionLockMap.delete(key);
    }
  }, []);

  return {
    isLocked,
    runWithLock,
  };
}
