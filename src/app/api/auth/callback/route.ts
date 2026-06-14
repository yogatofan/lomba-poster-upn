import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const role = profile?.role || "peserta";
      return NextResponse.redirect(`${requestUrl.origin}/${role}/dashboard?message=confirmed`);
    }
  }

  // Fallback to login if something goes wrong
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
