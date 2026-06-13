"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Card";
import { Trophy, Medal, Star, ImageIcon, X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  avgTotal: number | null;
  avgTema: number | null;
  avgOri: number | null;
  avgDesain: number | null;
  avgPesan: number | null;
  juriCount: number;
  code: number;
}

interface LeaderboardClientProps {
  ranked: SubmissionRow[];
  juriCount: number;
}

export function LeaderboardClient({ ranked, juriCount }: LeaderboardClientProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-ink-muted-48">{rank}</span>;
  };

  const closeModal = () => setSelectedSubmission(null);

  return (
    <>
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
            const part = sub.participants;
            const prof = part?.profiles;
            return (
              <div 
                key={sub.id} 
                className={`card p-4 text-center border flex flex-col justify-between cursor-pointer hover:shadow-md transition-all ${colors[podiumIdx]}`}
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="flex justify-center mb-2">{rankIcon(rank)}</div>
                <div className={`flex items-end justify-center ${heights[podiumIdx]}`}>
                  <div className="w-full">
                    {sub.file_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.file_url} alt="poster" className="w-16 h-16 object-cover rounded-xl mx-auto mb-2 border border-hairline shadow-sm" />
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
                  const part = sub.participants;
                  const prof = part?.profiles;
                  return (
                    <tr 
                      key={sub.id} 
                      className={`border-b border-divider-soft transition-colors cursor-pointer ${rank <= 3 ? "bg-canvas-parchment/40" : "hover:bg-canvas-parchment"}`}
                      onClick={() => setSelectedSubmission(sub)}
                    >
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

      {/* Poster Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] animate-fade-in">
          <div className="relative bg-white w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-2xl border border-hairline">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-black text-ink uppercase tracking-tight leading-none">Detail Karya</h3>
                <p className="text-xs text-ink-muted-48 mt-1 font-medium">{selectedSubmission.judul_karya}</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50 flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex items-center justify-center">
                {selectedSubmission.file_url ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedSubmission.file_url} 
                      alt="Poster Pemenang" 
                      className="max-w-full max-h-[60vh] shadow-lg rounded-lg border border-white"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <a 
                        href={selectedSubmission.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="opacity-0 group-hover:opacity-100 bg-white text-ink p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-slate-200 rounded-lg flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-400" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-ink-muted-48 mb-2">Informasi Peserta</h4>
                  <div className="p-4 bg-white border border-hairline rounded-xl space-y-3">
                    <div>
                      <p className="text-xs text-ink-muted-48">Nama Lengkap</p>
                      <p className="font-bold text-ink">{selectedSubmission.participants?.profiles?.full_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted-48">Program Studi</p>
                      <p className="text-sm font-semibold text-ink">{selectedSubmission.participants?.program_studi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted-48">NPM</p>
                      <p className="text-sm font-semibold text-ink">{selectedSubmission.participants?.npm}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-ink-muted-48 mb-2">Statistik Nilai</h4>
                  <div className="p-4 bg-white border border-hairline rounded-xl space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-xs text-ink-muted-48">Rata-rata Total</p>
                      <p className="text-3xl font-black text-upn-green-700 leading-none">
                        {selectedSubmission.avgTotal?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                        <span className="text-ink-muted-48">Tema</span>
                        <span className="text-blue-700">{selectedSubmission.avgTema?.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                        <span className="text-ink-muted-48">Orisinalitas</span>
                        <span className="text-purple-700">{selectedSubmission.avgOri?.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                        <span className="text-ink-muted-48">Desain</span>
                        <span className="text-upn-green-700">{selectedSubmission.avgDesain?.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                        <span className="text-ink-muted-48">Pesan</span>
                        <span className="text-orange-700">{selectedSubmission.avgPesan?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <a 
                    href={selectedSubmission.file_url || "#"} 
                    target="_blank" 
                    rel="noreferrer"
                    download={`poster-${selectedSubmission.participants?.profiles?.full_name || 'karya'}.jpg`}
                    className="w-full flex items-center justify-center gap-2 bg-upn-green-700 hover:bg-upn-green-800 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    <Download size={18} />
                    Unduh File Poster
                  </a>
                  <p className="text-[10px] text-center text-ink-muted-48 mt-3 font-medium px-4">
                    File ini akan diunduh dalam kualitas asli untuk keperluan cetak pameran.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
