// src/app/admin/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await getServerSupabaseRSC();
  const { data: { user } } = await supabase.auth.getUser();

  // ❌ ไม่ล็อกอิน → ห้ามเข้า admin
  if (!user) {
    redirect("/");
  }

  // ✅ เช็ก role จากตาราง users
  const { data: row } = await supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  // ❌ ถ้าไม่ใช่ admin → เตะออก
  if (!row?.is_admin) {
    redirect("/user/profile"); // หรือจะ redirect("/") ก็ได้ แล้วแต่ที่คุณอยากให้ไป
  }

  return <>{children}</>;
}
