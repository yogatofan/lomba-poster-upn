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
      <div className="card p-8 text-center max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-upn-red-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Periode Penilaian Ditutup</h2>
        <p className="text-sm text-ink-muted-48">Penilaian tidak dapat dilakukan saat ini.</p>
        <Link href="/juri/dashboard" className="btn-primary mt-6 inline-flex text-sm">
          Kembali
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-green rounded-2xl p-8 text-center animate-fade-in-scale max-w-md mx-auto mt-12 border border-upn-green-600/20">
        <CheckCircle2 className="w-14 h-14 text-upn-green-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink mb-2">Nilai Tersimpan!</h2>
        <p className="text-sm text-ink-muted-48">Total Skor: <span className="text-2xl font-black text-upn-green-700">{totalSkor.toFixed(2)}</span></p>
        <p className="text-xs text-ink-muted-48/70 mt-2 animate-pulse">Kembali ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/juri/dashboard" className="card p-2 hover:bg-canvas-parchment transition-colors flex items-center justify-center cursor-pointer">
          <ArrowLeft size={18} className="text-upn-green-700" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-ink">Form Penilaian</h1>
          <p className="text-sm text-ink-muted-48">Karya #{String(submission?.index).padStart(3, "0")}</p>
        </div>
        {isEdit && (
          <span className="ml-auto bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
            Mode Edit
          </span>
        )}
      </div>

      {error && (
        <div className="glass-red rounded-xl p-3 flex items-start gap-2 border border-upn-red-700/20">
          <AlertCircle size={14} className="text-upn-red-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Poster Preview */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-ink">Preview Poster</p>
              {submission?.file_url && (
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-upn-green-700 hover:text-upn-green-800 flex items-center gap-1 font-semibold">
                  <ExternalLink size={12} /> Buka
                </a>
              )}
            </div>
            {submission?.file_url ? (
              <div className="rounded-xl overflow-hidden bg-canvas-parchment aspect-[3/4] border border-hairline">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={submission.file_url} alt="Poster" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="rounded-xl bg-canvas-parchment aspect-[3/4] flex items-center justify-center border border-hairline">
                <p className="text-xs text-ink-muted-48/70">Poster belum diupload</p>
              </div>
            )}
          </div>

          {/* Submission info */}
          <div className="card p-4 space-y-2.5">
            <div>
              <p className="text-xs text-ink-muted-48">Judul Karya</p>
              <p className="text-sm font-semibold text-ink leading-snug">{submission?.judul_karya}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted-48">Sub-Tema</p>
              <p className="text-xs text-ink-muted-80 font-medium leading-relaxed">{submission?.sub_tema}</p>
            </div>
            <p className="text-xs text-ink-muted-48/70 pt-2 border-t border-hairline">
              Identitas peserta disembunyikan untuk menjaga objektivitas penilaian.
            </p>
          </div>
        </div>

        {/* Scoring Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {INDIKATOR.map((ind) => {
            const val = scores[ind.key];
            return (
              <div key={ind.key} className="card p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-bold text-ink">{ind.label}</p>
                    <p className="text-xs text-ink-muted-48 mt-0.5">{ind.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1 ml-3">
                    <span className={`text-2xl font-black bg-gradient-to-r ${ind.color} bg-clip-text text-transparent`}>
                      {val || "—"}
                    </span>
                    <span className="text-xs text-ink-muted-48/60">/100</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={val || 1}
                    onChange={(e) => setScores({ ...scores, [ind.key]: Number(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none bg-zinc-200 cursor-pointer accent-upn-green-700"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted-48/50">1</span>
                    <div className="flex-1 h-1.5 rounded-full bg-canvas-parchment overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${ind.color} transition-all`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-muted-48/50">100</span>
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

                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className="text-ink-muted-48">Bobot: {Math.round(ind.bobot * 100)}%</p>
                  <p className="text-ink-muted-48">
                    Kontribusi: <span className="font-semibold text-upn-green-700">{(val * ind.bobot).toFixed(1)}</span>
                  </p>
                </div>
              </div>
            );
          })}

          {/* Catatan */}
          <div className="card p-5">
            <label htmlFor="catatan" className="text-sm font-bold text-ink block mb-2">
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
          <div className="card bg-upn-green-50/50 border border-upn-green-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={16} className="text-upn-green-700" />
              <p className="text-sm font-bold text-ink">Preview Total Skor</p>
            </div>
            <div className="space-y-1.5 text-xs text-ink-muted-80 mb-3">
              {INDIKATOR.map((ind) => (
                <div key={ind.key} className="flex justify-between">
                  <span>{ind.label} ({Math.round(ind.bobot * 100)}%)</span>
                  <span className="font-semibold text-upn-green-800">
                    {(scores[ind.key] * ind.bobot).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-hairline pt-3 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Total Skor</p>
              <p className="text-3xl font-black text-upn-green-700">{totalSkor.toFixed(2)}</p>
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
