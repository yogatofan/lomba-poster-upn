import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { LeaderboardClient } from "./LeaderboardClient";

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

      <LeaderboardClient ranked={ranked as any} juriCount={juriCount ?? 0} />
    </div>
  );
}

