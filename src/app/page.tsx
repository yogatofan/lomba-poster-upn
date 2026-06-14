import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Shield,
  Users,
  Star,
  Trophy,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: 'Lomba Poster — Dies Natalis ke-67 UPN "Veteran" Jawa Timur',
  description:
    'Ikuti Lomba Poster Pencegahan Kekerasan Seksual Dies Natalis ke-67 UPN "Veteran" Jawa Timur. Target Rekor MURI.',
};

export const revalidate = 0;

import { createClient, createServiceClient } from "@/lib/supabase/server";

const subTema = [
  "Kenali, Cegah, dan Lawan Kekerasan Seksual",
  "Berani Bicara, Berani Melapor",
  "Stop Normalisasi Pelecehan Seksual",
  "Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital",
  "Teman Peduli, Kampus Terlindungi",
];

const indikator = [
  { nama: "Kesesuaian Tema", bobot: "25%", desc: "Relevansi poster dengan sub-tema" },
  { nama: "Orisinalitas Ide", bobot: "25%", desc: "Gagasan segar dan pendekatan unik" },
  { nama: "Desain & Estetika", bobot: "30%", desc: "Komposisi warna, layout, tipografi" },
  { nama: "Pesan & Call to Action", bobot: "20%", desc: "Pesan jelas dan mengajak bertindak" },
];

export default async function HomePage() {
  const serviceClient = await createServiceClient();
  const { count } = await serviceClient
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: "300+", label: "Target Peserta" },
    { icon: <Trophy className="w-5 h-5" />, value: count?.toString() || "0", label: "Total Karya" },
    { icon: <Star className="w-5 h-5" />, value: "5", label: "Sub-Tema" },
    { icon: <Award className="w-5 h-5" />, value: "4", label: "Indikator Penilaian" },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-tight">UPN "Veteran" Jawa Timur</p>
              <p className="text-xs text-upn-green-700 font-medium leading-tight">Dies Natalis ke-67</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-ink-muted-48 hover:text-ink font-medium transition-colors px-4 py-2 rounded-full hover:bg-canvas-parchment"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              id="btn-daftar-nav"
              className="btn-primary text-sm px-5 py-2"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section — white canvas ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-in">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-upn-green-100 border border-upn-green-400/40 px-4 py-1.5 rounded-full text-xs text-upn-green-800 font-semibold mb-8">
            <Shield className="w-3.5 h-3.5" />
            Target Rekor MURI — Dies Natalis ke-67
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-ink leading-[1.06] mb-6 tracking-tight">
            Lomba Poster
            <br />
            <span className="gradient-brand-text">Pencegahan Kekerasan Seksual</span>
          </h1>

          <p className="text-lg text-ink-muted-48 max-w-2xl mx-auto mb-10 leading-relaxed">
            Suarakan kepedulianmu melalui karya visual. Ikuti lomba poster bertema
            pencegahan kekerasan seksual dan jadilah bagian dari sejarah Rekor MURI
            UPN "Veteran" Jawa Timur.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              id="btn-daftar-hero"
              className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2"
            >
              Daftar Sebagai Peserta
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-in delay-200">
            {stats.map((stat, i) => (
              <div key={i} className="bg-canvas-parchment border border-hairline rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-2 text-upn-green-700">{stat.icon}</div>
                <p className="text-3xl font-black text-ink">{stat.value}</p>
                <p className="text-xs text-ink-muted-48 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sub-tema Section — parchment tile ── */}
      <section className="bg-canvas-parchment border-t border-b border-hairline py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-ink mb-3">Sub-Tema Lomba</h2>
            <p className="text-ink-muted-48">Pilih salah satu sub-tema untuk karyamu</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subTema.map((tema, i) => (
              <div
                key={i}
                className={`bg-white border border-hairline rounded-2xl p-5 hover:border-upn-green-400/60 hover:shadow-sm transition-all duration-200 animate-fade-in delay-${(i + 1) * 100}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-ink font-medium leading-relaxed">{tema}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Penilaian Section — white tile ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-ink mb-3">Kriteria Penilaian</h2>
            <p className="text-ink-muted-48">Karya dinilai berdasarkan 4 indikator oleh juri</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {indikator.map((item, i) => (
              <div key={i} className="bg-white border border-hairline rounded-2xl p-6 hover:border-upn-green-400/50 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold text-ink">{item.nama}</h3>
                  <span className="text-2xl font-black gradient-brand-text">{item.bobot}</span>
                </div>
                <p className="text-sm text-ink-muted-48">{item.desc}</p>
                <div className="mt-4 h-1.5 rounded-full bg-hairline overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-green"
                    style={{ width: item.bobot }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section — parchment tile ── */}
      <section className="bg-canvas-parchment border-t border-hairline py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white border border-hairline rounded-3xl p-12 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-upn-green-700 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-ink mb-4">
              Segera Daftarkan Dirimu!
            </h2>
            <p className="text-ink-muted-48 mb-8 max-w-lg mx-auto leading-relaxed">
              Jangan lewatkan kesempatan untuk berkontribusi dalam gerakan pencegahan
              kekerasan seksual dan meraih Rekor MURI bersama.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-ink-muted-48">
                <CheckCircle2 className="w-4 h-4 text-upn-green-600" />
                Upload poster JPG/PNG maks. 2MB
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-hairline" />
              <div className="flex items-center gap-2 text-sm text-ink-muted-48">
                <CheckCircle2 className="w-4 h-4 text-upn-green-600" />
                Penilaian transparan oleh juri
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-hairline" />
              <div className="flex items-center gap-2 text-sm text-ink-muted-48">
                <CheckCircle2 className="w-4 h-4 text-upn-green-600" />
                Gratis untuk mahasiswa UPNVJT
              </div>
            </div>
            <Link
              href="/register"
              id="btn-daftar-cta"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base"
            >
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-canvas-parchment border-t border-hairline py-8 text-center">
        <p className="text-xs text-ink-muted-48">
          © 2025 UPN &ldquo;Veteran&rdquo; Jawa Timur &bull; Dies Natalis ke-67 &bull; Lomba Poster Pencegahan Kekerasan Seksual
        </p>
      </footer>
    </div>
  );
}
