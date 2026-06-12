import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Card";
import { Trophy, Medal, Star, ImageIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard Admin" };

export default async function AdminLeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get all submitted submissions with participant info and scores
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id, judul_karya, sub_tema, file_url,
      participants(
        npm, program_studi, fakultas,
        profiles(full_name)
      ),
      scores(juri_id, total_skor, skor_tema, skor_orisinalitas, skor_desain, skor_pesan, profiles(full_name))
    `)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  // Calculate average score per submission
  interface ScoreEntry {
    juri_id: string;
    total_skor: number;
    skor_tema: number;
    skor_orisinalitas: number;
    skor_desain: number;
    skor_pesan: number;
    profiles: { full_name: string } | null;
  }
  interface ParticipantData {
    npm: string;
    program_studi: string;
    fakultas: string;
    profiles: { full_name: string } | null;
  }
  interface SubmissionRow {
    id: string;
    judul_karya: string;
    sub_tema: string;
    file_url: string | null;
    participants: ParticipantData | null;
    scores: ScoreEntry[];
  }

  const ranked = ((submissions as unknown as SubmissionRow[]) || [])
    .map((sub, idx) => {
      const scores = sub.scores || [];
      const avgTotal = scores.length
        ? scores.reduce((a, s) => a + Number(s.total_skor), 0) / scores.length
        : null;
      const avgTema = scores.length ? scores.reduce((a, s) => a + Number(s.skor_tema), 0) / scores.length : null;
      const avgOri = scores.length ? scores.reduce((a, s) => a + Number(s.skor_orisinalitas), 0) / scores.length : null;
      const avgDesain = scores.length ? scores.reduce((a, s) => a + Number(s.skor_desain), 0) / scores.length : null;
      const avgPesan = scores.length ? scores.reduce((a, s) => a + Number(s.skor_pesan), 0) / scores.length : null;
      return { ...sub, avgTotal, avgTema, avgOri, avgDesain, avgPesan, juriCount: scores.length, code: idx + 1 };
    })
    .sort((a, b) => {
      if (a.avgTotal === null && b.avgTotal === null) return 0;
      if (a.avgTotal === null) return 1;
      if (b.avgTotal === null) return -1;
      return b.avgTotal - a.avgTotal;
    });

  const totalJuri = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "juri");
  const juriCount = totalJuri.count ?? 0;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-green-400/50">{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-sm text-green-400/60 mt-1">
          Ranking berdasarkan rata-rata skor dari {juriCount} juri · {ranked.length} karya
        </p>
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[ranked[1], ranked[0], ranked[2]].map((sub, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-28", "h-36", "h-24"];
            const colors = [
              "from-gray-600/20 to-gray-700/20 border-gray-500/30",
              "from-yellow-700/20 to-yellow-800/20 border-yellow-600/40",
              "from-amber-800/20 to-amber-900/20 border-amber-700/30",
            ];
            const part = sub.participants as ParticipantData | null;
            const prof = part?.profiles;
            return (
              <div key={sub.id} className={`glass rounded-2xl p-4 text-center bg-gradient-to-b border ${colors[podiumIdx]}`}>
                <div className="flex justify-center mb-2">{rankIcon(rank)}</div>
                <div className={`flex items-end justify-center ${heights[podiumIdx]}`}>
                  <div>
                    {sub.file_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.file_url} alt="poster" className="w-16 h-16 object-cover rounded-xl mx-auto mb-2 border border-white/10" />
                    ) : (
                      <div className="w-16 h-16 bg-dark-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <ImageIcon size={20} className="text-green-600/30" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-white truncate max-w-[120px] mx-auto">{prof?.full_name || "—"}</p>
                    <p className="text-2xl font-black text-green-400 mt-1">
                      {sub.avgTotal !== null ? sub.avgTotal.toFixed(2) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/8 flex items-center gap-2">
          <Star size={16} className="text-green-400" />
          <h2 className="text-base font-bold text-white">Peringkat Lengkap</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs font-semibold text-green-400/60 uppercase tracking-wider">
                <th className="text-center px-4 py-3 w-12">Rank</th>
                <th className="text-left px-4 py-3">Nama & Karya</th>
                <th className="text-center px-4 py-3">Tema</th>
                <th className="text-center px-4 py-3">Orisinalitas</th>
                <th className="text-center px-4 py-3">Desain</th>
                <th className="text-center px-4 py-3">Pesan</th>
                <th className="text-center px-4 py-3">Juri</th>
                <th className="text-center px-4 py-3 text-green-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-green-400/40">
                    Belum ada penilaian yang masuk
                  </td>
                </tr>
              ) : (
                ranked.map((sub, i) => {
                  const rank = i + 1;
                  const part = sub.participants as ParticipantData | null;
                  const prof = part?.profiles;
                  return (
                    <tr key={sub.id} className={`border-b border-white/5 transition-colors ${rank <= 3 ? "bg-white/2" : "hover:bg-white/2"}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">{rankIcon(rank)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{prof?.full_name || "—"}</p>
                        <p className="text-xs text-green-400/50 mt-0.5 truncate max-w-[200px]">{sub.judul_karya}</p>
                        <div className="mt-1">
                          <Badge variant="gray" size="sm">{part?.program_studi}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-blue-400">
                        {sub.avgTema !== null ? sub.avgTema.toFixed(1) : <span className="text-green-400/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-purple-400">
                        {sub.avgOri !== null ? sub.avgOri.toFixed(1) : <span className="text-green-400/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-green-400">
                        {sub.avgDesain !== null ? sub.avgDesain.toFixed(1) : <span className="text-green-400/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-orange-400">
                        {sub.avgPesan !== null ? sub.avgPesan.toFixed(1) : <span className="text-green-400/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={sub.juriCount === juriCount ? "green" : "yellow"} size="sm">
                          {sub.juriCount}/{juriCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-black ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-green-400"}`}>
                          {sub.avgTotal !== null ? sub.avgTotal.toFixed(2) : <span className="text-green-400/30 text-sm">Belum dinilai</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
