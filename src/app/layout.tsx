// src/app/layout.tsx
import "./globals.css"
import { Providers } from "@/components/layout/providers"

import PublicHeader from "@/components/layout/PublicHeader"
import UserHeader from "@/components/layout/UserHeader"
import AdminHeader from "@/components/layout/AdminHeader"

import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc"

// ⭐ นำเข้า Font Google
import { IBM_Plex_Sans_Thai } from "next/font/google"

// ⭐ ตั้งค่าฟอนต์
const ibm = IBM_Plex_Sans_Thai({
  weight: ["300","400","500","600","700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm"
})

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Carbon Footprint Platform",
  description: "Calculate & recommend eco products",
}

async function resolveRole(): Promise<"public" | "user" | "admin"> {
  try {
    const supabase = await getServerSupabaseRSC()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return "public"

    const { data: row } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    return row?.is_admin ? "admin" : "user"
  } catch {
    return "public"
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const role = await resolveRole()

  return (
    // ⭐ ใส่ className ของ font เข้าไปตรงนี้
    <html lang="th" className={`${ibm.variable} dark`} suppressHydrationWarning>
      {/* ⭐ ใช้ var(--font-ibm) เป็น font-family หลัก */}
      <body className="min-h-screen bg-green-gradient text-white font-sans" style={{ fontFamily: "var(--font-ibm), sans-serif" }}>
        <Providers>

          {role === "admin"
            ? <AdminHeader />
            : role === "user"
              ? <UserHeader />
              : <PublicHeader />
          }

          {/* ⭐ ให้ main ยังมี max-width เหมือนเดิม */}
          <main className="mx-auto max-w-6xl p-6">
            {children}
          </main>

          <footer className="mt-12 border-t border-border-muted/60 p-6 text-[13px] text-text-secondary">
            © {new Date().getFullYear()} Prince of Songkla University, Phuket Campus — All rights reserved.
          </footer>

        </Providers>
      </body>
    </html>
  )
}
