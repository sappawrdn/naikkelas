"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TopBar,
  SectionOrnament,
  HeroFigure,
  MiniChart,
  ChannelTable,
  HealthIndicatorRow,
} from "@/components/nk";
import type { HealthStatus } from "@/components/nk/types";
import { loadArtifacts, type Artifact } from "@/lib/storage";
import { rp, fullDate, deltaID, nDate } from "@/lib/format";

const PERSONA = {
  business: "Warung Makan Bu Siti",
  type: "Warung Makan",
  city: "Bandung",
  area: "Antapani",
  monthsActive: 18,
};

function computeStats(artifacts: Artifact[]) {
  const validCount = artifacts.filter(
    (a) => a.status === "Selesai dibaca" || a.status === "Sebagian terbaca"
  ).length;
  const avgRevenue = 7000000 + validCount * 200000;
  const transactions = 200 + validCount * 8;
  const channels = Math.min(3, Math.max(1, Math.ceil(validCount / 3)));
  const monthlyGrowthPct = 12;
  return { avgRevenue, transactions, channels, monthlyGrowthPct, validCount };
}

function buildProfileProse(stats: ReturnType<typeof computeStats>): string {
  const channelLabels = ["pelanggan langsung", "GoFood", "QRIS", "ShopeeFood"];
  const channelText = channelLabels.slice(0, stats.channels + 1).join(", ");
  return (
    `${PERSONA.business} adalah usaha makanan rumahan di ${PERSONA.area}, ` +
    `${PERSONA.city}, yang aktif selama lebih dari ${PERSONA.monthsActive} bulan. ` +
    `Pendapatan utama berasal dari ${channelText}, dengan pola transaksi ` +
    `harian yang konsisten.`
  );
}

// Generate 60-day deterministic series (sin wave + weekend bumps + gajian spike)
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

// Build channel breakdown rows from total monthly revenue (ratio locked)
function buildChannels(monthlyRevenue: number, channelCount: number) {
  // Standard ratio per R3: GoFood 49% · QRIS 34% · Tunai 17%
  const all = [
    { name: "GoFood", pct: 49 },
    { name: "QRIS",   pct: 34 },
    { name: "Tunai",  pct: 17 },
  ];
  // If only 1-2 channels active, redistribute to 100%
  const active = all.slice(0, channelCount);
  const totalPct = active.reduce((s, c) => s + c.pct, 0);
  return active.map((c) => ({
    name: c.name,
    pct: Math.round((c.pct / totalPct) * 100),
    value: Math.round((monthlyRevenue * c.pct) / totalPct),
  }));
}

export default function RingkasanPage({
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
  const stats = computeStats(artifacts);
  const channelNames = ["GoFood", "QRIS", "Tunai"].slice(0, stats.channels);

  // Daily revenue ≈ monthly / 30
  const avgDaily = Math.round(stats.avgRevenue / 30);
  const series = build60DaySeries(avgDaily, today);
  const channels = buildChannels(stats.avgRevenue, stats.channels);
  const startDate = series[0]?.date ?? today;
  const endDate = series[series.length - 1]?.date ?? today;

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8 pb-32">
        <h1 className="font-serif text-h1">{PERSONA.business}</h1>
        <p className="font-sans text-meta text-sepia mt-2 tabular-nums">
          {artifacts.length} bukti · Dibaca {fullDate(today)}
        </p>

        {/* § 01 Profil Usaha */}
        <SectionOrnament num="01" label="Profil Usaha" />
        <p className="font-sans text-lead text-charcoal max-w-prose">
          {buildProfileProse(stats)}
        </p>

        {/* § 02 Sorotan */}
        <SectionOrnament num="02" label="Sorotan" />
        <div className="space-y-3">
          <HeroFigure
            value={rp(stats.avgRevenue)}
            label="Pendapatan rata-rata 30 hari"
            delta={deltaID(stats.monthlyGrowthPct)}
            deltaTone="pos"
          />
          <HeroFigure
            value={stats.transactions.toLocaleString("id-ID")}
            label="Transaksi tercatat 30 hari terakhir"
            delta={`≈ ${Math.round(stats.transactions / 30)} per hari`}
            deltaTone="neutral"
          />
          <HeroFigure
            value={String(stats.channels)}
            label="Saluran pemasukan"
            delta={channelNames.join(" · ")}
            deltaTone="neutral"
          />
        </div>

        {/* § 03 Aktivitas Usaha */}
        <SectionOrnament num="03" label="Aktivitas Usaha — 60 hari" />
        <div className="border border-rule p-4 bg-paper">
          <MiniChart
            width={640}
            height={140}
            series={series}
            leftLabel={nDate(startDate)}
            rightLabel={nDate(endDate)}
          />
        </div>

        <h3 className="font-serif text-h3 mt-6">Per saluran</h3>
        <div className="mt-3">
          <ChannelTable channels={channels} />
        </div>

        {/* § 04 Indikator Kesehatan */}
        <SectionOrnament num="04" label="Indikator Kesehatan" />
        <div className="border-y border-rule">
          {(() => {
            const flaggedCount = artifacts.filter(
              (a) => a.stampKind === "PERLU DIPERIKSA"
            ).length;
            const consistencyStatus: HealthStatus =
              stats.validCount >= 3 ? "BAIK" : "CUKUP";
            const completenessStatus: HealthStatus =
              stats.validCount < 3 ? "KURANG" :
              flaggedCount > 0 ? "CUKUP" : "BAIK";
            const diversificationStatus: HealthStatus =
              stats.channels >= 3 ? "BAIK" :
              stats.channels === 2 ? "CUKUP" : "PERLU PERHATIAN";

            return (
              <>
                <HealthIndicatorRow
                  name="Konsistensi pemasukan"
                  status={consistencyStatus}
                  explain="Pemasukan tercatat hampir setiap hari kerja."
                />
                <HealthIndicatorRow
                  name="Tren pertumbuhan"
                  status="POSITIF"
                  explain={`Naik ${stats.monthlyGrowthPct}% bulan-ke-bulan.`}
                />
                <HealthIndicatorRow
                  name="Kelengkapan bukti"
                  status={completenessStatus}
                  explain={
                    flaggedCount > 0
                      ? `${stats.validCount - flaggedCount} dari ${artifacts.length} bukti terbaca penuh.`
                      : `${stats.validCount} dari ${artifacts.length} bukti terbaca penuh.`
                  }
                />
                <HealthIndicatorRow
                  name="Diversifikasi saluran"
                  status={diversificationStatus}
                  explain={`${stats.channels} sumber pemasukan terdeteksi.`}
                  last
                />
              </>
            );
          })()}
        </div>

        {/* § 05 Bukti Pendukung */}
        <SectionOrnament num="05" label={`Bukti Pendukung — ${artifacts.length}`} />
        <div className="grid grid-cols-2 gap-3">
          {artifacts.map((a) => {
            const stampKind = a.stampKind;
            const isFlagged = stampKind === "PERLU DIPERIKSA";
            return (
              <div
                key={a.id}
                className="relative bg-paper-3 border border-rule aspect-[4/5] overflow-hidden"
              >
                {/* Thumbnail label */}
                <div className="absolute bottom-2 left-2 right-2 font-mono text-[9px] text-sepia tracking-[0.04em] truncate">
                  [{a.thumb}]
                </div>
                {/* Small stamp badge (top-right) */}
                {stampKind && (
                  <div
                    className={`absolute top-2 right-2 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] border px-1.5 py-0.5 leading-none ${
                      isFlagged
                        ? "text-catatan border-catatan"
                        : "text-stempel-deep border-stempel-deep"
                    }`}
                    style={{ transform: "rotate(-4deg)" }}
                  >
                    {stampKind === "TERVERIFIKASI" && "VERIF"}
                    {stampKind === "LOKASI DIKONFIRMASI" && "LOKASI"}
                    {stampKind === "PERLU DIPERIKSA" && "PERIKSA"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dual CTA */}
        <div className="mt-12 space-y-3">
          <button
            type="button"
            className="nk-btn nk-btn-block"
            onClick={() => alert("Coach screen — coming in Phase 4G")}
          >
            Bicara dengan Pelatih
          </button>
          <button
            type="button"
            className="nk-btn nk-btn-primary nk-btn-block"
            onClick={() => router.push(`/berkas/${id}/laporan`)}
          >
            Buat Laporan PDF
          </button>
        </div>

        {/* Trust line */}
        <div className="mt-12 pt-6 border-t border-rule">
          <p className="font-mono text-trust text-sepia tabular-nums">
            Powered by Microsoft Azure AI · Document Intelligence · Vision · Language
          </p>
        </div>
      </div>
    </main>
  );
}