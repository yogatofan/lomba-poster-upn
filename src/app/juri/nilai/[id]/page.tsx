"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { use } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calculator,
} from "lucide-react";
import Link from "next/link";

interface Indikator {
  key: "skor_tema" | "skor_orisinalitas" | "skor_desain" | "skor_pesan";
  label: string;
  bobot: number;
  desc: string;
  color: string;
}

const INDIKATOR: Indikator[] = [
  {
    key: "skor_tema",
    label: "Kesesuaian Tema",
    bobot: 0.25,
    desc: "Relevansi poster dengan sub-tema pencegahan kekerasan seksual",
    color: "from-blue-600 to-blue-500",
  },
  {
    key: "skor_orisinalitas",
    label: "Orisinalitas Ide",
    bobot: 0.25,
    desc: "Gagasan segar, bukan plagiasi, pendekatan unik",
    color: "from-purple-600 to-purple-500",
  },
  {
    key: "skor_desain",
    label: "Desain & Estetika",
    bobot: 0.3,
    desc: "Komposisi warna, layout, tipografi, elemen visual seimbang",
    color: "from-upn-green-700 to-upn-green-600",
  },
  {
    key: "skor_pesan",
    label: "Pesan & Call to Action",
    bobot: 0.2,
    desc: "Pesan jelas, mudah dipahami, mengajak audiens bertindak",
    color: "from-orange-600 to-orange-500",
  },
];

export default function NilaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [penilaianDibuka, setPenilaianDibuka] = useState(true);
  const [submission, setSubmission] = useState<{
    id: string;
    sub_tema: string;
    judul_karya: string;
    file_url: string | null;
    index: number;
  } | null>(null);

  const [scores, setScores] = useState({
    skor_tema: 0,
    skor_orisinalitas: 0,
    skor_desain: 0,
    skor_pesan: 0,
  });
  const [catatan, setCatatan] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const totalSkor =
    scores.skor_tema * 0.25 +
    scores.skor_orisinalitas * 0.25 +
    scores.skor_desain * 0.3 +
    scores.skor_pesan * 0.2;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("settings")
        .select("penilaian_dibuka")
        .single();
      setPenilaianDibuka(settings?.penilaian_dibuka ?? true);

      // Get submission (without participant name — anonymous)
      const { data: sub } = await supabase
        .from("submissions")
        .select("id, sub_tema, judul_karya, file_url")
        .eq("id", id)
        .single();

      if (!sub) { router.push("/juri/dashboard"); return; }

      // Get submission index for display code
      const { data: allSubs } = await supabase
        .from("submissions")
        .select("id")
        .eq("status", "submitted")
        .order("submitted_at", { ascending: true });
      const idx = (allSubs?.findIndex((s) => s.id === id) ?? 0) + 1;

      setSubmission({ ...sub, index: idx });

      // Load existing score if any
      const { data: existingScore } = await supabase
        .from("scores")
        .select("*")
        .eq("submission_id", id)
        .eq("juri_id", user.id)
        .single();

      if (existingScore) {
        setIsEdit(true);
        setScores({
          skor_tema: existingScore.skor_tema,
          skor_orisinalitas: existingScore.skor_orisinalitas,
          skor_desain: existingScore.skor_desain,
          skor_pesan: existingScore.skor_pesan,
        });
        setCatatan(existingScore.catatan || "");
      }

      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const allFilled = Object.values(scores).every((v) => v >= 1 && v <= 100);
    if (!allFilled) {
      setError("Semua indikator harus diisi dengan nilai 1-100.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        submission_id: id,
        juri_id: user.id,
        skor_tema: scores.skor_tema,
        skor_orisinalitas: scores.skor_orisinalitas,
        skor_desain: scores.skor_desain,
        skor_pesan: scores.skor_pesan,
        catatan: catatan || null,
      };

      if (isEdit) {
        const { error: e } = await supabase
          .from("scores")
          .update(payload)
          .eq("submission_id", id)
          .eq("juri_id", user.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("scores").insert(payload);
        if (e) throw e;
      }

      setSuccess(true);
      setTimeout(() => router.push("/juri/dashboard"), 1800);
    } catch (err: unknown) {
      setError((err as Error).message || "Gagal menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="shimmer h-8 w-48 rounded-xl" />
        <div className="shimmer h-96 rounded-2xl" />
      </div>
    );
  }

  if (!penilaianDibuka) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Periode Penilaian Ditutup</h2>
        <p className="text-sm text-green-400/60">Penilaian tidak dapat dilakukan saat ini.</p>
        <Link href="/juri/dashboard" className="btn-primary mt-4 inline-flex text-sm px-4 py-2 rounded-xl">
          Kembali
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-green rounded-2xl p-8 text-center animate-fade-in-scale">
        <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Nilai Tersimpan!</h2>
        <p className="text-sm text-green-400/60">Total Skor: <span className="text-2xl font-black text-green-300">{totalSkor.toFixed(2)}</span></p>
        <p className="text-xs text-green-400/40 mt-2">Kembali ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/juri/dashboard" className="glass p-2 rounded-xl hover:bg-white/8 transition-colors">
          <ArrowLeft size={18} className="text-green-400" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Form Penilaian</h1>
          <p className="text-sm text-green-400/60">Karya #{String(submission?.index).padStart(3, "0")}</p>
        </div>
        {isEdit && (
          <span className="ml-auto glass px-3 py-1 rounded-full text-xs text-yellow-400 border border-yellow-700/30">
            Mode Edit
          </span>
        )}
      </div>

      {error && (
        <div className="glass-red rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Poster Preview */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">Preview Poster</p>
              {submission?.file_url && (
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                  <ExternalLink size={12} /> Buka
                </a>
              )}
            </div>
            {submission?.file_url ? (
              <div className="rounded-xl overflow-hidden bg-dark-700 aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={submission.file_url} alt="Poster" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-xl bg-dark-700 aspect-[3/4] flex items-center justify-center">
                <p className="text-xs text-green-400/40">Poster belum diupload</p>
              </div>
            )}
          </div>

          {/* Submission info */}
          <div className="glass rounded-2xl p-4 space-y-2">
            <div>
              <p className="text-xs text-green-400/50">Judul Karya</p>
              <p className="text-sm font-semibold text-white">{submission?.judul_karya}</p>
            </div>
            <div>
              <p className="text-xs text-green-400/50">Sub-Tema</p>
              <p className="text-xs text-green-200 leading-relaxed">{submission?.sub_tema}</p>
            </div>
            <p className="text-xs text-green-400/30 pt-1 border-t border-white/5">
              Identitas peserta disembunyikan untuk menjaga objektivitas penilaian.
            </p>
          </div>
        </div>

        {/* Scoring Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {INDIKATOR.map((ind) => {
            const val = scores[ind.key];
            return (
              <div key={ind.key} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-bold text-white">{ind.label}</p>
                    <p className="text-xs text-green-400/50 mt-0.5">{ind.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1 ml-3">
                    <span className={`text-2xl font-black bg-gradient-to-r ${ind.color} bg-clip-text text-transparent`}>
                      {val || "—"}
                    </span>
                    <span className="text-xs text-green-400/40">/100</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={val || 1}
                    onChange={(e) => setScores({ ...scores, [ind.key]: Number(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-400/40">1</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${ind.color} transition-all`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-400/40">100</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={val || ""}
                      onChange={(e) => {
                        const n = Math.min(100, Math.max(1, Number(e.target.value)));
                        setScores({ ...scores, [ind.key]: n });
                      }}
                      placeholder="0"
                      className="w-14 input-field text-center text-sm py-1 px-2"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-green-400/40">Bobot: {Math.round(ind.bobot * 100)}%</p>
                  <p className="text-xs text-green-400/60">
                    Kontribusi: <span className="font-semibold text-green-400">{(val * ind.bobot).toFixed(1)}</span>
                  </p>
                </div>
              </div>
            );
          })}

          {/* Catatan */}
          <div className="glass rounded-2xl p-5">
            <label htmlFor="catatan" className="text-sm font-bold text-white block mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              id="catatan"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan atau masukan untuk karya ini..."
              className="input-field resize-none"
            />
          </div>

          {/* Total Preview */}
          <div className="glass-green rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={16} className="text-green-400" />
              <p className="text-sm font-bold text-white">Preview Total Skor</p>
            </div>
            <div className="space-y-1.5 text-xs text-green-300/70 mb-3">
              {INDIKATOR.map((ind) => (
                <div key={ind.key} className="flex justify-between">
                  <span>{ind.label} ({Math.round(ind.bobot * 100)}%)</span>
                  <span className="font-semibold text-green-300">
                    {(scores[ind.key] * ind.bobot).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Total Skor</p>
              <p className="text-3xl font-black text-green-400">{totalSkor.toFixed(2)}</p>
            </div>
          </div>

          <Button id="btn-simpan-nilai" type="submit" fullWidth loading={saving} size="lg">
            {saving ? "Menyimpan..." : isEdit ? "Perbarui Nilai" : "Simpan Nilai"}
          </Button>
        </form>
      </div>
    </div>
  );
}
