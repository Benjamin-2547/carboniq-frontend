// src/app/user/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc";

export default async function UserLayout({ children }: { children: ReactNode }) {
  const supabase = await getServerSupabaseRSC();
  const { data: { user } } = await supabase.auth.getUser();

  // ❌ ไม่ล็อกอิน → ห้ามเข้าโซน user
  if (!user) {
    redirect("/");
  }

  // ✅ เช็ก role
  const { data: row } = await supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  // ❌ ถ้าเป็น admin → ไม่ให้ใช้โซน user
  if (row?.is_admin) {
    redirect("/admin/home"); // หรือ "/admin" ตามที่คุณใช้จริง
  }

  return <>{children}</>;
}
