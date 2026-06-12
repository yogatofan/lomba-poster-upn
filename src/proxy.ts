import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes - tidak perlu auth
  const publicRoutes = ["/", "/login", "/register"];
  const isPublic = publicRoutes.some((r) => pathname === r);

  // Jika belum login dan akses halaman protected
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Jika sudah login, ambil role dari metadata atau database
  if (user) {
    // Redirect dari auth pages ke dashboard
    if (pathname === "/login" || pathname === "/register") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "peserta";
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }

    // Proteksi berdasarkan role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "peserta";

    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/juri") && role !== "juri" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/peserta") && role !== "peserta" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
