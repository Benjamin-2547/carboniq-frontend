//src/app/public/auth/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const sp = useSearchParams()
  const redirectTo = sp.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // validate
    const emailOk = /\S+@\S+\.\S+/.test(email)
    if (!emailOk) return toast.error("อีเมลไม่ถูกต้อง")
    if (password.length < 6) return toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) return toast.error(error.message)

    // ดึง role แล้วไปหน้า home (header จะเปลี่ยนเองจาก layout)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle()

      toast.success(data?.is_admin ? "ยินดีต้อนรับผู้ดูแลระบบ" : "เข้าระบบสำเร็จ")

      if (data?.is_admin) {
        // ✅ admin ล็อกอินเสร็จ → ไปหน้า admin ที่ต้องการ
        router.replace("/admin/home")   // หรือหน้าอื่นที่อยากให้ไป
      } else {
        // ✅ user ปกติ → พาไปเหมือนเดิม (home หรือ redirect เดิม)
        router.replace(redirectTo || "/")
      }

      router.refresh()
    }
    // router.replace(redirectTo || "/")
    // router.refresh() 
  }

  return (
    <div className="mx-auto w-full max-w-xl py-12">
      <h1 className="mb-6 text-4xl font-semibold tracking-tight">Log In</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Email</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-black/20 border-white/10 placeholder:text-white/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-black/20 border-white/10 placeholder:text-white/40"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 w-full rounded-md bg-[#E5E7EB] text-black font-semibold hover:bg-white hover:text-black"
        >
          {loading ? "Signing in..." : "Log In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm text-white/60">Or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Button
        variant="secondary"
        onClick={() => router.push("/public/auth/register")}
        className="mt-2 h-11 w-full rounded-md bg-[#E5E7EB] text-black font-semibold hover:bg-white hover:text-black"
      >
        Create Account
      </Button>
    </div>
  )
}
