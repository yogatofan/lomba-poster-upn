"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import {
  Settings as SettingsIcon,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState({
    id: "",
    pendaftaran_dibuka: true,
    penilaian_dibuka: false,
  });

  async function loadSettings() {
    const { data } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (data) {
      setSettings({
        id: data.id,
        pendaftaran_dibuka: data.pendaftaran_dibuka,
        penilaian_dibuka: data.penilaian_dibuka,
      });
    }
    setLoading(false);
  }

  useEffect(() => { loadSettings(); }, []);

  async function handleSave() {
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const { error: e } = await supabase
        .from("settings")
        .update({
          pendaftaran_dibuka: settings.pendaftaran_dibuka,
          penilaian_dibuka: settings.penilaian_dibuka,
          updated_at: new Date().toISOString()
        })
        .eq("id", settings.id);

      if (e) throw e;
      setSuccess("Pengaturan berhasil disimpan.");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pengaturan.");
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

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-ink flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-upn-green-700" />
          Pengaturan Lomba
        </h1>
        <p className="text-sm text-ink-muted-48 mt-1">
          Atur periode pendaftaran dan penilaian poster
        </p>
      </div>

      {error && (
        <div className="glass-red rounded-xl p-3 flex items-start gap-2 border border-upn-red-700/20">
          <AlertCircle size={14} className="text-upn-red-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-red-800 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="glass-green rounded-xl p-3 flex items-start gap-2 border border-upn-green-600/20">
          <CheckCircle2 size={14} className="text-upn-green-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-green-800 font-medium">{success}</p>
        </div>
      )}

      <div className="card space-y-6">
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-hairline bg-canvas-parchment">
          <div>
            <h3 className="text-base font-bold text-ink mb-1">Periode Pendaftaran</h3>
            <p className="text-xs text-ink-muted-48 mb-2">
              Jika ditutup, peserta tidak dapat mendaftar atau mengupload karya baru.
            </p>
            {settings.pendaftaran_dibuka ? (
              <Badge variant="green" size="sm">Pendaftaran Dibuka</Badge>
            ) : (
              <Badge variant="red" size="sm">Pendaftaran Ditutup</Badge>
            )}
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, pendaftaran_dibuka: !s.pendaftaran_dibuka }))}
            className={`transition-colors duration-200 cursor-pointer ${settings.pendaftaran_dibuka ? "text-upn-green-700 hover:text-upn-green-800" : "text-zinc-300 hover:text-zinc-400"}`}
          >
            {settings.pendaftaran_dibuka ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-hairline bg-canvas-parchment">
          <div>
            <h3 className="text-base font-bold text-ink mb-1">Periode Penilaian</h3>
            <p className="text-xs text-ink-muted-48 mb-2">
              Buka akses bagi juri untuk mulai menilai karya peserta.
            </p>
            {settings.penilaian_dibuka ? (
              <Badge variant="blue" size="sm">Penilaian Dibuka</Badge>
            ) : (
              <Badge variant="gray" size="sm">Penilaian Ditutup</Badge>
            )}
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, penilaian_dibuka: !s.penilaian_dibuka }))}
            className={`transition-colors duration-200 cursor-pointer ${settings.penilaian_dibuka ? "text-blue-700 hover:text-blue-800" : "text-zinc-300 hover:text-zinc-400"}`}
          >
            {settings.penilaian_dibuka ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <div className="pt-4 border-t border-hairline">
          <Button onClick={handleSave} loading={saving} size="lg">
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </div>
  );
}
