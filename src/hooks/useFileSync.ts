import { useState, useRef, useCallback, useEffect } from 'react';
import type { ImpactMap } from '../types';

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useFileSync() {
  const [data, setData] = useState<ImpactMap | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const lastHashRef = useRef<string>('');
  const justWroteRef = useRef(false);
  const pollIntervalRef = useRef<number | null>(null);

  const readFile = useCallback(async (handle: FileSystemFileHandle): Promise<string> => {
    const file = await handle.getFile();
    return file.text();
  }, []);

  const openFile = useCallback(async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Impact Map JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      fileHandleRef.current = handle;
      setFileName(handle.name);

      const content = await readFile(handle);
      const parsed = JSON.parse(content) as ImpactMap;
      lastHashRef.current = await hashContent(content);
      setData(parsed);
      setIsSynced(true);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to open file:', err);
      }
    }
  }, [readFile]);

  const saveFile = useCallback(async (mapData: ImpactMap, summary?: string) => {
    const handle = fileHandleRef.current;
    if (!handle) return;

    try {
      const now = new Date().toISOString();
      const dataToSave = {
        ...mapData,
        lastModified: now,
        history: [
          {
            timestamp: now,
            author: 'browser',
            summary: summary || 'Updated via browser',
          },
          ...(mapData.history || []).slice(0, 49),
        ],
      };
      const content = JSON.stringify(dataToSave, null, 2);
      justWroteRef.current = true;
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      lastHashRef.current = await hashContent(content);
      setData(dataToSave);
      setIsSynced(true);
    } catch (err) {
      console.error('Failed to save file:', err);
      setIsSynced(false);
    }
  }, []);

  const createNewFile = useCallback(async (mapData: ImpactMap) => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'impact-map.json',
        types: [
          {
            description: 'Impact Map JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      fileHandleRef.current = handle;
      setFileName(handle.name);
      await saveFile(mapData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to create file:', err);
      }
    }
  }, [saveFile]);

  // Poll for external changes
  useEffect(() => {
    if (!fileHandleRef.current) return;

    const poll = async () => {
      if (justWroteRef.current) {
        justWroteRef.current = false;
        return;
      }

      const handle = fileHandleRef.current;
      if (!handle) return;

      try {
        const content = await readFile(handle);
        const hash = await hashContent(content);

        if (hash !== lastHashRef.current) {
          lastHashRef.current = hash;
          const parsed = JSON.parse(content) as ImpactMap;
          setData(parsed);
        }
      } catch {
        // File may be temporarily unavailable
      }
    };

    pollIntervalRef.current = window.setInterval(poll, 2000);
    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, [readFile, fileName]); // re-run when fileName changes (new file opened)

  return {
    data,
    setData,
    fileName,
    isSynced,
    openFile,
    saveFile,
    createNewFile,
    hasFileHandle: !!fileHandleRef.current,
    fileHandle: fileHandleRef.current,
  };
}
