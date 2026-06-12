/**
 * SEED SCRIPT — Lomba Poster UPN "Veteran" Jawa Timur
 *
 * Cara menjalankan:
 * 1. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local
 * 2. npx tsx scripts/seed.ts
 *
 * Script ini akan membuat:
 * - 1 akun admin (admin@upnvjatim.ac.id / Admin@1234)
 * - Default settings (pendaftaran dibuka, penilaian ditutup)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("🌱 Memulai proses seed database...\n");

  // =========================================================
  // 1. Buat akun Admin
  // =========================================================
  console.log("👤 Membuat akun admin...");

  const adminEmail = "admin@upnvjatim.ac.id";
  const adminPassword = "Admin@1234";

  // Cek apakah admin sudah ada
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminExists = existingUsers?.users?.find((u) => u.email === adminEmail);

  if (adminExists) {
    console.log(`   ⚠️  Admin sudah ada (${adminEmail}), melewati pembuatan akun.`);
    
    // Pastikan profile admin juga ada di tabel profiles
    const { data: profile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", adminExists.id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Gagal memeriksa profile admin:", checkError.message);
    } else if (!profile) {
      console.log("   🛠️  Profile admin tidak ditemukan di database. Membuat profile admin...");
      const { error: profileError } = await supabase.from("profiles").insert({
        id: adminExists.id,
        full_name: adminExists.user_metadata?.full_name || "Administrator UPN",
        role: "admin",
      });

      if (profileError) {
        console.error("❌ Gagal membuat profile admin:", profileError.message);
      } else {
        console.log("   ✅ Profile admin berhasil disinkronisasi ke tabel profiles.\n");
      }
    } else {
      console.log("   ✅ Profile admin sudah sinkron di tabel profiles.\n");
    }
  } else {
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Administrator UPN",
        role: "admin",
      },
    });

    if (adminError) {
      console.error("❌ Gagal membuat akun admin:", adminError.message);
      process.exit(1);
    }

    console.log(`   ✅ Admin berhasil dibuat: ${adminEmail}`);
    console.log(`   📧 Email    : ${adminEmail}`);
    console.log(`   🔑 Password : ${adminPassword}`);
    console.log(`   ⚠️  SEGERA GANTI PASSWORD setelah login pertama!\n`);
  }

  // =========================================================
  // 2. Pastikan settings default ada
  // =========================================================
  console.log("⚙️  Memverifikasi settings default...");

  const { data: existingSettings } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .single();

  if (existingSettings) {
    console.log("   ✅ Settings sudah ada, melewati pembuatan.\n");
  } else {
    const { error: settingsError } = await supabase.from("settings").insert({
      pendaftaran_dibuka: true,
      penilaian_dibuka: false,
    });

    if (settingsError) {
      console.error("❌ Gagal membuat settings:", settingsError.message);
    } else {
      console.log("   ✅ Settings default berhasil dibuat.\n");
    }
  }

  // =========================================================
  // Ringkasan
  // =========================================================
  console.log("════════════════════════════════════════");
  console.log("✅ SEED SELESAI!");
  console.log("════════════════════════════════════════");
  console.log("\n📋 Informasi Login Admin:");
  console.log(`   Email    : ${adminEmail}`);
  console.log(`   Password : ${adminPassword}`);
  console.log("\n⚠️  PENTING: Ganti password admin setelah login pertama!");
  console.log("\n📝 Langkah selanjutnya:");
  console.log("   1. Jalankan supabase/schema.sql di Supabase SQL Editor");
  console.log("   2. Isi semua credential di .env.local");
  console.log("   3. Jalankan: npm run dev");
  console.log("   4. Login sebagai admin dan atur periode lomba");
}

seed().catch((error) => {
  console.error("❌ Seed gagal:", error);
  process.exit(1);
});
