import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield,
  Users,
  Star,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: 'Lomba Poster — Dies Natalis UPN "Veteran" Jawa Timur',
  description:
    'Ikuti Lomba Poster Pencegahan Kekerasan Seksual Dies Natalis UPN "Veteran" Jawa Timur. Target Rekor MURI.',
};

const subTema = [
  "Kenali, Cegah, dan Lawan Kekerasan Seksual",
  "Berani Bicara, Berani Melapor",
  "Stop Normalisasi Pelecehan Seksual",
  "Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital",
  "Teman Peduli, Kampus Terlindungi",
];

const stats = [
  { icon: <Users className="w-6 h-6" />, value: "300+", label: "Target Peserta" },
  { icon: <Trophy className="w-6 h-6" />, value: "1", label: "Rekor MURI" },
  { icon: <Star className="w-6 h-6" />, value: "5", label: "Sub-Tema" },
  { icon: <Award className="w-6 h-6" />, value: "4", label: "Indikator Penilaian" },
];

const indikator = [
  { nama: "Kesesuaian Tema", bobot: "25%", desc: "Relevansi poster dengan sub-tema" },
  { nama: "Orisinalitas Ide", bobot: "25%", desc: "Gagasan segar dan pendekatan unik" },
  { nama: "Desain & Estetika", bobot: "30%", desc: "Komposisi warna, layout, tipografi" },
  { nama: "Pesan & Call to Action", bobot: "20%", desc: "Pesan jelas dan mengajak bertindak" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-upn-green-800/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-upn-red-800/15 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-upn-green-700/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 glass border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-lg">
              UPN
            </div>
            <div>
              <p className="text-sm font-bold text-white">Lomba Poster</p>
              <p className="text-[10px] text-green-400/70">Dies Natalis UPN "Veteran" Jawa Timur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-green-300 hover:text-green-200 font-medium transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm px-4 py-2 rounded-xl"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-green-400 mb-6 border border-upn-green-700/30">
            <Shield className="w-3.5 h-3.5" />
            Target Rekor MURI — Dies Natalis UPN
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Lomba Poster
            <br />
            <span className="gradient-brand-text">Pencegahan Kekerasan Seksual</span>
          </h1>

          <p className="text-lg text-green-300/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Suarakan kepedulianmu melalui karya visual. Ikuti lomba poster bertema
            pencegahan kekerasan seksual dan jadilah bagian dari sejarah Rekor MURI
            UPN "Veteran" Jawa Timur.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              id="btn-daftar-hero"
              className="btn-primary px-8 py-3.5 rounded-xl inline-flex items-center gap-2 text-base"
            >
              Daftar Sebagai Peserta
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
            >
              Sudah punya akun? Masuk →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-in delay-200">
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center">
              <div className="flex justify-center mb-2 text-green-400">{stat.icon}</div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-green-400/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sub-tema Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Sub-Tema Lomba</h2>
          <p className="text-green-400/60">Pilih salah satu sub-tema untuk karyamu</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subTema.map((tema, i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-5 hover:border-upn-green-600/40 transition-all duration-200 animate-fade-in delay-${(i + 1) * 100}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-green-200 font-medium leading-relaxed">{tema}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Penilaian Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Kriteria Penilaian</h2>
          <p className="text-green-400/60">Karya dinilai berdasarkan 4 indikator oleh juri</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {indikator.map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-upn-green-600/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-white">{item.nama}</h3>
                <span className="text-2xl font-black gradient-brand-text">{item.bobot}</span>
              </div>
              <p className="text-sm text-green-300/60">{item.desc}</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full gradient-green"
                  style={{ width: item.bobot }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="glass-green rounded-3xl p-12 text-center">
          <Calendar className="w-10 h-10 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">
            Segera Daftarkan Dirimu!
          </h2>
          <p className="text-green-300/70 mb-8 max-w-lg mx-auto">
            Jangan lewatkan kesempatan untuk berkontribusi dalam gerakan pencegahan
            kekerasan seksual dan meraih Rekor MURI bersama.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Upload poster JPG/PNG maks. 2MB
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-green-600" />
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Penilaian transparan oleh juri
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-green-600" />
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Gratis untuk mahasiswa UPN
            </div>
          </div>
          <Link
            href="/register"
            id="btn-daftar-cta"
            className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base"
          >
            Daftar Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 py-8 text-center">
        <p className="text-xs text-green-400/40">
          © 2025 UPN "Veteran" Jawa Timur — Dies Natalis Lomba Poster Pencegahan Kekerasan Seksual
        </p>
      </footer>
    </div>
  );
}
