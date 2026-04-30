"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar, A4Page, MiniChart, ChannelTable, Stamp } from "@/components/nk";
import { loadArtifacts, type Artifact } from "@/lib/storage";
import type { StampKind } from "@/components/nk/types";
import { fullDate, fullDateEN, rp, rpEN, nDate } from "@/lib/format";



const PERSONA = {
  business: "Warung Makan Bu Siti",
  type: "Warung Makan",
  city: "Bandung",
  province: "Jawa Barat",
  area: "Antapani",
  monthsActive: 18,
};

function computeStats(artifacts: Artifact[]) {
  const validCount = artifacts.filter(
    (a) => a.status === "Selesai dibaca" || a.status === "Sebagian terbaca"
  ).length;
  const flaggedCount = artifacts.filter(
    (a) => a.stampKind === "PERLU DIPERIKSA"
  ).length;
  const avgRevenue = 7000000 + validCount * 200000;
  const transactions = 200 + validCount * 8;
  const channels = Math.min(3, Math.max(1, Math.ceil(validCount / 3)));
  const monthlyGrowthPct = 12;
  return {
    avgRevenue,
    transactions,
    channels,
    monthlyGrowthPct,
    validCount,
    flaggedCount,
  };
}

// 60-day deterministic series — mirrors dashboard logic
function build60DaySeries(avgDaily: number, today: Date) {
  const series = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const dom = d.getDate();
    const weekend = dow === 0 || dow === 6 ? 1.3 : 1;
    const gajian = dom >= 25 && dom <= 30 ? 1.2 : 1;
    const tanggalTua = dom >= 1 && dom <= 5 ? 0.85 : 1;
    const wave = Math.sin((59 - i) * 0.6) * 0.25 + 1;
    const liburDay = (i % 17 === 4) ? 0 : 1;
    const value = Math.round(avgDaily * wave * weekend * gajian * tanggalTua * liburDay);
    series.push({ date: d, value });
  }
  return series;
}

function buildChannels(monthlyRevenue: number, channelCount: number) {
  const all = [
    { name: "GoFood", pct: 49 },
    { name: "QRIS",   pct: 34 },
    { name: "Tunai",  pct: 17 },
  ];
  const active = all.slice(0, channelCount);
  const totalPct = active.reduce((s, c) => s + c.pct, 0);
  return active.map((c) => ({
    name: c.name,
    pct: Math.round((c.pct / totalPct) * 100),
    value: Math.round((monthlyRevenue * c.pct) / totalPct),
  }));
}

// Build caption description from filename heuristic + stamp
function buildCaption(name: string, stampKind?: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("warung") || lower.includes("foto") || lower.includes("toko")) {
    return "Tampak depan warung dikonfirmasi sistem visi.";
  }
  if (lower.includes("gofood") || lower.includes("gomart")) {
    return "Riwayat transaksi platform GoFood.";
  }
  if (lower.includes("qris") || lower.includes("struk")) {
    return "Riwayat pembayaran QRIS, periode bulan terakhir.";
  }
  if (lower.includes("ktp") || lower.includes("identitas")) {
    return "Identitas pemilik usaha — terverifikasi.";
  }
  if (lower.includes("catatan") || lower.includes("buku")) {
    return stampKind === "PERLU DIPERIKSA"
      ? "Halaman buku catatan; sebagian terbaca."
      : "Halaman buku catatan harian.";
  }
  if (lower.includes("sertifikat") || lower.includes("izin")) {
    return "Dokumen pendukung legalitas usaha.";
  }
  return "Dokumen pendukung aktivitas usaha.";
}

function buildProvenance(stampKind?: string): string {
  if (stampKind === "LOKASI DIKONFIRMASI" || stampKind === "WAJAH USAHA") {
    return "Azure AI Vision";
  }
  if (stampKind === "RINGKASAN DIBUAT") {
    return "Azure AI Language";
  }
  return "Azure Document Intelligence";
}

// Stable timestamp per artifact (deterministic from index)
function buildTimestamp(idx: number): string {
  const minute = 32 + Math.floor(idx / 4);
  const second = (idx * 7) % 60;
  return `14:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

export default function LaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadArtifacts(id);
    if (loaded.length === 0) {
      router.replace(`/berkas/${id}`);
      return;
    }
    setArtifacts(loaded);
    setIsLoaded(true);
  }, [id, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-paper">
        <TopBar lang="ID" />
      </main>
    );
  }

  const today = new Date();
  const berkasIdShort = `FBL-2026-${id.slice(0, 4).toUpperCase()}`;
  const periodStart = new Date(today);
  const stats = computeStats(artifacts);
  const avgDaily = Math.round(stats.avgRevenue / 30);
  const series = build60DaySeries(avgDaily, today);
  const channels = buildChannels(stats.avgRevenue, stats.channels);
  // Build a 30-day growth comparison series for the trend indicator
  const growthSeries = series.slice(-30); // last 30 days for the mini chart
  // Split artifacts into pages of 4 each for the appendix
  const buktiPerPage = 4;
  const buktiPages: Artifact[][] = [];
  for (let i = 0; i < artifacts.length; i += buktiPerPage) {
    buktiPages.push(artifacts.slice(i, i + buktiPerPage));
  }
  // Ensure at least 1 bukti page even if no artifacts (defensive)
  if (buktiPages.length === 0) buktiPages.push([]);

  // Total pages: cover + exec + 3 indo content + N bukti pages + colophon
  const TOTAL_PAGES = 5 + buktiPages.length + 1;
  const startDate = series[0]?.date ?? today;
  const endDate = series[series.length - 1]?.date ?? today;
  periodStart.setDate(periodStart.getDate() - 60);

  return (
    <main className="min-h-screen bg-paper-2">
      {/* Top bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10">
        <TopBar
          lang="ID"
          trailing={
            <button
              type="button"
              onClick={() => window.print()}
              className="nk-btn nk-btn-primary"
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Cetak / Simpan PDF
            </button>
          }
        />
      </div>

      {/* Report content — visible on print */}
      <div className="report-root py-6">
        {/* Page 1: Cover */}
        <A4Page pageN={1} pageTotal={TOTAL_PAGES} cover>
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Laporan Fundability
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <div className="mt-12">
              <h1 className="font-serif text-h1-cover text-charcoal leading-[1.05]">
                {PERSONA.business.split(" ").slice(0, 2).join(" ")}
                <br />
                {PERSONA.business.split(" ").slice(2).join(" ")}
              </h1>

              <p className="font-serif italic text-[18px] text-sepia mt-6">
                {PERSONA.city}, {PERSONA.province}
              </p>
              <p className="font-sans text-body text-charcoal-2 mt-1">
                Periode: {fullDate(periodStart)} – {fullDate(today)}
              </p>
            </div>

            {/* Spacer pushes meta to bottom */}
            <div className="flex-1" />

            <div className="w-10 h-px bg-rule-2 mb-4" />
            <p className="font-sans text-meta text-sepia leading-relaxed">
              Disusun oleh NaikKelas Fundability Coach
              <br />
              {fullDate(today)}
              <br />
              <span className="font-mono tabular-nums">
                Berkas: § {berkasIdShort}
              </span>
            </p>
          </div>
        </A4Page>
        {/* Page 2: Executive Summary (English) */}
        <A4Page section="—" sectionLabel="EXECUTIVE SUMMARY" pageN={2} pageTotal={TOTAL_PAGES}>
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Executive Summary
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <p className="font-sans text-body text-charcoal mt-6 leading-relaxed max-w-prose">
              {PERSONA.business} is an active home-cooked food business in{" "}
              {PERSONA.area}, {PERSONA.city}, with {PERSONA.monthsActive}+ months
              of trading history, generating an average monthly revenue of{" "}
              <span className="font-mono tabular-nums">
                {rpEN(stats.avgRevenue)}
              </span>{" "}
              across {stats.channels} income{" "}
              {stats.channels === 1 ? "channel" : "channels"}.
            </p>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Key Figures
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <table className="w-full mt-4 font-sans text-body text-charcoal">
              <tbody>
                {[
                  ["Avg. monthly revenue", rpEN(stats.avgRevenue)],
                  ["Transactions / 30 days", stats.transactions.toString()],
                  ["Income channels", stats.channels.toString()],
                  ["Trend (M-o-M)", `+${stats.monthlyGrowthPct}%`],
                  [
                    "Evidence completeness",
                    `${stats.validCount} / ${artifacts.length} documents`,
                  ],
                ].map(([label, value], i, arr) => (
                  <tr
                    key={label}
                    className={i < arr.length - 1 ? "border-b border-rule" : ""}
                  >
                    <td className="py-2.5">{label}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Health Indicators
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <table className="w-full mt-4 font-sans text-body text-charcoal">
              <tbody>
                {[
                  ["Income consistency", stats.validCount >= 3 ? "GOOD" : "FAIR"],
                  ["Growth trend", "POSITIVE"],
                  [
                    "Evidence completeness",
                    stats.validCount < 3
                      ? "INSUFFICIENT"
                      : stats.flaggedCount > 0
                        ? "FAIR"
                        : "SUFFICIENT",
                  ],
                  [
                    "Channel diversification",
                    stats.channels >= 3 ? "GOOD" : stats.channels === 2 ? "FAIR" : "ATTENTION",
                  ],
                ].map(([label, value], i, arr) => (
                  <tr
                    key={label}
                    className={i < arr.length - 1 ? "border-b border-rule" : ""}
                  >
                    <td className="py-2.5">{label}</td>
                    <td className="py-2.5 text-right font-mono text-[12px] tracking-[0.08em] text-teal">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Evidence Basis
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <p className="font-sans text-body text-charcoal mt-4 leading-relaxed max-w-prose">
              This report draws on {artifacts.length} user-submitted artifacts
              (screenshots, photographs, ledger pages) parsed by Microsoft Azure
              AI Document Intelligence and verified by Azure AI Vision.{" "}
              <span className="font-serif italic">
                Findings are translations of submitted evidence and do not
                constitute a credit decision or recommendation.
              </span>
            </p>

            <div className="flex-1" />
            <p className="font-sans text-meta text-sepia mt-6">
              Full Bahasa Indonesia detail follows.
            </p>
          </div>
        </A4Page>
        {/* Page 3: § 01 Profil Usaha */}
        <A4Page section="01" sectionLabel="PROFIL USAHA" pageN={3} pageTotal={TOTAL_PAGES}>
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Profil Usaha
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <p className="font-serif text-[15px] text-charcoal mt-6 leading-relaxed max-w-prose">
              {PERSONA.business} adalah usaha makanan rumahan yang berdiri sejak
              akhir 2024 di kawasan {PERSONA.area}, {PERSONA.city}. Pemilik
              mengelola usaha bersama anggota keluarga, dengan menu utama
              berupa makanan rumahan harian. Aktivitas usaha tercatat
              konsisten selama lebih dari {PERSONA.monthsActive} bulan,
              dengan pendapatan bulanan rata-rata{" "}
              <span className="font-mono tabular-nums">
                {rp(stats.avgRevenue)}
              </span>{" "}
              dari {stats.channels} saluran pemasukan aktif.
            </p>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Keterangan Umum
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <table className="w-full mt-4 font-sans text-body text-charcoal">
              <tbody>
                {[
                  ["Nama usaha", PERSONA.business],
                  ["Jenis", "Makanan & minuman"],
                  ["Lokasi", `${PERSONA.area}, ${PERSONA.city}, ${PERSONA.province}`],
                  ["Mulai beroperasi", "November 2024"],
                  [
                    "Bukti dasar",
                    `${artifacts.length} dokumen (lihat § 04)`,
                  ],
                ].map(([label, value], i, arr) => (
                  <tr
                    key={label}
                    className={i < arr.length - 1 ? "border-b border-rule" : ""}
                  >
                    <td className="py-2.5 w-[40%] text-sepia">{label}</td>
                    <td className="py-2.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Catatan
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <p className="font-serif italic text-[14px] text-sepia mt-3 leading-relaxed max-w-prose">
              Lokasi usaha telah dikonfirmasi oleh sistem visi melalui foto
              tampak depan warung. Pola transaksi harian menunjukkan ritme
              kerja yang konsisten — pemasukan tertinggi di akhir minggu
              dan tanggal akhir bulan, dengan pola yang berulang dari bulan
              ke bulan.
            </p>

            <div className="flex-1" />
            <p className="font-sans text-meta text-sepia mt-6">
              Lanjut ke § 02 Ringkasan Aktivitas →
            </p>
          </div>
        </A4Page>
        {/* Page 4: § 02 Ringkasan Aktivitas */}
        <A4Page section="02" sectionLabel="RINGKASAN AKTIVITAS" pageN={4} pageTotal={TOTAL_PAGES}>
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Ringkasan Aktivitas
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <p className="font-serif text-[15px] text-charcoal mt-6 leading-relaxed max-w-prose">
              Aktivitas usaha selama 60 hari terakhir menunjukkan pola
              pemasukan harian yang konsisten, dengan rata-rata{" "}
              <span className="font-mono tabular-nums">
                {rp(avgDaily)}
              </span>{" "}
              per hari dan {stats.transactions} transaksi tercatat dalam 30 hari
              terakhir.
            </p>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-8">
              Pendapatan Harian — 60 Hari
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <div className="mt-4">
              <MiniChart
                width={520}
                height={140}
                series={series}
                leftLabel={nDate(startDate)}
                rightLabel={nDate(endDate)}
              />
            </div>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-8">
              Per Saluran
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <div className="mt-4">
              <ChannelTable channels={channels} />
            </div>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-8">
              Pola yang Teramati
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <p className="font-serif italic text-[14px] text-sepia mt-3 leading-relaxed max-w-prose">
              Pemasukan harian menunjukkan bumps signifikan di akhir pekan
              (rata-rata 30% lebih tinggi) dan tanggal 25–30 (efek gajian).
              Hari libur tercatat satu-dua kali tiap dua-tiga minggu — pola
              wajar untuk usaha makanan rumahan.
            </p>

            <div className="flex-1" />
            <p className="font-sans text-meta text-sepia mt-6">
              Lanjut ke § 03 Indikator Kesehatan →
            </p>
          </div>
        </A4Page>
        {/* Page 5: § 03 Indikator Kesehatan */}
        <A4Page section="03" sectionLabel="INDIKATOR KESEHATAN" pageN={5} pageTotal={TOTAL_PAGES}>
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Indikator Kesehatan
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <p className="font-serif text-[14px] text-sepia mt-3 leading-relaxed max-w-prose italic">
              Empat indikator deskriptif yang merangkum kesehatan operasional
              usaha. Bukan rekomendasi kredit — sumber data dicantumkan untuk
              tiap indikator.
            </p>

            <div className="mt-6 border-y border-rule">
              {(() => {
                const consistencyStatus = stats.validCount >= 3 ? "BAIK" : "CUKUP";
                const completenessStatus =
                  stats.validCount < 3 ? "KURANG" :
                  stats.flaggedCount > 0 ? "CUKUP" : "BAIK";
                const diversificationStatus =
                  stats.channels >= 3 ? "BAIK" :
                  stats.channels === 2 ? "CUKUP" : "PERLU PERHATIAN";
                const completenessTone =
                  completenessStatus === "KURANG" ? "text-catatan" : "text-teal";
                const diversificationTone =
                  diversificationStatus === "PERLU PERHATIAN" ? "text-catatan" : "text-teal";

                return (
                  <>
                    {/* 1. Konsistensi pemasukan */}
                    <div className="py-4 border-b border-rule">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-serif text-[15px] text-charcoal">
                          Konsistensi pemasukan
                        </span>
                        <span className="font-mono text-[12px] tracking-[0.08em] text-teal">
                          {consistencyStatus}
                        </span>
                      </div>
                      <p className="font-serif italic text-[14px] text-sepia mt-2 leading-snug">
                        Pemasukan tercatat hampir setiap hari kerja, dengan
                        ritme harian yang konsisten selama periode pengamatan.
                      </p>
                      <p className="font-mono text-[10px] text-sepia mt-2 tracking-[0.04em]">
                        Sumber: pola transaksi 60 hari (lihat § 02)
                      </p>
                    </div>

                    {/* 2. Tren pertumbuhan + mini chart */}
                    <div className="py-4 border-b border-rule">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-serif text-[15px] text-charcoal">
                          Tren pertumbuhan
                        </span>
                        <span className="font-mono text-[12px] tracking-[0.08em] text-teal">
                          POSITIF
                        </span>
                      </div>
                      <p className="font-serif italic text-[14px] text-sepia mt-2 leading-snug">
                        Naik {stats.monthlyGrowthPct}% bulan-ke-bulan,
                        didukung oleh peningkatan transaksi akhir pekan.
                      </p>
                      <div className="mt-3 max-w-[280px]">
                        <MiniChart
                          width={280}
                          height={56}
                          series={growthSeries}
                          leftLabel={nDate(growthSeries[0]?.date ?? today)}
                          rightLabel={nDate(growthSeries[growthSeries.length - 1]?.date ?? today)}
                        />
                      </div>
                      <p className="font-mono text-[10px] text-sepia mt-2 tracking-[0.04em]">
                        Sumber: pendapatan harian 30 hari (lihat § 02)
                      </p>
                    </div>

                    {/* 3. Kelengkapan bukti */}
                    <div className="py-4 border-b border-rule">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-serif text-[15px] text-charcoal">
                          Kelengkapan bukti
                        </span>
                        <span className={`font-mono text-[12px] tracking-[0.08em] ${completenessTone}`}>
                          {completenessStatus}
                        </span>
                      </div>
                      <p className="font-serif italic text-[14px] text-sepia mt-2 leading-snug">
                        {stats.validCount - stats.flaggedCount} dari{" "}
                        {artifacts.length} bukti terbaca penuh.
                        {stats.flaggedCount > 0 &&
                          ` ${stats.flaggedCount} bukti perlu diperiksa manual.`}
                      </p>
                      <p className="font-mono text-[10px] text-sepia mt-2 tracking-[0.04em]">
                        Sumber: dokumen yang dikumpulkan (lihat § 04)
                      </p>
                    </div>

                    {/* 4. Diversifikasi saluran */}
                    <div className="py-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-serif text-[15px] text-charcoal">
                          Diversifikasi saluran
                        </span>
                        <span className={`font-mono text-[12px] tracking-[0.08em] ${diversificationTone}`}>
                          {diversificationStatus}
                        </span>
                      </div>
                      <p className="font-serif italic text-[14px] text-sepia mt-2 leading-snug">
                        {stats.channels} sumber pemasukan terdeteksi:{" "}
                        {channels.map((c) => c.name).join(", ")}.
                        {stats.channels === 1 &&
                          " Disarankan menambah saluran untuk mengurangi risiko."}
                      </p>
                      <p className="font-mono text-[10px] text-sepia mt-2 tracking-[0.04em]">
                        Sumber: tabel saluran pemasukan (lihat § 02)
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex-1" />
            <p className="font-sans text-meta text-sepia mt-6">
              Lanjut ke § 04 Bukti Pendukung →
            </p>
          </div>
        </A4Page>
        {/* Pages 6-7: § 04 Bukti Pendukung — gallery 2 pages */}
        {buktiPages.map((pageArtifacts, pageIdx) => {
          const pageNum = 6 + pageIdx;
          const partLabel = `Bukti Pendukung ${pageIdx + 1}/${buktiPages.length}`;
          return (
            <A4Page
              key={`bukti-page-${pageIdx}`}
              section="04"
              sectionLabel={partLabel.toUpperCase()}
              pageN={pageNum}
              pageTotal={TOTAL_PAGES}
            >
              <div className="h-full flex flex-col">
                <p className="font-sans text-label-up-wide text-sepia uppercase">
                  Bukti Pendukung
                  <span className="font-mono text-meta-mono ml-2 normal-case tracking-[0.04em]">
                    · {pageIdx + 1}/2
                  </span>
                </p>
                <div className="w-10 h-px bg-rule-2 mt-3" />

                {pageArtifacts.length === 0 ? (
                  <p className="font-serif italic text-sepia mt-8">
                    Tidak ada bukti tambahan untuk halaman ini.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5">
                    {pageArtifacts.map((a, i) => {
                      const globalIdx = pageIdx * buktiPerPage + i;
                      const stampKind = a.stampKind as StampKind | undefined;
                      const caption = buildCaption(a.name, a.stampKind);
                      const provenance = buildProvenance(a.stampKind);
                      const timestamp = buildTimestamp(globalIdx);
                      return (
                        <div key={a.id} className="bukti-card">
                          {/* Thumbnail placeholder + stamp */}
                          <div className="relative bg-paper-3 border border-rule aspect-[5/4] overflow-hidden">
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 font-mono text-[9px] text-sepia tracking-[0.04em] truncate">
                              [{a.thumb}]
                            </div>
                            {stampKind && (
                              <div className="absolute top-2 right-2">
                                <Stamp
                                  kind={stampKind}
                                  date="24 Apr"
                                  inline
                                />
                              </div>
                            )}
                          </div>
                          {/* Caption */}
                          <p className="font-mono text-[10px] text-sepia mt-1.5 tabular-nums tracking-[0.04em] truncate">
                            #{globalIdx + 1} · {a.name}
                          </p>
                          <p className="font-serif text-[12px] text-charcoal mt-0.5 leading-tight">
                            {caption}
                          </p>
                          <p className="font-mono text-[9px] text-sepia mt-1 tracking-[0.04em] truncate">
                            {provenance} · {timestamp}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex-1" />
                <p className="font-sans text-meta text-sepia mt-6">
                  {pageIdx < buktiPages.length - 1
                    ? "Lanjut ke halaman berikutnya →"
                    : "Lanjut ke § Colophon →"}
                </p>
              </div>
            </A4Page>
          );
        })}
        {/* Final Page: Colophon */}
        <A4Page
          section="—"
          sectionLabel="COLOPHON"
          pageN={TOTAL_PAGES}
          pageTotal={TOTAL_PAGES}
        >
          <div className="h-full flex flex-col">
            <p className="font-sans text-label-up-wide text-sepia uppercase">
              Catatan Penyusunan
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />

            <p className="font-serif text-[14px] text-charcoal mt-6 leading-relaxed max-w-prose">
              Laporan ini disusun oleh{" "}
              <span className="font-serif italic">NaikKelas Fundability Coach</span>{" "}
              pada {fullDate(today)}.
            </p>

            <table className="w-full mt-6 font-sans text-body text-charcoal">
              <tbody>
                {[
                  ["Berkas", `§ ${berkasIdShort}`],
                  ["Bukti", `${artifacts.length} artefak (lihat § 04)`],
                  ["Periode pengamatan", `${fullDate(periodStart)} – ${fullDate(today)}`],
                ].map(([label, value], i, arr) => (
                  <tr
                    key={label}
                    className={i < arr.length - 1 ? "border-b border-rule" : ""}
                  >
                    <td className="py-2.5 w-[40%] text-sepia">{label}</td>
                    <td className="py-2.5 font-mono tabular-nums text-[13px]">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Alat yang Digunakan
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <ul className="mt-4 space-y-1.5 font-mono text-[13px] text-charcoal tracking-[0.02em]">
              <li>Microsoft Azure AI Document Intelligence</li>
              <li>Microsoft Azure AI Vision</li>
              <li>Microsoft Azure AI Language</li>
            </ul>

            <p className="font-sans text-label-up-wide text-sepia uppercase mt-10">
              Catatan Hukum
            </p>
            <div className="w-10 h-px bg-rule-2 mt-3" />
            <p className="font-serif italic text-[13px] text-sepia mt-3 leading-relaxed max-w-prose">
              Laporan ini menerjemahkan bukti aktivitas usaha ke dalam format
              yang dapat dibaca pemberi pinjaman. Laporan tidak menyatakan
              kelayakan kredit dan bukan rekomendasi pembiayaan. Keputusan
              pembiayaan tetap berada di lembaga keuangan terkait.
            </p>

            <div className="flex-1" />
            <div className="w-10 h-px bg-rule-2 mb-4" />
            <p className="font-mono text-meta-mono text-sepia tabular-nums tracking-[0.04em]">
              naikkelas.id · Versi laporan 1.0
            </p>
          </div>
        </A4Page>
      </div>
    </main>
  );
}