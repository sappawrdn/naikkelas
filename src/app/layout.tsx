import type { Metadata } from "next";
import { sourceSerif, interTight, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaikKelas — Fundability Coach",
  description: "Bukti usaha Anda, dalam bahasa yang dimengerti pemberi pinjaman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sourceSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}