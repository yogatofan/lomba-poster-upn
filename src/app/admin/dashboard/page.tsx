import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import {
  Users,
  FileImage,
  Star,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

const SUB_TEMA_SHORT: Record<string, string> = {
  "Kenali, Cegah, dan Lawan Kekerasan Seksual": "Kenali & Lawan KS",
  "Berani Bicara, Berani Melapor": "Berani Bicara",
  "Stop Normalisasi Pelecehan Seksual": "Stop Normalisasi",
  "Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital": "Bijak Medsos",
  "Teman Peduli, Kampus Terlindungi": "Teman Peduli",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .single();

  const { count: totalPeserta } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true });

  const { count: totalSubmitted } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  const serviceClient = await createServiceClient();
  const { count: totalJuri } = await serviceClient
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "juri");

  const { count: totalScores } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  // Distribusi per sub-tema
  const { data: submissions } = await supabase
    .from("submissions")
    .select("sub_tema")
    .eq("status", "submitted");

  const byTema: Record<string, number> = {};
  submissions?.forEach((s) => {
    const key = SUB_TEMA_SHORT[s.sub_tema] || s.sub_tema;
    byTema[key] = (byTema[key] || 0) + 1;
  });

  const maxTema = Math.max(...Object.values(byTema), 1);

  const { data: recentParticipants } = await serviceClient
    .from("participants")
    .select("npm, program_studi, profiles(full_name), created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted-48 mt-1">Monitor lomba poster secara real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {settings?.pendaftaran_dibuka ? (
            <Badge variant="green" size="md">
              <ToggleRight size={14} /> Pendaftaran Dibuka
            </Badge>
          ) : (
            <Badge variant="red" size="md">
              <ToggleLeft size={14} /> Pendaftaran Ditutup
            </Badge>
          )}
          {settings?.penilaian_dibuka ? (
            <Badge variant="blue" size="md">
              <Star size={12} /> Penilaian Dibuka
            </Badge>
          ) : (
            <Badge variant="gray" size="md">
              <Clock size={12} /> Penilaian Ditutup
            </Badge>
          )}
        </div>
      </div>

      {/* Welcome Message after Email Confirmation */}
      {message === "confirmed" && (
        <div className="bg-upn-green-100 border border-upn-green-400/40 rounded-[18px] p-4 flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-upn-green-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-upn-green-800 tracking-tight uppercase">Email Berhasil Dikonfirmasi!</p>
            <p className="text-xs text-upn-green-700 font-medium mt-0.5">
              Selamat datang kembali, Admin. Email Anda telah berhasil diverifikasi.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Peserta"
          value={totalPeserta ?? 0}
          icon={<Users size={20} />}
          color="green"
        />
        <StatCard
          label="Karya Terkirim"
          value={totalSubmitted ?? 0}
          icon={<FileImage size={20} />}
          color="blue"
        />
        <StatCard
          label="Juri Aktif"
          value={totalJuri ?? 0}
          icon={<Star size={20} />}
          color="yellow"
        />
        <StatCard
          label="Total Penilaian"
          value={totalScores ?? 0}
          icon={<BarChart3 size={20} />}
          color="green"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribusi Sub-Tema */}
        <div className="bg-white border border-hairline rounded-[18px] p-6">
          <h2 className="text-base font-bold text-ink mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-upn-green-700" />
            Karya per Sub-Tema
          </h2>
          {Object.keys(byTema).length === 0 ? (
            <p className="text-sm text-ink-muted-48 text-center py-6">Belum ada karya masuk</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byTema)
                .sort(([, a], [, b]) => b - a)
                .map(([tema, count]) => (
                  <div key={tema}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-ink-muted-80 font-medium">{tema}</span>
                      <span className="text-xs font-bold text-upn-green-700">{count}</span>
                    </div>
                    <div className="h-2 bg-canvas-parchment rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-green rounded-full transition-all duration-700"
                        style={{ width: `${(count / maxTema) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="bg-white border border-hairline rounded-[18px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Users size={16} className="text-upn-green-700" />
              Pendaftar Terbaru
            </h2>
            <Link href="/admin/peserta" className="text-xs text-upn-green-700 hover:text-upn-green-800 font-medium transition-colors">
              Lihat semua →
            </Link>
          </div>
          {!recentParticipants?.length ? (
            <p className="text-sm text-ink-muted-48 text-center py-6">Belum ada pendaftar</p>
          ) : (
            <div className="space-y-2">
              {recentParticipants.map((p, i) => {
                const prof = p.profiles as unknown as { full_name: string } | null;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-canvas-parchment hover:bg-upn-green-50 transition-colors">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {prof?.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{prof?.full_name || "—"}</p>
                      <p className="text-xs text-ink-muted-48 truncate">{p.program_studi} · {p.npm}</p>
                    </div>
                    <p className="text-xs text-ink-muted-48 shrink-0">
                      {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-hairline rounded-[18px] p-5">
        <h2 className="text-xs font-bold text-ink-muted-48 uppercase tracking-wider mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/peserta", label: "Export Peserta", icon: <Users size={16} /> },
            { href: "/admin/juri", label: "Kelola Juri", icon: <Star size={16} /> },
            { href: "/admin/leaderboard", label: "Leaderboard", icon: <BarChart3 size={16} /> },
            { href: "/admin/settings", label: "Pengaturan", icon: <ToggleRight size={16} /> },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-canvas-parchment border border-hairline rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-upn-green-400/60 hover:bg-upn-green-50 transition-all group"
            >
              <span className="text-upn-green-700 group-hover:text-upn-green-800 transition-colors">{action.icon}</span>
              <span className="text-xs font-semibold text-ink-muted-80">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
