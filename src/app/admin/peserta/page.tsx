"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import {
  Users,
  Download,
  Search,
  CheckCircle2,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Participant {
  id: string;
  npm: string;
  program_studi: string;
  fakultas: string;
  no_hp: string;
  created_at: string;
  profiles: { full_name: string } | null;
  submissions: {
    judul_karya: string;
    sub_tema: string;
    status: string;
    submitted_at: string | null;
    file_url: string | null;
  } | null;
}

export default function AdminPesertaPage() {
  const supabase = createClient();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFakultas, setFilterFakultas] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "npm" | "fakultas">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/peserta");
        const { data } = await res.json();
        setParticipants((data as unknown as Participant[]) || []);
      } catch (err) {
        console.error(err);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = participants
    .filter((p) => {
      const name = p.profiles?.full_name?.toLowerCase() || "";
      const q = search.toLowerCase();
      if (q && !name.includes(q) && !p.npm.includes(q) && !p.program_studi.toLowerCase().includes(q)) return false;
      if (filterFakultas && p.fakultas !== filterFakultas) return false;
      const sub = Array.isArray(p.submissions) ? p.submissions[0] : p.submissions;
      if (filterStatus === "submitted" && sub?.status !== "submitted") return false;
      if (filterStatus === "draft" && sub?.status !== "draft") return false;
      if (filterStatus === "no_poster" && sub?.file_url) return false;
      return true;
    })
    .sort((a, b) => {
      let va = "", vb = "";
      if (sortField === "created_at") { va = a.created_at; vb = b.created_at; }
      if (sortField === "npm") { va = a.npm; vb = b.npm; }
      if (sortField === "fakultas") { va = a.fakultas; vb = b.fakultas; }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const uniqueFakultas = [...new Set(participants.map((p) => p.fakultas))].sort();

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <ChevronUp size={12} className="text-green-600/30" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-green-400" />
      : <ChevronDown size={12} className="text-green-400" />;
  }

  function exportCSV() {
    const headers = ["Nama", "NPM", "Program Studi", "Fakultas", "No HP", "Sub-Tema", "Judul Karya", "Status", "Waktu Daftar"];
    const rows = filtered.map((p) => {
      const sub = Array.isArray(p.submissions) ? p.submissions[0] : p.submissions;
      return [
        p.profiles?.full_name || "",
        p.npm,
        p.program_studi,
        p.fakultas,
        p.no_hp,
        sub?.sub_tema || "",
        sub?.judul_karya || "",
        sub?.status || "",
        new Date(p.created_at).toLocaleString("id-ID"),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peserta-lomba-poster-upn-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            Data Peserta
          </h1>
          <p className="text-sm text-green-400/60 mt-1">
            {participants.length} peserta terdaftar · {filtered.length} ditampilkan
          </p>
        </div>
        <Button
          id="btn-export-csv"
          onClick={exportCSV}
          variant="outline"
          className="shrink-0"
        >
          <Download size={15} />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400/40" />
          <input
            id="search-peserta"
            type="text"
            placeholder="Cari nama, NPM, prodi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-8 py-2 text-sm"
          />
        </div>
        <select
          id="filter-fakultas"
          value={filterFakultas}
          onChange={(e) => setFilterFakultas(e.target.value)}
          className="input-field py-2 text-sm w-auto"
          style={{ colorScheme: "dark" }}
        >
          <option value="">Semua Fakultas</option>
          {uniqueFakultas.map((f) => <option key={f} value={f} className="bg-dark-800">{f}</option>)}
        </select>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field py-2 text-sm w-auto"
          style={{ colorScheme: "dark" }}
        >
          <option value="">Semua Status</option>
          <option value="submitted" className="bg-dark-800">Terkirim</option>
          <option value="draft" className="bg-dark-800">Draft</option>
          <option value="no_poster" className="bg-dark-800">Belum Upload</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider">No</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider cursor-pointer hover:text-green-400 transition-colors"
                  onClick={() => handleSort("npm")}
                >
                  <div className="flex items-center gap-1">NPM <SortIcon field="npm" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider">Nama</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider cursor-pointer hover:text-green-400 transition-colors"
                  onClick={() => handleSort("fakultas")}
                >
                  <div className="flex items-center gap-1">Fakultas <SortIcon field="fakultas" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider">Sub-Tema</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider">Status</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-green-400/60 uppercase tracking-wider cursor-pointer hover:text-green-400 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">Waktu Daftar <SortIcon field="created_at" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="shimmer h-4 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-green-400/40">
                    Tidak ada peserta yang sesuai filter
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const sub = Array.isArray(p.submissions) ? p.submissions[0] : p.submissions;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-green-400/50 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-green-300">{p.npm}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{p.profiles?.full_name || "—"}</p>
                        <p className="text-xs text-green-400/50">{p.program_studi}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-green-300/70">{p.fakultas}</td>
                      <td className="px-4 py-3 text-xs text-green-300/70 max-w-[160px]">
                        <p className="truncate">{sub?.sub_tema || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        {sub?.status === "submitted" ? (
                          <Badge variant="green"><CheckCircle2 size={10} /> Terkirim</Badge>
                        ) : sub?.status === "draft" ? (
                          <Badge variant="yellow"><Clock size={10} /> Draft</Badge>
                        ) : (
                          <Badge variant="gray">Belum Upload</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-green-400/50">
                        {new Date(p.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
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
