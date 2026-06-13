"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { CheckCircle2, FileText, AlertCircle } from "lucide-react";

const SUB_TEMA = [
  "Kenali, Cegah, dan Lawan Kekerasan Seksual",
  "Berani Bicara, Berani Melapor",
  "Stop Normalisasi Pelecehan Seksual",
  "Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital",
  "Teman Peduli, Kampus Terlindungi",
];

const FAKULTAS_OPTIONS = [
  { value: "Fakultas Ilmu Komputer", label: "Fakultas Ilmu Komputer" },
  { value: "Fakultas Teknik", label: "Fakultas Teknik" },
  { value: "Fakultas Ekonomi dan Bisnis", label: "Fakultas Ekonomi dan Bisnis" },
  { value: "Fakultas Pertanian", label: "Fakultas Pertanian" },
  { value: "Fakultas Hukum", label: "Fakultas Hukum" },
  { value: "Fakultas Ilmu Sosial dan Ilmu Politik", label: "Fakultas Ilmu Sosial dan Ilmu Politik" },
  { value: "Fakultas Kedokteran", label: "Fakultas Kedokteran" },
  { value: "Fakultas Arsitektur dan Desain", label: "Fakultas Arsitektur dan Desain" },
];

export default function DaftarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendaftaranDibuka, setPendaftaranDibuka] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    npm: "",
    program_studi: "",
    fakultas: "",
    no_hp: "",
    judul_karya: "",
    sub_tema: "",
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("settings")
        .select("pendaftaran_dibuka")
        .single();
      setPendaftaranDibuka(settings?.pendaftaran_dibuka ?? true);

      const { data: participant } = await supabase
        .from("participants")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (participant) {
        setIsEdit(true);
        setParticipantId(participant.id);
        setForm((f) => ({
          ...f,
          npm: participant.npm,
          program_studi: participant.program_studi,
          fakultas: participant.fakultas,
          no_hp: participant.no_hp,
        }));

        const { data: submission } = await supabase
          .from("submissions")
          .select("id, sub_tema, judul_karya")
          .eq("participant_id", participant.id)
          .single();

        if (submission) {
          setSubmissionId(submission.id);
          setForm((f) => ({
            ...f,
            sub_tema: submission.sub_tema,
            judul_karya: submission.judul_karya,
          }));
        }
      }

      setLoading(false);
    }
    loadData();
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.npm.trim()) e.npm = "NPM wajib diisi";
    if (!form.program_studi.trim()) e.program_studi = "Program studi wajib diisi";
    if (!form.fakultas) e.fakultas = "Fakultas wajib dipilih";
    if (!form.no_hp.trim()) e.no_hp = "No. HP wajib diisi";
    if (!form.judul_karya.trim()) e.judul_karya = "Judul karya wajib diisi";
    if (!form.sub_tema) e.sub_tema = "Sub-tema wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let pid = participantId;

      if (isEdit && pid) {
        await supabase
          .from("participants")
          .update({
            npm: form.npm,
            program_studi: form.program_studi,
            fakultas: form.fakultas,
            no_hp: form.no_hp,
          })
          .eq("id", pid);
      } else {
        const { data: newParticipant, error: pErr } = await supabase
          .from("participants")
          .insert({
            profile_id: user.id,
            npm: form.npm,
            program_studi: form.program_studi,
            fakultas: form.fakultas,
            no_hp: form.no_hp,
          })
          .select()
          .single();

        if (pErr) throw pErr;
        pid = newParticipant.id;
        setParticipantId(pid);
      }

      if (submissionId) {
        await supabase
          .from("submissions")
          .update({ sub_tema: form.sub_tema, judul_karya: form.judul_karya })
          .eq("id", submissionId);
      } else {
        await supabase.from("submissions").insert({
          participant_id: pid,
          sub_tema: form.sub_tema,
          judul_karya: form.judul_karya,
          status: "draft",
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/peserta/upload"), 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="shimmer h-8 w-48 rounded-xl" />
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    );
  }

  if (!pendaftaranDibuka) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-upn-red-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Pendaftaran Ditutup</h2>
        <p className="text-sm text-ink-muted-48">
          Periode pendaftaran telah berakhir. Formulir tidak dapat diakses.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-green rounded-2xl p-8 text-center animate-fade-in-scale max-w-md mx-auto mt-12 border border-upn-green-600/20">
        <CheckCircle2 className="w-14 h-14 text-upn-green-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Data Tersimpan!</h2>
        <p className="text-sm text-ink-muted-48">Mengarahkan ke halaman upload poster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-ink flex items-center gap-2">
          <FileText className="w-6 h-6 text-upn-green-700" />
          {isEdit ? "Edit" : "Formulir"} Pendaftaran
        </h1>
        <p className="text-sm text-ink-muted-48 mt-1">
          {isEdit ? "Perbarui data diri dan pilihan sub-tema" : "Isi data diri dan pilih sub-tema lomba"}
        </p>
      </div>

      {error && (
        <div className="glass-red rounded-xl p-4 flex items-start gap-2 border border-upn-red-700/20">
          <AlertCircle className="w-4 h-4 text-upn-red-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-red-800 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Data Diri */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-ink border-b border-hairline pb-3">Data Diri</h2>

          <Input
            id="input-npm"
            label="NPM (Nomor Pokok Mahasiswa)"
            type="text"
            placeholder="Contoh: 22081010123"
            value={form.npm}
            onChange={(e) => setForm({ ...form, npm: e.target.value })}
            error={errors.npm}
          />

          <Input
            id="input-prodi"
            label="Program Studi"
            type="text"
            placeholder="Contoh: Sistem Informasi"
            value={form.program_studi}
            onChange={(e) => setForm({ ...form, program_studi: e.target.value })}
            error={errors.program_studi}
          />

          <Select
            id="input-fakultas"
            label="Fakultas"
            placeholder="-- Pilih Fakultas --"
            value={form.fakultas}
            onChange={(e) => setForm({ ...form, fakultas: e.target.value })}
            options={FAKULTAS_OPTIONS}
            error={errors.fakultas}
          />

          <Input
            id="input-nohp"
            label="Nomor HP / WhatsApp"
            type="tel"
            placeholder="Contoh: 08123456789"
            value={form.no_hp}
            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            error={errors.no_hp}
            hint="Nomor aktif untuk keperluan komunikasi panitia"
          />
        </div>

        {/* Karya */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-ink border-b border-hairline pb-3">Data Karya</h2>

          <Input
            id="input-judul"
            label="Judul Karya"
            type="text"
            placeholder="Masukkan judul poster Anda"
            value={form.judul_karya}
            onChange={(e) => setForm({ ...form, judul_karya: e.target.value })}
            error={errors.judul_karya}
          />

          {/* Sub-tema cards */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-muted-80">Sub-Tema</label>
            <div className="space-y-2">
              {SUB_TEMA.map((tema, i) => (
                <label
                  key={i}
                  htmlFor={`subtema-${i}`}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.sub_tema === tema
                      ? "bg-upn-green-50 border-upn-green-600 text-ink shadow-sm"
                      : "border-hairline bg-white hover:bg-canvas-parchment text-ink-muted-48 hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    id={`subtema-${i}`}
                    name="sub_tema"
                    value={tema}
                    checked={form.sub_tema === tema}
                    onChange={() => setForm({ ...form, sub_tema: tema })}
                    className="mt-0.5 accent-upn-green-700 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${form.sub_tema === tema ? "text-upn-green-700" : "text-ink-muted-48"}`}>
                      Sub-Tema {i + 1}
                    </p>
                    <p className="text-sm font-semibold">{tema}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.sub_tema && <p className="text-xs text-upn-red-700">⚠ {errors.sub_tema}</p>}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card bg-upn-green-50/50 border border-upn-green-100 p-4">
          <p className="text-xs text-ink-muted-80 leading-relaxed">
            <strong>Pernyataan Peserta:</strong> Dengan mendaftar, saya menyatakan bahwa karya yang
            dikirimkan merupakan karya orisinal milik saya, tidak melanggar hak cipta pihak lain,
            bersifat edukatif, dan tidak mengandung konten grafis/eksploitatif. Data yang saya isi
            adalah benar dan dapat digunakan sebagai bukti pendukung pengajuan Rekor MURI.
          </p>
        </div>

        <Button
          id="btn-simpan-daftar"
          type="submit"
          fullWidth
          loading={saving}
          size="lg"
        >
          {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan & Lanjut ke Upload Poster"}
        </Button>
      </form>
    </div>
  );
}
