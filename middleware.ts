import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Public routes - auth gerektirmez
  const publicRoutes = ["/auth/login", "/auth/change-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Session'ı refresh et
  const { data: { user } } = await supabase.auth.getUser();

  // Login sayfasında kullanıcı varsa dashboard'a yönlendir
  if (pathname === "/auth/login" && user) {
    // Profile'ı al
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Profile hatası veya profile yoksa login sayfasında kal
    if (profileError || !profile) {
      return response;
    }

    // Admin veya yönetici ise admin dashboard'a yönlendir
    if (profile.role === "admin" || profile.role === "yonetici") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Auth gerektiren sayfalar (admin ve dashboard hariç)
  const authRequiredRoutes = ["/dashboard", "/admin", "/depo", "/musteri", "/is-emri"];
  const isAuthRequired = authRequiredRoutes.some((route) => pathname.startsWith(route));

  // Auth gerektiren sayfada kullanıcı yoksa login'e yönlendir
  if (isAuthRequired && !user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Admin sayfaları için admin kontrolü
  if (pathname.startsWith("/admin") && user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Profile hatası veya profile yoksa login'e yönlendir
    if (profileError || !profile) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Admin veya yönetici değilse user dashboard'a yönlendir
    const adminRoles = ["admin", "yonetici"];
    if (!adminRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin veya yönetici ise admin sayfasına devam et
    return response;
  }

  // Dashboard sayfası için admin kontrolü
  if (pathname === "/dashboard" && user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Profile hatası veya profile yoksa login'e yönlendir
    if (profileError || !profile) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Admin veya yönetici ise admin dashboard'a yönlendir
    if (profile.role === "admin" || profile.role === "yonetici") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Normal user için dashboard'a devam et
    return response;
  }

  // Ana sayfa yönlendirmesi
  if (pathname === "/") {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "yonetici") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
