"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const message = searchParams.get("message");
  const successMessage = 
    message === "registered" ? "Registrasi sukses! Silakan cek email Anda untuk konfirmasi pendaftaran." :
    message === "confirmed" ? "Email berhasil dikonfirmasi. Silakan login untuk memulai." :
    null;

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
    <div className="bg-white border border-hairline rounded-3xl p-8 shadow-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-14 h-14 mb-4">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <h1 className="text-2xl font-black text-ink">Masuk Akun</h1>
        <p className="text-sm text-ink-muted-48 mt-1 text-center">
          Lomba Poster Dies Natalis ke-67 — UPN "Veteran" Jawa Timur
        </p>
      </div>

      {successMessage && (
        <div className="bg-upn-green-100 border border-upn-green-400/40 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-upn-green-700 shrink-0 mt-0.5" />
          <p className="text-sm text-upn-green-800 font-medium leading-relaxed">
            {successMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="card-alert flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-upn-red-700 shrink-0" />
          <p className="text-sm text-upn-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="input-email"
          label="Alamat Email"
          type="email"
          placeholder="email@upnjatim.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="input-password" className="text-sm font-semibold text-ink-muted-80">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted-48 hover:text-ink transition-colors"
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
        <p className="text-sm text-ink-muted-48">
          Belum punya akun?{" "}
          <Link href="/register" className="text-upn-green-700 hover:text-upn-green-800 font-semibold">
            Daftar sebagai peserta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-scale">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted-48 hover:text-ink mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Kembali ke beranda
        </Link>

        <Suspense fallback={<div className="bg-white border border-hairline rounded-3xl p-8 h-[400px] flex items-center justify-center">Memuat...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-ink-muted-48 mt-6">
          Akun juri & admin dibuat oleh panitia.
          <br />
          Hubungi panitia jika mengalami kendala.
        </p>
      </div>
    </div>
  );
}
