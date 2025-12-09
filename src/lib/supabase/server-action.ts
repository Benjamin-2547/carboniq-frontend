// src/lib/supabase/server-action.ts
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function getServerSupabaseAction() {   // ⬅ ทำให้เป็น async
  const store = await cookies();                     // ⬅ ต้อง await ให้ได้ตัว store จริง

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options) // ✅ set cookie ได้ใน Route/Action
          })
        },
      },
    }
  )
}
