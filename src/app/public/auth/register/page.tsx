// src/app/public/auth/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()

  const [displayName, setDisplayName] = useState("")   // 🆕 ชื่อเล่น / display name
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!displayName.trim()) {
      return toast.error("กรุณากรอกชื่อที่แสดง")
    }

    const emailOk = /\S+@\S+\.\S+/.test(email)
    if (!emailOk) return toast.error("อีเมลไม่ถูกต้อง")
    if (password.length < 6) return toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    if (password !== confirm) return toast.error("รหัสผ่านไม่ตรงกัน")

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return toast.error(error.message)

    // สร้าง / อัปเดตแถวในตาราง users พร้อม username จาก displayName
    if (data.user) {
      const { error: upsertErr } = await supabase
        .from("users")
        .upsert(
          {
            user_id: data.user.id,
            username: displayName.trim(),  // 🆕 ใช้ชื่อที่ผู้ใช้กรอก
            is_admin: false,
          },
          { onConflict: "user_id" }
        )

      if (upsertErr) return toast.error(upsertErr.message)
    }

    // บางเคส signUp ไม่มี session ทันที → ล็อกอินต่อให้เลย
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInErr) return toast.error(signInErr.message)
    }

    toast.success("สมัครสมาชิกสำเร็จ")
    router.replace("/")   // กลับหน้า Home
    router.refresh()      // ให้ layout อ่าน role ใหม่ → header เปลี่ยนทันที
  }

  return (
    <div className="mx-auto w-full max-w-xl py-12">
      <h1 className="mb-6 text-4xl font-semibold tracking-tight">Create Account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* ชื่อเล่น / Display name */}
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">
            Display name / ชื่อที่แสดง
          </label>
          <Input
            type="text"
            placeholder="เช่น benjamin, Pim, Kim"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 bg-black/20 border-white/10 placeholder:text-white/40"
          />
        </div>

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
            placeholder="≥ 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-black/20 border-white/10 placeholder:text-white/40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Confirm password</label>
          <Input
            type="password"
            placeholder="re-type password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 bg-black/20 border-white/10 placeholder:text-white/40"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 w-full rounded-md bg-[#E5E7EB] text-black font-semibold hover:bg-white hover:text-black"
        >
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm text-white/60">Or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Button
        variant="secondary"
        onClick={() => router.push("/public/auth/login")}
        className="mt-2 h-11 w-full rounded-md bg-[#E5E7EB] text-black font-semibold hover:bg-white hover:text-black"
      >
        Back to Log In
      </Button>
    </div>
  )
}
