import { TopBar } from "@/components/nk";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <TopBar lang="ID" />

      <div className="max-w-dashboard mx-auto px-5 py-16">
        <p className="font-sans text-label-up text-sepia">FUNDABILITY COACH</p>

        <h1 className="font-serif text-h1-cover text-charcoal mt-4 leading-[1.05]">
          Bukti usaha Anda,<br />
          dalam bahasa<br />
          yang dimengerti<br />
          pemberi pinjaman.
        </h1>

        <p className="font-sans text-lead text-charcoal mt-8 max-w-md">
          NaikKelas membaca tangkapan layar GoFood, struk QRIS,
          foto warung, dan halaman buku catatan Anda — lalu menyusun
          laporan formal yang bisa dibawa ke BPR atau koperasi.
        </p>

        <div className="mt-10">
          <a
            href="/berkas/demo-2026-0438"
            className="nk-btn nk-btn-primary"
          >
            Mulai Berkas Baru →
          </a>
        </div>

        <hr className="nk-rule mt-16" />

        <p className="font-mono text-trust text-sepia mt-6">
          Powered by Microsoft Azure AI · Document Intelligence · Vision · Language
        </p>
      </div>
    </main>
  );
}