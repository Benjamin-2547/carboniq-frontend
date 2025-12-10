// //src/app/api/auth/route.ts
// import { NextResponse } from "next/server"
// import { getServerSupabaseAction } from "@/lib/supabase/server-action"

// export async function POST() {
//   const supabase = await getServerSupabaseAction() // ✅ ต้อง await
//   await supabase.auth.signOut()                   // ✅ ไม่มี error แล้ว

//   const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
//   return NextResponse.redirect(new URL("/", base)) // กลับหน้า Home (public)
// }


// src/app/api/auth/route.ts
import { NextResponse } from "next/server"
import { getServerSupabaseAction } from "@/lib/supabase/server-action"

export async function POST(req: Request) {
  const supabase = await getServerSupabaseAction()
  await supabase.auth.signOut()

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin
  return NextResponse.redirect(new URL("/", origin))
}
