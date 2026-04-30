// src/components/nk/index.tsx — NaikKelas reference components (R4)
"use client";

import * as React from "react";
import {
  type UploadCardProps, type StatusChipProps, type StampProps,
  type HeroFigureProps, type HealthIndicatorRowProps, type MiniChartProps,
  type ChannelTableProps, type HatchProgressProps, type ScanlineProps,
  type ProcessingChecklistProps, type A4PageProps, type TopBarProps,
  type SectionOrnamentProps, type FloatingPillProps,
  STATUS_VARIANT, STAMP_TONE, HEALTH_TONE,
} from "./types";

/* ── TopBar ──────────────────────────────────────────────────────────────── */
export function TopBar({ lang, onLangChange, trailing }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3.5 border-b border-rule bg-paper">
      <span className="font-serif text-[17px] tracking-[0.02em] inline-flex items-center gap-2">
        <span className="text-teal">§</span> NaikKelas
      </span>
      <div className="flex items-center gap-3">
        <div className="inline-flex border border-rule-2 rounded-btn overflow-hidden text-label-up-tight">
          {(["ID","EN"] as const).map((L, i) => (
            <React.Fragment key={L}>
              {i > 0 && <span className="w-px self-stretch bg-rule-2" />}
              <button
                onClick={() => onLangChange?.(L)}
                className={`px-2 py-1 ${lang === L ? "bg-charcoal text-paper" : "text-sepia"}`}
              >{L}</button>
            </React.Fragment>
          ))}
        </div>
        {trailing}
      </div>
    </header>
  );
}

/* ── SectionOrnament: ───── § 01 ─────────────────────────────────────────── */
export function SectionOrnament({ num, label }: SectionOrnamentProps) {
  return (
    <div className="nk-sec-bar">
      <span className="line" />
      <span className="num">§ {num}{label ? ` · ${label}` : ""}</span>
      <span className="line" />
    </div>
  );
}

/* ── StatusChip ──────────────────────────────────────────────────────────── */
const CHIP_TONE: Record<string, string> = {
  idle: "text-sepia",
  live: "text-charcoal",
  done: "text-charcoal",
  warn: "text-catatan",
};
const DOT_TONE: Record<string, string> = {
  idle: "bg-sepia-2",
  live: "bg-teal-soft",
  done: "bg-teal",
  warn: "bg-catatan",
};
export function StatusChip({ variant, children }: StatusChipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-meta ${CHIP_TONE[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_TONE[variant]}`} />
      {children}
    </span>
  );
}

/* ── Stamp ───────────────────────────────────────────────────────────────── */
const STAMP_COLOR: Record<string, string> = {
  gold:  "text-stempel-deep",
  terra: "text-catatan",
  sepia: "text-sepia",
};
export function Stamp({ kind, date, tone, size = "sm", inline = false }: StampProps) {
  const t = tone ?? STAMP_TONE[kind];
  const isLg = size === "lg";
  const cls = [
    "nk-stamp border-[1.5px] border-current",
    "font-sans uppercase",
    isLg ? "text-stamp-lg px-3.5 py-2" : "text-stamp px-2.5 py-1.5",
    STAMP_COLOR[t],
    inline ? "" : "absolute top-1.5 right-[-6px]",
    "leading-none",
  ].join(" ");
  return (
    <div className={cls} style={{ transform: "rotate(-4deg)", opacity: t === "sepia" ? 0.8 : 0.92 }}>
      {kind}
      <span className="block font-mono text-[8px] tracking-[0.04em] mt-1 normal-case opacity-70">
        — § {date}
      </span>
    </div>
  );
}

/* ── UploadCard ──────────────────────────────────────────────────────────── */
export function UploadCard({
  thumb, name, meta, status, progress,
  stamp, provenance, action, note,
}: UploadCardProps) {
  const variant = STATUS_VARIANT[status];
  const showStamp = !!stamp;
  const statusText = (status === "Mengunggah…" || status === "Membaca…") && progress != null
    ? `${status} ${progress}%` : status;

  return (
    <div className={`relative bg-paper border border-rule p-card flex gap-3 ${showStamp ? "pr-[92px]" : "pr-3.5"}`}>
      {/* Thumbnail placeholder — caller passes a label, never a stock image */}
      <div className="shrink-0 w-16 h-16 bg-paper-3 border border-rule relative overflow-hidden">
        <div className="absolute bottom-1.5 left-1.5 right-1.5 font-mono text-[9px] text-sepia tracking-[0.04em]">
          {thumb}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-sans text-[14px] truncate">{name}</div>
        <div className="font-sans text-meta text-sepia mt-0.5 truncate">{meta}</div>
        <div className="mt-2"><StatusChip variant={variant}>{statusText}</StatusChip></div>
        {provenance && (
          <div className="mt-1.5 font-mono text-[11px] text-sepia tracking-[0.02em]">{provenance}</div>
        )}
        {note && (
          <div className="mt-2 font-serif italic text-[14px] text-sepia leading-snug">{note}</div>
        )}
      </div>

      {action && <div className="absolute top-2.5 right-2.5">{action}</div>}
      {stamp && <Stamp kind={stamp} date="24 Apr 2026" />}
    </div>
  );
}

/* ── HeroFigure ──────────────────────────────────────────────────────────── */
const DELTA_TONE: Record<string, string> = {
  pos: "text-teal", neg: "text-catatan", neutral: "text-charcoal-2",
};
export function HeroFigure({ value, label, delta, deltaTone = "neutral" }: HeroFigureProps) {
  return (
    <div className="bg-paper border border-rule p-5">
      <div className="font-serif text-num-hero tabular-nums">{value}</div>
      <div className="font-sans text-meta text-sepia mt-2">{label}</div>
      <hr className="nk-rule my-3" />
      <div className={`font-sans text-[13px] ${DELTA_TONE[deltaTone]}`}>{delta}</div>
    </div>
  );
}

/* ── HealthIndicatorRow ──────────────────────────────────────────────────── */
const HEALTH_COLOR = {
  good:  "text-teal",
  pos:   "text-teal",
  warn:  "text-catatan",
  muted: "text-sepia",
} as const;
export function HealthIndicatorRow({ name, status, explain, last }: HealthIndicatorRowProps) {
  const tone = HEALTH_TONE[status];
  return (
    <div className={`py-3.5 ${last ? "" : "border-b border-rule"}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-[15px]">{name}</span>
        <span className={`font-mono text-[12px] tracking-[0.08em] ${HEALTH_COLOR[tone]}`}>{status}</span>
      </div>
      <div className="font-serif italic text-[14px] text-sepia mt-1.5 leading-snug">{explain}</div>
    </div>
  );
}

/* ── MiniChart — straight polyline, sepia fill, hairline base ────────────── */
export function MiniChart({ width, height, series, leftLabel, rightLabel }: MiniChartProps) {
  if (!series.length) return null;
  const max = Math.max(...series.map(s => s.value)) || 1;
  const stepX = width / (series.length - 1);
  const pts = series.map((s, i) => [i * stepX, height - (s.value / max) * (height - 8) - 4]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const fill = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <div className="font-mono text-[11px] text-sepia">
      <svg width={width} height={height} className="block">
        <path d={fill} fill="#7A6F61" fillOpacity="0.08" />
        <path d={line} stroke="#1E5048" strokeWidth="1.25" fill="none" />
        <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} stroke="#E4D9C2" />
      </svg>
      <div className="flex justify-between mt-1.5"><span>{leftLabel}</span><span>{rightLabel}</span></div>
    </div>
  );
}

/* ── ChannelTable ────────────────────────────────────────────────────────── */
export function ChannelTable({ channels }: ChannelTableProps) {
  return (
    <div className="border-y border-rule">
      {channels.map((c, i) => (
        <div key={c.name} className={`flex items-baseline justify-between py-3 ${i < channels.length - 1 ? "border-b border-rule" : ""}`}>
          <span className="font-sans text-[15px]">{c.name}</span>
          <span className="font-mono tabular-nums text-[14px] tracking-[0.02em] flex gap-6">
            <span>{c.value.toLocaleString("id-ID")}</span>
            <span className="w-10 text-right text-sepia">{c.pct}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── HatchProgress ───────────────────────────────────────────────────────── */
export function HatchProgress({ done, total }: HatchProgressProps) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div>
      <div className="h-1.5 bg-rule relative overflow-hidden">
        <div className="absolute inset-y-0 left-0" style={{
          width: `${pct}%`,
          backgroundImage: "repeating-linear-gradient(45deg, #7A6F61 0 2px, transparent 2px 5px)",
        }}/>
      </div>
      <div className="font-mono text-[12px] text-sepia mt-2 tabular-nums">
        {done} dari {total} bukti
      </div>
    </div>
  );
}

/* ── Scanline (active-read indicator) ────────────────────────────────────── */
export function Scanline({ pct }: ScanlineProps) {
  const filled = Math.round(pct / 10);
  return (
    <span className="font-mono text-[12px] tracking-[0.18em] text-charcoal-2">
      {"▪".repeat(filled)}{"▫".repeat(10 - filled)}
      <span className="ml-2 text-sepia tabular-nums">{pct}%</span>
    </span>
  );
}

/* ── ProcessingChecklist ─────────────────────────────────────────────────── */
export function ProcessingChecklist({ items }: ProcessingChecklistProps) {
  return (
    <ul className="space-y-2.5">
      {items.map(it => (
        <li key={it.label} className={`flex gap-3 text-[15px] ${it.done ? "text-charcoal" : "italic text-sepia font-serif"}`}>
          <span className={`mt-2.5 h-px w-3 shrink-0 ${it.done ? "bg-teal" : "bg-rule-2"}`} />
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── A4Page ──────────────────────────────────────────────────────────────── */
export function A4Page({ section, sectionLabel, pageN, pageTotal, cover, children }: A4PageProps) {
  return (
    <article className="a4">
      <div className="spine">
        {!cover && section && <span className="secnum">§ {section}{sectionLabel ? `  ${sectionLabel}` : ""}</span>}
        {cover && <span className="seclabel">§ COVER</span>}
        <span className="pagemark">NAIKKELAS · {pageN} / {pageTotal}</span>
      </div>
      <div className="body-col">{children}</div>
    </article>
  );
}

/* ── FloatingPill ────────────────────────────────────────────────────────── */
export function FloatingPill({ count, onClick, ready }: FloatingPillProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 inline-flex items-center gap-2 bg-paper border border-rule-2 rounded-pill px-4 py-2 text-[13px] shadow-none"
    >
      {ready && <span className="w-2 h-2 rounded-full bg-stempel" />}
      <span>↓ {count} bukti siap</span>
    </button>
  );
}