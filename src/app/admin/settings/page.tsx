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
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-green-400" />
          Pengaturan Lomba
        </h1>
        <p className="text-sm text-green-400/60 mt-1">
          Atur periode pendaftaran dan penilaian poster
        </p>
      </div>

      {error && (
        <div className="glass-red rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="glass-green rounded-xl p-3 flex items-start gap-2">
          <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Periode Pendaftaran</h3>
            <p className="text-xs text-green-400/60 mb-2">
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
            className={`transition-colors duration-200 ${settings.pendaftaran_dibuka ? "text-green-400 hover:text-green-300" : "text-green-400/30 hover:text-green-400/50"}`}
          >
            {settings.pendaftaran_dibuka ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Periode Penilaian</h3>
            <p className="text-xs text-green-400/60 mb-2">
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
            className={`transition-colors duration-200 ${settings.penilaian_dibuka ? "text-blue-400 hover:text-blue-300" : "text-green-400/30 hover:text-green-400/50"}`}
          >
            {settings.penilaian_dibuka ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button onClick={handleSave} loading={saving} size="lg">
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </div>
  );
}
