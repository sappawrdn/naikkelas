"use client";

import { use } from "react";
import { TopBar, SectionOrnament } from "@/components/nk";

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8">
        <h1 className="font-serif text-h1">Berkas Bu Siti</h1>
        <p className="font-sans text-meta text-sepia mt-2">
          Warung Makan · Dibuat hari ini
        </p>

        <SectionOrnament num="01" label="Tambahkan Bukti" />

        <div className="border border-rule-2 border-dashed bg-paper-2 p-10 text-center">
          <p className="font-serif text-[22px] text-sepia">+</p>
          <p className="font-sans text-body mt-3">
            Halaman Upload akan dibangun di Phase 4B
          </p>
          <p className="font-mono text-meta-mono text-sepia mt-2">
            Berkas ID: {id}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <a href={`/berkas/${id}/membaca`} className="nk-btn nk-btn-primary">
            → Lanjut ke Processing
          </a>
        </div>
      </div>
    </main>
  );
}