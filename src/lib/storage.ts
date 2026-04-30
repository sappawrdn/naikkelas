// src/lib/storage.ts — sessionStorage helpers for berkas state.
// Persists across page navigation within same tab; cleared on tab close.

import type { UploadStatus } from "@/components/nk/types";

export type Artifact = {
  id: string;
  name: string;
  meta: string;
  thumb: string;
  status: UploadStatus;
  progress?: number;
  stampKind?: string; // matches StampKind from types.ts
};

// Build storage key from berkas id
function key(berkasId: string): string {
  return `berkas:${berkasId}:artifacts`;
}

/** Save artifacts to sessionStorage. Safe on server (no-op if window undefined). */
export function saveArtifacts(berkasId: string, artifacts: Artifact[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key(berkasId), JSON.stringify(artifacts));
  } catch (e) {
    console.warn("Failed to save artifacts", e);
  }
}

/** Read artifacts from sessionStorage. Returns empty array if none. */
export function loadArtifacts(berkasId: string): Artifact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(key(berkasId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load artifacts", e);
    return [];
  }
}

/** Clear artifacts for a berkas. Used when starting fresh. */
export function clearArtifacts(berkasId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key(berkasId));
}