"use client";

import { use } from "react";
import { TopBar, SectionOrnament, HatchProgress } from "@/components/nk";

export default function MembacaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8">
        <SectionOrnament num="01" />
        <h1 className="font-serif text-h1">Sedang membaca bukti Anda.</h1>
        <p className="font-sans text-lead mt-3 text-charcoal">
          Halaman Processing akan dibangun di Phase berikutnya.
        </p>

        <div className="mt-8 max-w-md">
          <HatchProgress done={3} total={7} />
        </div>

        <div className="mt-8 flex gap-3">
          <a href={`/berkas/${id}`} className="nk-btn">← Upload</a>
          <a href={`/berkas/${id}/ringkasan`} className="nk-btn nk-btn-primary">
            → Ringkasan
          </a>
        </div>
      </div>
    </main>
  );
}