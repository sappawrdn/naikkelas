"use client";

import { use } from "react";
import { TopBar, SectionOrnament } from "@/components/nk";

export default function RingkasanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8">
        <h1 className="font-serif text-h1">Berkas Bu Siti</h1>
        <p className="font-sans text-meta text-sepia mt-2">
          7 bukti · Dibaca 24 April 2026
        </p>

        <SectionOrnament num="01" label="Profil Usaha" />
        <p className="font-serif italic text-sepia">
          Halaman Dashboard akan dibangun di Phase berikutnya.
        </p>

        <div className="mt-8 flex gap-3">
          <a href={`/berkas/${id}/membaca`} className="nk-btn">← Processing</a>
          <a href={`/berkas/${id}/laporan`} className="nk-btn nk-btn-primary">
            → Buat Laporan PDF
          </a>
        </div>
      </div>
    </main>
  );
}