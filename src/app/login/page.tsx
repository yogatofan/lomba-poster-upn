"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setError("Email Anda belum dikonfirmasi. Silakan cek kotak masuk email Anda.");
        } else if (authError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Email atau password salah. Silakan coba lagi.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const role = profile?.role || "peserta";
        router.push(`/${role}/dashboard`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-upn-green-800/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-40 w-80 h-80 rounded-full bg-upn-red-800/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-green-400/70 hover:text-green-400 mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Kembali ke beranda
        </Link>

        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-lg shadow-xl shadow-upn-green-900/50 mb-4">
              UPN
            </div>
            <h1 className="text-2xl font-black text-white">Masuk ke Akun</h1>
            <p className="text-sm text-green-400/60 mt-1">
              Lomba Poster Dies Natalis UPN
            </p>
          </div>

          {error && (
            <div className="glass-red rounded-xl p-3 mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="input-email"
              label="Alamat Email"
              type="email"
              placeholder="email@upnvjatim.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-password" className="text-sm font-medium text-green-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              id="btn-login-submit"
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-green-400/50">
              Belum punya akun?{" "}
              <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold">
                Daftar sebagai peserta
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-green-400/30 mt-6">
          Akun juri & admin dibuat oleh panitia.
          <br />
          Hubungi panitia jika mengalami kendala.
        </p>
      </div>
    </div>
  );
}
