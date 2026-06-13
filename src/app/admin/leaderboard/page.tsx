import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Card";
import { Trophy, Medal, Star, ImageIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard Admin" };

export default async function AdminLeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = await createServiceClient();

  // Get all submitted submissions with participant info and scores
  const { data: submissions } = await serviceClient
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

  const { count: juriCount } = await serviceClient
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "juri");

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-ink-muted-48">{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-ink flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-ink-muted-48 mt-1">
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
              "bg-slate-50 border-slate-200 text-slate-900",
              "bg-yellow-50/50 border-yellow-300 text-yellow-900 shadow-sm",
              "bg-amber-50/50 border-amber-200 text-amber-900",
            ];
            const part = sub.participants as ParticipantData | null;
            const prof = part?.profiles;
            return (
              <div key={sub.id} className={`card p-4 text-center border flex flex-col justify-between ${colors[podiumIdx]}`}>
                <div className="flex justify-center mb-2">{rankIcon(rank)}</div>
                <div className={`flex items-end justify-center ${heights[podiumIdx]}`}>
                  <div className="w-full">
                    {sub.file_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.file_url} alt="poster" className="w-16 h-16 object-cover rounded-xl mx-auto mb-2 border border-hairline" />
                    ) : (
                      <div className="w-16 h-16 bg-canvas-parchment rounded-xl flex items-center justify-center mx-auto mb-2 border border-hairline">
                        <ImageIcon size={20} className="text-ink-muted-48/30" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-ink truncate max-w-[120px] mx-auto">{prof?.full_name || "—"}</p>
                    <p className="text-2xl font-black text-upn-green-700 mt-1">
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
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-hairline bg-canvas-parchment flex items-center gap-2">
          <Star size={16} className="text-upn-green-700" />
          <h2 className="text-base font-bold text-ink">Peringkat Lengkap</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs font-semibold text-ink-muted-80 uppercase tracking-wider bg-canvas-parchment/50">
                <th className="text-center px-4 py-3 w-12">Rank</th>
                <th className="text-left px-4 py-3">Nama & Karya</th>
                <th className="text-center px-4 py-3">Tema</th>
                <th className="text-center px-4 py-3">Orisinalitas</th>
                <th className="text-center px-4 py-3">Desain</th>
                <th className="text-center px-4 py-3">Pesan</th>
                <th className="text-center px-4 py-3">Juri</th>
                <th className="text-center px-4 py-3 text-upn-green-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-ink-muted-48">
                    Belum ada penilaian yang masuk
                  </td>
                </tr>
              ) : (
                ranked.map((sub, i) => {
                  const rank = i + 1;
                  const part = sub.participants as ParticipantData | null;
                  const prof = part?.profiles;
                  return (
                    <tr key={sub.id} className={`border-b border-divider-soft transition-colors ${rank <= 3 ? "bg-canvas-parchment/40" : "hover:bg-canvas-parchment"}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">{rankIcon(rank)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{prof?.full_name || "—"}</p>
                        <p className="text-xs text-ink-muted-48 mt-0.5 truncate max-w-[200px]">{sub.judul_karya}</p>
                        <div className="mt-1">
                          <Badge variant="gray" size="sm">{part?.program_studi}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-blue-700 font-semibold">
                        {sub.avgTema !== null ? sub.avgTema.toFixed(1) : <span className="text-ink-muted-48/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-purple-700 font-semibold">
                        {sub.avgOri !== null ? sub.avgOri.toFixed(1) : <span className="text-ink-muted-48/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-upn-green-700 font-semibold">
                        {sub.avgDesain !== null ? sub.avgDesain.toFixed(1) : <span className="text-ink-muted-48/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-orange-700 font-semibold">
                        {sub.avgPesan !== null ? sub.avgPesan.toFixed(1) : <span className="text-ink-muted-48/30">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={sub.juriCount === juriCount ? "green" : "yellow"} size="sm">
                          {sub.juriCount}/{juriCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-black ${rank === 1 ? "text-yellow-600" : rank === 2 ? "text-slate-500" : rank === 3 ? "text-amber-700" : "text-upn-green-700"}`}>
                          {sub.avgTotal !== null ? sub.avgTotal.toFixed(2) : <span className="text-ink-muted-48/30 text-sm">Belum dinilai</span>}
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
