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
  title: "Dashboard",
};

export default async function PesertaDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
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
        <h1 className="text-2xl font-black text-ink">
          Halo, {profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-ink-muted-48 mt-1">
          Lomba Poster Dies Natalis ke-67 UPN &ldquo;Veteran&rdquo; Jawa Timur
        </p>
      </div>

      {/* Welcome Message after Email Confirmation */}
      {message === "confirmed" && (
        <div className="bg-upn-green-100 border border-upn-green-400/40 rounded-[18px] p-4 flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-upn-green-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-upn-green-800 tracking-tight uppercase">Email Berhasil Dikonfirmasi!</p>
            <p className="text-xs text-upn-green-700 font-medium mt-0.5">
              Selamat, akun Anda telah aktif. Silakan lengkapi data diri dan unggah poster terbaik Anda.
            </p>
          </div>
        </div>
      )}

      {/* Status Pendaftaran */}
      {!pendaftaranDibuka && (
        <div className="card-alert flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-upn-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-upn-red-700">Pendaftaran Ditutup</p>
            <p className="text-xs text-upn-red-700/70 mt-0.5">
              Periode pendaftaran telah berakhir. Data yang sudah tersimpan tidak dapat diubah.
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white border border-hairline rounded-[18px] p-6">
        <h2 className="text-base font-bold text-ink mb-5">Progress Pendaftaran</h2>
        <div className="space-y-2.5">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${step.done
                ? "bg-upn-green-50 border border-upn-green-400/30"
                : "bg-canvas-parchment border border-hairline"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step.done
                  ? "bg-upn-green-700 text-white"
                  : "bg-white border border-hairline text-ink-muted-48"
                  }`}
              >
                {step.done ? <CheckCircle2 size={16} /> : step.num}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${step.done ? "text-upn-green-800" : "text-ink-muted-48"}`}>
                  {step.label}
                </p>
              </div>
              {!step.done && step.href && !step.disabled && pendaftaranDibuka && (
                <Link
                  href={step.href}
                  className="text-xs text-upn-green-700 hover:text-upn-green-800 font-semibold flex items-center gap-1 transition-colors"
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
        <div className="bg-white border border-hairline rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <FileText size={16} className="text-upn-green-700" />
              Data Diri
            </h2>
            {participant && pendaftaranDibuka && (
              <Link href="/peserta/daftar" className="text-xs text-upn-green-700 hover:text-upn-green-800 font-medium">
                Edit →
              </Link>
            )}
          </div>
          {participant ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-muted-48 font-medium mb-0.5">NPM</p>
                <p className="text-sm text-ink font-semibold">{participant.npm}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted-48 font-medium mb-0.5">Program Studi</p>
                <p className="text-sm text-ink font-semibold">{participant.program_studi}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted-48 font-medium mb-0.5">Fakultas</p>
                <p className="text-sm text-ink font-semibold">{participant.fakultas}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-ink-muted-48 mb-3">Belum mengisi data diri</p>
              {pendaftaranDibuka && (
                <Link href="/peserta/daftar" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1">
                  Isi Data Diri <ArrowRight size={12} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Info Karya */}
        <div className="bg-white border border-hairline rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Upload size={16} className="text-upn-green-700" />
              Karya Poster
            </h2>
            {submission?.file_url && pendaftaranDibuka && (
              <Link href="/peserta/upload" className="text-xs text-upn-green-700 hover:text-upn-green-800 font-medium">
                Reupload →
              </Link>
            )}
          </div>
          {submission ? (
            <div className="space-y-2.5">
              {submission.file_url && (
                <div className="relative rounded-xl overflow-hidden bg-canvas-parchment mb-3 aspect-video">
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
                    className="absolute top-2 right-2 bg-white border border-hairline p-1.5 rounded-lg text-ink-muted-48 hover:text-ink transition-colors shadow-sm"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-ink-muted-48 font-medium mb-0.5">Judul Karya</p>
                <p className="text-sm text-ink font-semibold">{submission.judul_karya}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted-48 font-medium mb-0.5">Sub-Tema</p>
                <p className="text-xs text-ink-muted-80">{submission.sub_tema}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-ink-muted-48 font-medium">Status:</p>
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
              <p className="text-sm text-ink-muted-48 mb-3">
                {participant ? "Belum upload poster" : "Isi data diri terlebih dahulu"}
              </p>
              {participant && pendaftaranDibuka && (
                <Link href="/peserta/upload" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1">
                  Upload Poster <ArrowRight size={12} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card-info flex items-start gap-3">
        <Shield className="w-4 h-4 text-upn-green-700 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-muted-80 leading-relaxed">
          Data pendaftaran Anda akan digunakan sebagai bukti pendukung pengajuan Rekor MURI.
          Pastikan data yang diisi sesuai dengan identitas resmi (KTM/KTP). Format poster: JPG/PNG
          maks. 2MB.
        </p>
      </div>
    </div>
  );
}
