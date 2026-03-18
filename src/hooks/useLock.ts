import { useState, useRef, useCallback, useEffect } from 'react';

interface LockInfo {
  holder: string;
  timestamp: number;
}

const LOCK_STALE_MS = 5 * 60 * 1000; // 5 minutes
const LOCK_HOLDER = 'impact-map-browser';

export function useLock() {
  const [lockHolder, setLockHolder] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const lockHandleRef = useRef<FileSystemFileHandle | null>(null);
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  const setDirectoryHandle = useCallback((dirHandle: FileSystemDirectoryHandle) => {
    dirHandleRef.current = dirHandle;
  }, []);

  const readLock = useCallback(async (): Promise<LockInfo | null> => {
    const dir = dirHandleRef.current;
    if (!dir) return null;

    try {
      const handle = await dir.getFileHandle('.impact-map.lock');
      const file = await handle.getFile();
      const content = await file.text();
      return JSON.parse(content) as LockInfo;
    } catch {
      return null;
    }
  }, []);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    const dir = dirHandleRef.current;
    if (!dir) return false;

    const existing = await readLock();
    if (existing && existing.holder !== LOCK_HOLDER) {
      const age = Date.now() - existing.timestamp;
      if (age < LOCK_STALE_MS) {
        setLockHolder(existing.holder);
        setIsLocked(true);
        return false;
      }
    }

    try {
      const handle = await dir.getFileHandle('.impact-map.lock', { create: true });
      lockHandleRef.current = handle;
      const lockInfo: LockInfo = { holder: LOCK_HOLDER, timestamp: Date.now() };
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(lockInfo));
      await writable.close();
      setLockHolder(LOCK_HOLDER);
      setIsLocked(true);
      return true;
    } catch {
      return false;
    }
  }, [readLock]);

  const releaseLock = useCallback(async () => {
    const dir = dirHandleRef.current;
    if (!dir) return;

    try {
      await dir.removeEntry('.impact-map.lock');
    } catch {
      // Lock file may not exist
    }
    lockHandleRef.current = null;
    setLockHolder(null);
    setIsLocked(false);
  }, []);

  // Check lock status periodically
  useEffect(() => {
    if (!dirHandleRef.current) return;

    const check = async () => {
      const info = await readLock();
      if (info) {
        const age = Date.now() - info.timestamp;
        if (age >= LOCK_STALE_MS) {
          setLockHolder(null);
          setIsLocked(false);
        } else {
          setLockHolder(info.holder);
          setIsLocked(true);
        }
      } else {
        setLockHolder(null);
        setIsLocked(false);
      }
    };

    const interval = window.setInterval(check, 5000);
    return () => window.clearInterval(interval);
  }, [readLock]);

  return {
    lockHolder,
    isLocked,
    acquireLock,
    releaseLock,
    setDirectoryHandle,
  };
}
