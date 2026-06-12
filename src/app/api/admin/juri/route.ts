import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const { fullName, email, password } = await request.json();
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    const serviceClient = await createServiceClient();
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "juri" },
    });

    if (createError) {
      if (createError.message.includes("already registered")) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: newUser.user?.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const juriId = request.nextUrl.searchParams.get("id");
    if (!juriId) return NextResponse.json({ error: "ID juri diperlukan." }, { status: 400 });

    // Verify it's actually a juri
    const { data: juriProfile } = await supabase.from("profiles").select("role").eq("id", juriId).single();
    if (juriProfile?.role !== "juri") {
      return NextResponse.json({ error: "Pengguna ini bukan juri." }, { status: 400 });
    }

    const serviceClient = await createServiceClient();
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(juriId);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
