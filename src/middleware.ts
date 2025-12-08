// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Sadece ilgilendiğimiz route'lar için çalış
  if (pathname !== "/login" && pathname !== "/register") {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // Bu kesinlikle görünecek
  console.error("=====================================");
  console.error("🔥 MIDDLEWARE ÇALIŞTI!");
//  console.error("🔍 Pathname:", pathname);
//  console.error("🔍 Access Token:", accessToken ? "✅ VAR" : "❌ YOK");
//  console.error("🔍 Refresh Token:", refreshToken ? "✅ VAR" : "❌ YOK");
//  console.error("🔍 Tüm Cookies:", req.cookies.getAll());
  console.error("=====================================");

  // Token varsa ana sayfaya yönlendir
  if (accessToken || refreshToken) {
    console.error("🚀 REDIRECT EDİLİYOR -> /");
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  console.error("✅ Middleware geçildi, devam ediliyor...");
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register"],
};