import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Card";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Peserta",
};

export default async function PesertaDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: participant } = await supabase
    .from("participants")
    .select("id, npm, program_studi, fakultas")
    .eq("profile_id", user.id)
    .single();

  const { data: submission } = participant
    ? await supabase
        .from("submissions")
        .select("id, sub_tema, judul_karya, file_url, status, submitted_at")
        .eq("participant_id", participant.id)
        .single()
    : { data: null };

  const { data: settings } = await supabase
    .from("settings")
    .select("pendaftaran_dibuka, tanggal_selesai")
    .single();

  const pendaftaranDibuka = settings?.pendaftaran_dibuka ?? true;

  const steps = [
    {
      num: 1,
      label: "Buat Akun",
      done: true,
      href: null,
    },
    {
      num: 2,
      label: "Isi Data Diri",
      done: !!participant,
      href: "/peserta/daftar",
      actionLabel: "Isi Sekarang",
    },
    {
      num: 3,
      label: "Upload Poster",
      done: !!submission?.file_url,
      href: "/peserta/upload",
      actionLabel: "Upload Poster",
      disabled: !participant,
    },
    {
      num: 4,
      label: "Karya Terkirim",
      done: submission?.status === "submitted",
      href: null,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Halo, {profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-green-400/60 mt-1">
          Dashboard Peserta — Lomba Poster Dies Natalis 67 UPN "Veteran" Jawa Timur
        </p>
      </div>

      {/* Status Pendaftaran */}
      {!pendaftaranDibuka && (
        <div className="glass-red rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Pendaftaran Ditutup</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Periode pendaftaran telah berakhir. Data yang sudah tersimpan tidak dapat diubah.
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-5">Progress Pendaftaran</h2>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                step.done
                  ? "bg-upn-green-800/15 border border-upn-green-700/20"
                  : "bg-white/3 border border-white/6"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  step.done
                    ? "bg-upn-green-700 text-white"
                    : "bg-white/10 text-green-400/50"
                }`}
              >
                {step.done ? <CheckCircle2 size={16} /> : step.num}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${step.done ? "text-green-300" : "text-green-400/50"}`}>
                  {step.label}
                </p>
              </div>
              {!step.done && step.href && !step.disabled && pendaftaranDibuka && (
                <Link
                  href={step.href}
                  className="text-xs text-green-400 hover:text-green-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  {step.actionLabel}
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Info Data Diri */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-green-400" />
              Data Diri
            </h2>
            {participant && pendaftaranDibuka && (
              <Link href="/peserta/daftar" className="text-xs text-green-400 hover:text-green-300">
                Edit →
              </Link>
            )}
          </div>
          {participant ? (
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-green-400/50">NPM</p>
                <p className="text-sm text-white font-medium">{participant.npm}</p>
              </div>
              <div>
                <p className="text-xs text-green-400/50">Program Studi</p>
                <p className="text-sm text-white font-medium">{participant.program_studi}</p>
              </div>
              <div>
                <p className="text-xs text-green-400/50">Fakultas</p>
                <p className="text-sm text-white font-medium">{participant.fakultas}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-green-400/50 mb-3">Belum mengisi data diri</p>
              {pendaftaranDibuka && (
                <Link href="/peserta/daftar" className="btn-primary text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1">
                  Isi Data Diri <ArrowRight size={12} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Info Karya */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload size={16} className="text-green-400" />
              Karya Poster
            </h2>
            {submission?.file_url && pendaftaranDibuka && (
              <Link href="/peserta/upload" className="text-xs text-green-400 hover:text-green-300">
                Reupload →
              </Link>
            )}
          </div>
          {submission ? (
            <div className="space-y-2.5">
              {submission.file_url && (
                <div className="relative rounded-xl overflow-hidden bg-dark-700 mb-3 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={submission.file_url}
                    alt="Preview poster"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 glass p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-green-400/50">Judul Karya</p>
                <p className="text-sm text-white font-medium">{submission.judul_karya}</p>
              </div>
              <div>
                <p className="text-xs text-green-400/50">Sub-Tema</p>
                <p className="text-xs text-green-200">{submission.sub_tema}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-green-400/50">Status:</p>
                <Badge variant={submission.status === "submitted" ? "green" : "yellow"}>
                  {submission.status === "submitted" ? (
                    <><CheckCircle2 size={10} /> Terkirim</>
                  ) : (
                    <><Clock size={10} /> Draft</>
                  )}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-green-400/50 mb-3">
                {participant ? "Belum upload poster" : "Isi data diri terlebih dahulu"}
              </p>
              {participant && pendaftaranDibuka && (
                <Link href="/peserta/upload" className="btn-primary text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1">
                  Upload Poster <ArrowRight size={12} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs text-green-300/60 leading-relaxed">
            Data pendaftaran Anda akan digunakan sebagai bukti pendukung pengajuan Rekor MURI.
            Pastikan data yang diisi sesuai dengan identitas resmi (KTM/KTP). Format poster: JPG/PNG
            maks. 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
