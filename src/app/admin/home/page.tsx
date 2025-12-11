// src/app/admin/page.tsx
export const dynamic = "force-dynamic"
export const revalidate = 0

import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminHomePage() {
  const supabase = await getServerSupabaseRSC()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/public/auth/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()

  const isAdmin = !!userData?.is_admin

  if (!isAdmin) {
    // ถ้าไม่ใช่แอดมิน ส่งกลับไปหน้า user หรือหน้าแรก
    return redirect("/user/calculate")
    // หรือถ้าคุณยังไม่มี /user/calculate ให้ใช้ redirect("/") แทน
  }

  return (
    <main className="min-h-screen mx-auto max-w-6xl px-6 py-10 text-white space-y-12">
      {/* HEADER */}
      <section className="space-y-3">
        <p className="text-base text-text-secondary uppercase tracking-[0.18em]">
          ADMIN CONTROL CENTER
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold">
          แผงควบคุมผู้ดูแลระบบ Carbon Footprint
        </h1>
        <p className="max-w-3xl text-sm md:text-base text-text-secondary leading-relaxed">
          ศูนย์กลางสำหรับจัดการโครงสร้างแบบฟอร์มคำนวณคาร์บอน คำแนะนำทั่วไป
          และฐานข้อมูลสินค้าแนะนำ ข้อมูลที่คุณแก้ไขจะมีผลกับหน้าผู้ใช้ทันที
          กรุณาตรวจสอบให้เรียบร้อยก่อนบันทึกการเปลี่ยนแปลง
        </p>
        <p className="text-xs text-text-secondary/80 ">
          🧑‍💻 ลงชื่อเข้าใช้ในฐานะ:{" "}
          <span className="font-medium text-emerald-300">
            {user.email || user.id}
          </span>
        </p>
      </section>

      {/* 3 การ์ดหลักของฝั่งแอดมิน */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* 1) จัดการแบบฟอร์มคำนวณ */}
        <div className="rounded-2xl bg-black/30 border border-white/25 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-lg">
              📋
            </span>
            <h2 className="text-base md:text-lg font-semibold">
              แบบฟอร์มคำนวณคาร์บอน
            </h2>
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            จัดการ Scope 1–3, Activity ในแต่ละ Scope และ Activity Fields
            (field_key, label, หน่วย, dropdown_group) สำหรับใช้ในหน้าคำนวณของผู้ใช้
          </p>
          <ul className="mt-1 text-[11px] text-text-secondary/90 space-y-1 list-disc list-inside">
            <li>เพิ่ม / แก้ไข Activity ในแต่ละ Scope</li>
            <li>กำหนดช่องข้อมูล (Field) พร้อมหน่วยที่ใช้คำนวณ</li>
            <li>ผูก Field แบบ dropdown เข้ากับ dropdown_group</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-white/10 flex-1 flex items-end">
            <Link
              href="/admin/calculate-admin"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 hover:shadow-lg hover:shadow-black/30 transition-all"
            >
              ไปที่หน้าจัดการแบบฟอร์ม
            </Link>
          </div>
        </div>

        {/* 2) จัดการคำแนะนำทั่วไป */}
        <div className="rounded-2xl bg-black/30 border border-white/25 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-lg">
              💡
            </span>
            <h2 className="text-base md:text-lg font-semibold">
              หมวดคำแนะนำทั่วไป
            </h2>
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            สร้างหมวดคำแนะนำ (Category) พร้อมไอคอน สี และ bullet
            คำแนะนำย่อย ๆ ที่จะถูกนำไปแสดงในหน้าคำแนะนำ/สรุปของผู้ใช้
          </p>
          <ul className="mt-1 text-[11px] text-text-secondary/90 space-y-1 list-disc list-inside">
            <li>กำหนดชื่อหมวด, icon, และสี header ของแต่ละหมวด</li>
            <li>เพิ่ม / แก้ไขคำแนะนำย่อยในแต่ละหมวด</li>
            <li>จัดลำดับ order การแสดงผลของหมวดและ bullet</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-white/10 flex-1 flex items-end">
            <Link
              href="/admin/general-advice-admin"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 hover:shadow-lg hover:shadow-black/30 transition-all"
            >
              ไปที่หน้าจัดการคำแนะนำ
            </Link>
          </div>
        </div>

        {/* 3) จัดการฐานข้อมูลสินค้า */}
        <div className="rounded-2xl bg-black/30 border border-white/25 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
              🛒
            </span>
            <h2 className="text-base md:text-lg font-semibold">
              ฐานข้อมูลสินค้าแนะนำ
            </h2>
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            จัดการหมวดสินค้าและรายการสินค้าทั้งหมด
            รวมถึงรายละเอียดเชิงเทคนิคในตาราง spec ที่ใช้เเสดงในการรับคำเเนะนำ
          </p>
          <ul className="mt-1 text-[11px] text-text-secondary/90 space-y-1 list-disc list-inside">
            <li>เลือกหมวดจาก product_category และเพิ่มสินค้าในหมวดนั้น</li>
            <li>กรอกชื่อสินค้า แบรนด์ และราคา (บาท)</li>
            <li>เปิด “รายละเอียด” เพื่อแก้ไขข้อมูลในตาราง spec ของแต่ละหมวด</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-white/10 flex-1 flex items-end">
            <Link
              href="/admin/product"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 hover:shadow-lg hover:shadow-black/30 transition-all"
            >
              ไปที่หน้าจัดการสินค้า
            </Link>
          </div>
        </div>
      </section>

      {/* ลำดับการตั้งค่าที่แนะนำ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">ลำดับการตั้งค่าที่แนะนำสำหรับแอดมินใหม่</h2>
        <p className="text-sm md:text-base text-text-secondary max-w-3xl">
          ถ้าคุณเพิ่งเริ่มตั้งค่าระบบ แนะนำให้ทำตามลำดับด้านล่างนี้
          เพื่อให้ฝั่งผู้ใช้สามารถคำนวณและรับคำแนะนำได้ครบถ้วน
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-black/25 border border-white/20 p-4 space-y-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
              1
            </div>
            <h3 className="text-sm font-semibold">
              ตั้งค่าโครงสร้างแบบฟอร์มคำนวณ
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              ตรวจสอบ Scope 1–3 ให้ครบ เพิ่ม Activity
              ที่เกี่ยวข้องกับมหาวิทยาลัย และสร้าง Activity Field
              พร้อมกำหนดหน่วย (unit) หรือ dropdown_group ให้เรียบร้อย
            </p>
          </div>

          <div className="rounded-2xl bg-black/25 border border-white/20 p-4 space-y-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">
              2
            </div>
            <h3 className="text-sm font-semibold">
              ตั้งค่า Dropdown Group และ Option
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              สร้างกลุ่มตัวเลือก เช่น <code>fuel_type</code>,{" "}
              <code>vehicle_type</code>, <code>building_type</code>{" "}
              และผูก option_item เข้ากับ source_factor หรือ emission_factor
              หรือกำหนดเป็น context_only สำหรับข้อมูลประกอบ
            </p>
          </div>

          <div className="rounded-2xl bg-black/25 border border-white/20 p-4 space-y-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
              3
            </div>
            <h3 className="text-sm font-semibold">
              เตรียมฐานข้อมูลสินค้าและคำแนะนำ
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              เพิ่มสินค้าในแต่ละหมวด พร้อมกรอก spec ที่จำเป็น
              เพื่อนำไปใช้ในระบบคำเเนะนำได้เต็มประสิทธิภาพและเขียนคำแนะนำทั่วไปให้ครอบคลุม
            </p>
          </div>
        </div>
      </section>

      {/* ข้อควรรู้ก่อนแก้ไขข้อมูล */}
      <section className="rounded-3xl bg-black/30 border border-yellow-400/50 px-6 py-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-base md:text-lg font-semibold">
              ข้อควรรู้ก่อนแก้ไขข้อมูลในฝั่งแอดมิน
            </h2>
            <ul className="text-xs md:text-sm text-text-secondary space-y-1.5 list-disc list-inside">
              <li>
                การลบ Activity / Field / Option
                ส่วนใหญ่เป็นการปิดการใช้งานด้วยฟิลด์{" "}
                <code className="text-[11px] bg-black/40 px-1 py-0.5 rounded">
                  is_active = false
                </code>{" "}
                ผู้ใช้จะไม่เห็นในหน้าใช้งาน แต่ข้อมูลเดิมยังอยู่ในฐานข้อมูล
              </li>
              <li>
                ตัวเลือก (option_item) ที่เชื่อมกับ source_factor หรือ emission_factor เป็นส่วนสำคัญของสูตรคำนวณคาร์บอน การแก้ไข
                Factor Type อาจทำให้ผลคำนวณของกิจกรรมที่ใช้ตัวเลือกนี้คลาดเคลื่อนหรือไม่ทำงาน ดังนั้นควรตรวจสอบให้แน่ใจก่อนแก้ไขทุกครั้ง
              </li>
              <li>
                การลบสินค้าในหน้า Product
                อาจทำให้คำแนะนำบางส่วนไม่เจอสินค้าที่เคยอ้างอิง
                แนะนำให้ใช้การแก้ไขแทนการลบ ถ้าเป็นสินค้าเดิมแต่เปลี่ยนรุ่น
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ปุ่มลัดท้ายหน้า
      <section className="rounded-3xl bg-black/25 border border-white/25 px-6 py-6 space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">
          ทางลัดสำหรับเริ่มใช้งาน
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/calculate-admin"
            className="rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 transition-all"
          >
            ➜ ไปจัดการแบบฟอร์มคำนวณ
          </Link>
          <Link
            href="/admin/general-advice-admin"
            className="rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 transition-all"
          >
            ➜ ไปจัดการคำแนะนำทั่วไป
          </Link>
          <Link
            href="/admin/product"
            className="rounded-lg px-4 py-2 text-xs md:text-sm bg-white/10 border border-white/30 hover:bg-white/20 transition-all"
          >
            ➜ ไปจัดการฐานข้อมูลสินค้า
          </Link>
        </div>
      </section>*/}
    </main>
  )
}
