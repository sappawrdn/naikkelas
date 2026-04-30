// src/lib/format.ts — Indonesian/English locale formatters for NaikKelas

const NBSP = "\u00A0";

/** "Rp 8.420.000" — id-ID, no trailing ,00 for whole rupiah, NBSP after Rp. */
export function rp(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs  = Math.abs(n);
  const whole = Math.floor(abs);
  const cents = Math.round((abs - whole) * 100);
  const wholeStr = whole.toLocaleString("id-ID");
  const cs = cents > 0 ? "," + String(cents).padStart(2, "0") : "";
  return `${sign}Rp${NBSP}${wholeStr}${cs}`;
}

/** "Rp 8,420,000" — English locale, comma thousands. Exec-summary page only. */
export function rpEN(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `Rp${NBSP}${Math.floor(n).toLocaleString("en-US")}`;
}

/** "24 Apr" — short id-ID date for chart axis, status lines, processing log. */
export function nDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** "24 April 2026" — long id-ID date for cover, dashboard meta, exec summary. */
export function fullDate(d: Date): string {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** "April 24, 2026" — English long date for exec summary disclaimer line. */
export function fullDateEN(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Percentage with explicit direction word for accessibility:
 *  +12 → "Naik 12%", -4 → "Turun 4%", 0 → "Tidak berubah". */
export function deltaID(pct: number): string {
  if (pct === 0) return "Tidak berubah";
  return pct > 0 ? `Naik ${pct}%` : `Turun ${Math.abs(pct)}%`;
}

export function deltaEN(pct: number): string {
  if (pct === 0) return "Unchanged";
  return pct > 0 ? `+${pct}% MoM` : `${pct}% MoM`;
}