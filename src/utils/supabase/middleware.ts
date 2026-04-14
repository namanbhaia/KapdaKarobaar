import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
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
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser();

  // AUTH PROTECTION LOGIC
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isSignupPage = request.nextUrl.pathname === "/signup";
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isLoginPage && !isSignupPage && !isAuthCallback) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (isLoginPage || isSignupPage)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
};
