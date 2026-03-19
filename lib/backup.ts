"use client";

const DB_NAME = "financeai-backup";
const DB_VERSION = 1;
const STORE_NAME = "data";
const BACKUP_KEY = "transactions-backup";
const BACKUP_INTERVAL = 30000; // 30 seconds

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBackup(data: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(
      {
        data,
        timestamp: Date.now(),
      },
      BACKUP_KEY
    );
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB not available, silently fail
  }
}

export async function loadBackup(): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(BACKUP_KEY);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

let backupTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoBackup(): void {
  if (typeof window === "undefined") return;
  if (backupTimer) return;

  // Initial backup
  const data = localStorage.getItem("finance-app-transactions");
  if (data) saveBackup(data);

  // Periodic backup
  backupTimer = setInterval(() => {
    const current = localStorage.getItem("finance-app-transactions");
    if (current) saveBackup(current);
  }, BACKUP_INTERVAL);
}

export function stopAutoBackup(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}

export async function restoreIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const existing = localStorage.getItem("finance-app-transactions");
  // If localStorage has data, we're fine — just start backups
  if (existing && existing !== "[]") {
    startAutoBackup();
    return false;
  }

  // localStorage is empty — try to restore from IndexedDB
  const backup = await loadBackup();
  if (backup && backup !== "[]") {
    localStorage.setItem("finance-app-transactions", backup);
    startAutoBackup();
    return true; // data was restored
  }

  startAutoBackup();
  return false;
}
