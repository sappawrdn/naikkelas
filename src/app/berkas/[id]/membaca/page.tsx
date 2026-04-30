"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TopBar,
  SectionOrnament,
  UploadCard,
  HatchProgress,
  ProcessingChecklist,
} from "@/components/nk";
import { loadArtifacts, saveArtifacts, type Artifact } from "@/lib/storage";
import type { StampKind, Provenance } from "@/components/nk/types";

function pickStamp(name: string): { stamp: StampKind; provenance: Provenance } {
  const lower = name.toLowerCase();
  if (lower.includes("warung") || lower.includes("foto") || lower.includes("toko")) {
    return { stamp: "LOKASI DIKONFIRMASI", provenance: "Azure AI Vision" };
  }
  return { stamp: "TERVERIFIKASI", provenance: "Azure Document Intelligence" };
}

function shouldFlag(idx: number): boolean {
  return idx > 0 && idx % 7 === 0;
}

const READ_DURATION = 3000;
const PAUSE_BEFORE_NEXT = 400;

// Build checklist items based on done count
function buildChecklist(doneCount: number, totalCount: number) {
  const items = [
    { label: "Pola pendapatan harian", threshold: 1 },
    { label: "Sumber pemasukan (GoFood, tunai, QRIS)", threshold: Math.ceil(totalCount * 0.4) },
    { label: "Tanda-tanda usaha aktif", threshold: Math.ceil(totalCount * 0.7) },
    { label: "Konsistensi catatan", threshold: totalCount },
  ];
  return items.map((it) => ({
    label: it.label,
    done: doneCount >= it.threshold,
  }));
}

export default function MembacaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loaded = loadArtifacts(id);
    if (loaded.length === 0) {
      router.replace(`/berkas/${id}`);
      return;
    }
    setArtifacts(loaded);
    setIsLoaded(true);
    setActiveIdx(0);
  }, [id, router]);

  useEffect(() => {
    if (!isLoaded || activeIdx < 0 || activeIdx >= artifacts.length) return;

    setArtifacts((prev) =>
      prev.map((a, i) =>
        i === activeIdx ? { ...a, status: "Membaca…" } : a
      )
    );

    timerRef.current = setTimeout(() => {
      const flag = shouldFlag(activeIdx);
      setArtifacts((prev) =>
        prev.map((a, i) => {
          if (i !== activeIdx) return a;
          if (flag) {
            return {
              ...a,
              status: "Sebagian terbaca",
              stampKind: "PERLU DIPERIKSA",
            };
          }
          const { stamp } = pickStamp(a.name);
          return {
            ...a,
            status: "Selesai dibaca",
            stampKind: stamp,
          };
        })
      );

      timerRef.current = setTimeout(() => {
        setActiveIdx((prev) => prev + 1);
      }, PAUSE_BEFORE_NEXT);
    }, READ_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeIdx, isLoaded, artifacts.length]);

  useEffect(() => {
    if (!isLoaded || activeIdx < artifacts.length) return;
    saveArtifacts(id, artifacts);
    const t = setTimeout(() => {
      router.push(`/berkas/${id}/ringkasan`);
    }, 1500);
    return () => clearTimeout(t);
  }, [activeIdx, isLoaded, artifacts, id, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-paper">
        <TopBar lang="ID" />
      </main>
    );
  }

  const doneCount = artifacts.filter(
    (a) =>
      a.status === "Selesai dibaca" ||
      a.status === "Sebagian terbaca" ||
      a.status === "Perlu diperiksa"
  ).length;

  const checklistItems = buildChecklist(doneCount, artifacts.length);

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8 pb-32">
        <SectionOrnament num="01" />
        <h1 className="font-serif text-h1">Sedang membaca bukti Anda.</h1>
        <p className="font-sans text-lead mt-3 max-w-md">
          AI sedang membaca tiap bukti dengan teliti. Anda tidak perlu menunggu
          di sini — kami akan beri tahu saat selesai.
        </p>

        <div className="mt-6 max-w-md">
          <HatchProgress done={doneCount} total={artifacts.length} />
        </div>

        <SectionOrnament num="02" label="Bukti Sedang Diproses" />

        <div className="space-y-3">
          {artifacts.map((a) => (
            <UploadCard
              key={a.id}
              thumb={a.thumb}
              name={a.name}
              meta={a.meta}
              status={a.status}
              stamp={a.stampKind as StampKind | undefined}
              provenance={
                a.status === "Selesai dibaca" || a.status === "Sebagian terbaca"
                  ? pickStamp(a.name).provenance
                  : undefined
              }
              note={
                a.stampKind === "PERLU DIPERIKSA"
                  ? "Tidak masalah — kami tetap bisa pakai bagian yang terbaca."
                  : undefined
              }
            />
          ))}
        </div>

        <SectionOrnament num="03" label="Yang Sedang Kami Cari" />
        <ProcessingChecklist items={checklistItems} />
      </div>
    </main>
  );
}