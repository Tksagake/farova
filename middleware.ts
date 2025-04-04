import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function middleware(req: NextRequest) {
  // 1. Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Optional: Add admin role checking if needed
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    "/dashboard(.*)",
    "/admin(.*)",
    "/profile(.*)",
    "/settings(.*)",
  ]
};