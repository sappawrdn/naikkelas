"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TopBar,
  SectionOrnament,
  UploadCard,
  FloatingPill,
} from "@/components/nk";
import type { UploadStatus } from "@/components/nk/types";

// Shape of an uploaded artifact in state.
type Artifact = {
  id: string;
  name: string;
  meta: string;
  thumb: string;
  status: UploadStatus;
  progress?: number;
};

// Format file size: 1234567 → "1.2 MB"
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Generate short label for thumbnail placeholder (no real image yet)
function thumbLabel(filename: string): string {
  const noExt = filename.replace(/\.[^.]+$/, "");
  return noExt.length > 12 ? noExt.slice(0, 12) : noExt;
}

export default function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Add new files to artifacts state
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: Artifact[] = Array.from(files).map((f) => ({
      id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      meta: `${f.name} · ${formatSize(f.size)}`,
      thumb: thumbLabel(f.name),
      status: "Belum dianalisis",
    }));
    setArtifacts((prev) => [...prev, ...next]);
  };

  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAnalyze = () => {
    router.push(`/berkas/${id}/membaca`);
  };

  const isEmpty = artifacts.length === 0;
  const isReady = artifacts.length > 0;

  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />
      <div className="max-w-dashboard mx-auto px-5 py-8 pb-32">
        <h1 className="font-serif text-h1">Berkas Bu Siti</h1>
        <p className="font-sans text-meta text-sepia mt-2">
          Warung Makan · Dibuat hari ini
        </p>

        <SectionOrnament num="01" label="Tambahkan Bukti" />

        {/* Hidden file input — programmatically clicked by drop zone */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Drop zone — click to open file picker, or drag files in */}
        <div
          onClick={handleClickDropZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border border-dashed bg-paper-2 p-10 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-teal border-2 bg-paper-3"
              : "border-rule-2 hover:bg-paper-3"
          }`}
        >
          <p className="font-serif text-[28px] text-sepia">+</p>
          <p className="font-sans text-body mt-3">
            {isDragging ? "Lepas untuk menambahkan" : "Tarik file ke sini"}
          </p>
          <p className="font-sans text-meta text-sepia mt-1">
            atau klik untuk pilih dari komputer
          </p>
        </div>

        <div className="mt-4 pl-3 border-l border-rule-2">
          <p className="font-serif italic text-[14px] text-sepia leading-snug">
            Tip: tidak ada file yang &ldquo;salah&rdquo;. Apa pun yang menunjukkan
            usaha Anda berguna.
          </p>
        </div>

        <SectionOrnament num="02" label={`Bukti Terkumpul · ${artifacts.length}`} />

        {isEmpty ? (
          <div className="border border-rule p-8 text-center">
            <p className="font-sans text-body text-charcoal">Belum ada bukti.</p>
            <p className="font-sans text-meta text-sepia mt-1">
              Mulai dari kotak di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {artifacts.map((a) => (
              <UploadCard
                key={a.id}
                thumb={a.thumb}
                name={a.name}
                meta={a.meta}
                status={a.status}
                progress={a.progress}
              />
            ))}
          </div>
        )}

        {isReady && (
          <>
            <SectionOrnament num="03" />
            <h3 className="font-serif text-h3">Siap dianalisis?</h3>
            <p className="font-sans text-lead mt-2">
              {artifacts.length} bukti akan dibaca oleh AI. Proses ini biasanya
              10–30 detik.
            </p>
            <button
              onClick={handleAnalyze}
              className="nk-btn nk-btn-primary nk-btn-block mt-4"
            >
              Analisis sekarang →
            </button>
          </>
        )}
      </div>

      {isReady && (
        <FloatingPill
          count={artifacts.length}
          ready={artifacts.length >= 3}
          onClick={handleAnalyze}
        />
      )}
    </main>
  );
}