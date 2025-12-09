// src/lib/supabase/server-rsc.ts
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function getServerSupabaseRSC() {
  const store = await cookies() // ✅ ใน RSC เป็น async จริง

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        // ❗️ห้ามเขียนคุกกี้ใน RSC — ทำเป็น no-op
        setAll() { /* noop */ },
      },
    }
  )
}
