"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import {
  Gavel,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Juri {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function AdminJuriPage() {
  const supabase = createClient();
  const [juriList, setJuriList] = useState<Juri[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  async function loadJuri() {
    try {
      const res = await fetch("/api/admin/juri");
      const { data } = await res.json();
      setJuriList(data || []);
    } catch (err) {
      console.error(err);
      setJuriList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJuri(); }, []);

  function validateForm() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    if (!form.password) e.password = "Password wajib diisi";
    if (form.password.length < 8) e.password = "Password minimal 8 karakter";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAddJuri(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/juri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menambah juri."); return; }
      setSuccess(`Juri "${form.fullName}" berhasil ditambahkan.`);
      setForm({ fullName: "", email: "", password: "" });
      setShowForm(false);
      loadJuri();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteJuri(juriId: string, juriName: string) {
    if (!confirm(`Hapus akun juri "${juriName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(""); setSuccess("");
    setDeleting(juriId);
    try {
      const res = await fetch(`/api/admin/juri?id=${juriId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menghapus juri."); return; }
      setSuccess(`Juri "${juriName}" berhasil dihapus.`);
      loadJuri();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Gavel className="w-6 h-6 text-green-400" />
            Kelola Juri
          </h1>
          <p className="text-sm text-green-400/60 mt-1">
            {juriList.length} juri terdaftar — Akun dibuat manual oleh admin
          </p>
        </div>
        <Button
          id="btn-tambah-juri"
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
          variant={showForm ? "ghost" : "primary"}
        >
          <Plus size={15} />
          {showForm ? "Batal" : "Tambah Juri"}
        </Button>
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

      {/* Add Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 animate-fade-in-scale">
          <h2 className="text-base font-bold text-white mb-4">Tambah Akun Juri Baru</h2>
          <form onSubmit={handleAddJuri} className="space-y-4">
            <Input
              id="input-juri-name"
              label="Nama Lengkap Juri"
              placeholder="Dr. Ahmad Fauzi, M.Kom"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={formErrors.fullName}
            />
            <Input
              id="input-juri-email"
              label="Email"
              type="email"
              placeholder="juri@upnvjatim.ac.id"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={formErrors.email}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-juri-pass" className="text-sm font-medium text-green-300">
                Password Sementara
              </label>
              <div className="relative">
                <input
                  id="input-juri-pass"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formErrors.password && <p className="text-xs text-red-400">⚠ {formErrors.password}</p>}
              <p className="text-xs text-green-400/50">Sampaikan password ini kepada juri untuk login pertama kali.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button id="btn-submit-juri" type="submit" loading={saving}>
                Buat Akun Juri
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Juri List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <h2 className="text-base font-bold text-white">Daftar Juri</h2>
        </div>
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-16 rounded-xl" />
            ))}
          </div>
        ) : juriList.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="w-10 h-10 text-green-600/30 mx-auto mb-3" />
            <p className="text-sm text-green-400/50">Belum ada juri terdaftar</p>
            <p className="text-xs text-green-400/30 mt-1">Klik "Tambah Juri" untuk membuat akun juri baru</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {juriList.map((juri, i) => (
              <div key={juri.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {juri.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{juri.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="blue" size="sm">Juri #{i + 1}</Badge>
                    <span className="text-xs text-green-400/40">
                      Dibuat {new Date(juri.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <Button
                  id={`btn-delete-juri-${juri.id}`}
                  variant="danger"
                  size="sm"
                  loading={deleting === juri.id}
                  onClick={() => handleDeleteJuri(juri.id, juri.full_name)}
                >
                  <Trash2 size={13} />
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
