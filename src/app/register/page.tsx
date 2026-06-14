"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    if (!form.password) newErrors.password = "Password wajib diisi";
    if (form.password.length < 8) newErrors.password = "Password minimal 8 karakter";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Password tidak cocok";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            full_name: form.fullName,
            role: "peserta",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Email ini sudah terdaftar. Silakan login.");
        } else if (authError.message.toLowerCase().includes("rate limit")) {
          setError("Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/peserta/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return strength;
  };

  const strength = passwordStrength();
  const strengthLabel =
    strength === null ? "" : strength <= 1 ? "Lemah" : strength <= 2 ? "Sedang" : strength <= 3 ? "Kuat" : "Sangat Kuat";
  const strengthColor =
    strength === null ? "" : strength <= 1 ? "bg-upn-red-600" : strength <= 2 ? "bg-yellow-500" : strength <= 3 ? "bg-upn-green-600" : "bg-upn-green-500";

  return (
    <div className="min-h-screen bg-canvas-parchment flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md animate-fade-in-scale">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted-48 hover:text-ink mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Kembali ke beranda
        </Link>

        <div className="bg-white border border-hairline rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-14 h-14 mb-4">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-black text-ink">Daftar Akun</h1>
            <p className="text-sm text-ink-muted-48 mt-1">Lomba Poster</p>
            <p className="text-sm text-upn-green-700 font-medium mt-0.5">
              Dies Natalis ke-67 — UPN "Veteran" Jawa Timur
            </p>
          </div>

          {/* Disclaimer */}
          <div className="card-info flex items-start gap-2 mb-5">
            <Shield className="w-4 h-4 text-upn-green-700 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-muted-80 leading-relaxed">
              <strong>Perhatian:</strong> Karya poster harus bersifat edukatif dan tidak mengandung
              konten grafis/eksploitatif. Pendaftaran terbuka untuk mahasiswa aktif UPN "Veteran"
              Jawa Timur.
            </p>
          </div>

          {error && (
            <div className="card-alert mb-5">
              <p className="text-sm text-upn-red-700">⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="input-full-name"
              label="Nama Lengkap"
              type="text"
              placeholder="Nama sesuai KTP/KTM"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={errors.fullName}
              required
            />

            <Input
              id="input-email-reg"
              label="Alamat Email"
              type="email"
              placeholder="email@upnjatim.ac.id"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-password-reg" className="text-sm font-semibold text-ink-muted-80">
                Password
              </label>
              <div className="relative">
                <input
                  id="input-password-reg"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted-48 hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-upn-red-700">⚠ {errors.password}</p>}
              {strength !== null && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= (strength ?? 0) ? strengthColor : "bg-hairline"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted-48">Kekuatan: {strengthLabel}</p>
                </div>
              )}
            </div>

            <Input
              id="input-confirm-password"
              label="Konfirmasi Password"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />

            <Button
              id="btn-register-submit"
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-muted-48">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-upn-green-700 hover:text-upn-green-800 font-semibold">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
