// src/lib/supabase/server.ts  
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function getServerSupabase() {
  const store = await cookies() // เวอร์ชันคุณเป็น Promise
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        // ❗️สำคัญ: ห้าม set cookie ใน RSC
        setAll(_cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          /* no-op on RSC */
        },
      },
    }
  )
}
