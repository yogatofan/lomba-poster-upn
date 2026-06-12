import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Card";
import { CheckCircle2, Clock, ArrowRight, Star, BarChart3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Juri" };

const SUB_TEMA_SHORT: Record<string, string> = {
  "Kenali, Cegah, dan Lawan Kekerasan Seksual": "Kenali & Lawan KS",
  "Berani Bicara, Berani Melapor": "Berani Bicara",
  "Stop Normalisasi Pelecehan Seksual": "Stop Normalisasi",
  "Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital": "Bijak Medsos",
  "Teman Peduli, Kampus Terlindungi": "Teman Peduli",
};

export default async function JuriDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Get all submitted submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, sub_tema, judul_karya, status, submitted_at")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  // Get scores given by this juri
  const { data: myScores } = await supabase
    .from("scores")
    .select("submission_id, total_skor")
    .eq("juri_id", user.id);

  const scoredIds = new Set(myScores?.map((s) => s.submission_id) || []);
  const total = submissions?.length || 0;
  const dinilai = scoredIds.size;
  const belumDinilai = total - dinilai;
  const pct = total > 0 ? Math.round((dinilai / total) * 100) : 0;

  // Filter by subtema
  const byTema: Record<string, number> = {};
  submissions?.forEach((s) => {
    const key = SUB_TEMA_SHORT[s.sub_tema] || s.sub_tema;
    byTema[key] = (byTema[key] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Dashboard Juri
        </h1>
        <p className="text-sm text-green-400/60 mt-1">
          Selamat datang, {profile?.full_name}
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-white">{total}</p>
          <p className="text-xs text-green-400/60 mt-1">Total Karya</p>
        </div>
        <div className="glass-green rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-green-400">{dinilai}</p>
          <p className="text-xs text-green-400/60 mt-1">Sudah Dinilai</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-yellow-700/20">
          <p className="text-3xl font-black text-yellow-400">{belumDinilai}</p>
          <p className="text-xs text-green-400/60 mt-1">Belum Dinilai</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-white">Progress Penilaian</span>
          </div>
          <span className="text-sm font-bold text-green-400">{pct}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full gradient-green rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-green-400/50 mt-2">
          {dinilai} dari {total} karya telah dinilai
        </p>
      </div>

      {/* Karya List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Star size={16} className="text-green-400" />
            Daftar Karya ({total})
          </h2>
          {belumDinilai > 0 && (
            <Badge variant="yellow">{belumDinilai} belum dinilai</Badge>
          )}
        </div>

        {total === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-green-600/30 mx-auto mb-3" />
            <p className="text-sm text-green-400/50">Belum ada karya yang masuk</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions?.map((sub, i) => {
              const scored = scoredIds.has(sub.id);
              const myScore = myScores?.find((s) => s.submission_id === sub.id);
              return (
                <Link
                  key={sub.id}
                  href={`/juri/nilai/${sub.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
                >
                  {/* Nomor kode */}
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold text-green-400 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {sub.judul_karya}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="gray" size="sm">
                        {SUB_TEMA_SHORT[sub.sub_tema] || sub.sub_tema}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {scored ? (
                      <div className="text-right">
                        <Badge variant="green">
                          <CheckCircle2 size={10} /> Dinilai
                        </Badge>
                        <p className="text-xs text-green-400/60 mt-1">
                          Skor: <span className="font-bold text-green-400">{myScore?.total_skor?.toFixed(1)}</span>
                        </p>
                      </div>
                    ) : (
                      <Badge variant="yellow">
                        <Clock size={10} /> Belum Dinilai
                      </Badge>
                    )}
                    <ArrowRight
                      size={16}
                      className="text-green-600/40 group-hover:text-green-400 transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
