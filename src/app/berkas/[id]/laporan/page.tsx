"use client";

import { use } from "react";
import { TopBar, SectionOrnament } from "@/components/nk";

export default function LaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-report mx-auto px-5 py-8">
        <SectionOrnament num="—" label="Laporan Fundability" />
        <h1 className="font-serif text-h1">Warung Makan Bu Siti</h1>
        <p className="font-sans text-meta text-sepia mt-2">
          Berkas: § FBL-2026-{id}
        </p>

        <p className="font-serif italic text-sepia mt-8">
          Halaman PDF Report akan dibangun di Phase berikutnya.
        </p>

        <div className="mt-8 flex gap-3">
          <a href={`/berkas/${id}/ringkasan`} className="nk-btn">← Kembali ke Ringkasan</a>
        </div>
      </div>
    </main>
  );
}