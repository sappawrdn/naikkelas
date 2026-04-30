// src/components/nk/types.ts — NaikKelas R4 prop interfaces
// All closed-vocabulary unions are exact — do not widen to `string`.

import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Closed vocabularies
   ────────────────────────────────────────────────────────────────────────── */

/** UploadCard status — one of seven exact strings. Localized at render. */
export type UploadStatus =
  | "Belum dianalisis"
  | "Mengunggah…"
  | "Membaca…"
  | "Selesai dibaca"
  | "Sebagian terbaca"
  | "Perlu diperiksa"
  | "Gagal";

export type StatusVariant = "idle" | "live" | "done" | "warn";

/** Maps each status to the visual variant. Single source of truth. */
export const STATUS_VARIANT: Record<UploadStatus, StatusVariant> = {
  "Belum dianalisis":  "idle",
  "Mengunggah…":       "live",
  "Membaca…":          "live",
  "Selesai dibaca":    "done",
  "Sebagian terbaca":  "warn",
  "Perlu diperiksa":   "warn",
  "Gagal":             "warn",
};

/** Stamp vocabulary — closed set of 9 (BAHASA: ID and BAHASA: EN are distinct). */
export type StampKind =
  | "TERVERIFIKASI"
  | "LOKASI DIKONFIRMASI"
  | "WAJAH USAHA"
  | "RINGKASAN DIBUAT"
  | "DATA TERBACA SEBAGIAN"
  | "PERLU DIPERIKSA"
  | "DUPLIKAT"
  | "BAHASA: ID"
  | "BAHASA: EN";

export type StampTone = "gold" | "terra" | "sepia";

/** Default tone per stamp. Override only if the brief calls for it. */
export const STAMP_TONE: Record<StampKind, StampTone> = {
  "TERVERIFIKASI":          "gold",
  "LOKASI DIKONFIRMASI":    "gold",
  "WAJAH USAHA":            "gold",
  "RINGKASAN DIBUAT":       "gold",
  "DATA TERBACA SEBAGIAN":  "sepia",
  "PERLU DIPERIKSA":        "terra",
  "DUPLIKAT":               "sepia",
  "BAHASA: ID":             "sepia",
  "BAHASA: EN":             "sepia",
};

/** Health indicator vocabulary — closed. No "Bagus", no "Stabil sekali". */
export type HealthStatus =
  | "BAIK"
  | "CUKUP"
  | "PERLU PERHATIAN"
  | "POSITIF"
  | "STABIL"
  | "MENURUN"
  | "KURANG"
  | "—";

export const HEALTH_TONE: Record<HealthStatus, "good" | "pos" | "warn" | "muted"> = {
  "BAIK":            "good",
  "CUKUP":           "good",
  "POSITIF":         "pos",
  "STABIL":          "good",
  "PERLU PERHATIAN": "warn",
  "MENURUN":         "warn",
  "KURANG":          "warn",
  "—":               "muted",
};

/** Azure provenance line — closed set. */
export type Provenance =
  | "Azure Document Intelligence"
  | "Azure AI Vision"
  | "Azure AI Language";

/* ──────────────────────────────────────────────────────────────────────────
   Component prop interfaces
   ────────────────────────────────────────────────────────────────────────── */

export interface TopBarProps {
  lang: "ID" | "EN";
  onLangChange?: (lang: "ID" | "EN") => void;
  trailing?: ReactNode;
}

export interface SectionOrnamentProps {
  num: string;
  label?: string;
}

export interface UploadCardProps {
  thumb: string;
  name: string;
  meta: string;
  status: UploadStatus;
  progress?: number;
  stamp?: StampKind;
  provenance?: Provenance;
  action?: ReactNode;
  note?: string;
}

export interface StatusChipProps {
  variant: StatusVariant;
  children: UploadStatus | string;
}

export interface StampProps {
  kind: StampKind;
  date: string;
  tone?: StampTone;
  size?: "sm" | "lg";
  inline?: boolean;
}

export interface HeroFigureProps {
  value: ReactNode;
  label: string;
  delta: string;
  deltaTone?: "pos" | "neg" | "neutral";
}

export interface HealthIndicatorRowProps {
  name: string;
  status: HealthStatus;
  explain: string;
  last?: boolean;
}

export interface MiniChartProps {
  width: number;
  height: number;
  series: { date: Date; value: number }[];
  leftLabel: string;
  rightLabel: string;
  smoothing?: "none";
}

export interface ChannelTableProps {
  channels: { name: string; value: number; pct: number }[];
}

export interface HatchProgressProps {
  done: number;
  total: number;
}

export interface ScanlineProps {
  pct: number;
}

export interface ProcessingChecklistProps {
  items: { label: string; done: boolean }[];
}

export interface A4PageProps {
  section?: string;
  sectionLabel?: string;
  pageN: number;
  pageTotal: number;
  cover?: boolean;
  children: ReactNode;
}

export interface FloatingPillProps {
  count: number;
  onClick: () => void;
  ready?: boolean;
}