
// // src/app/user/profile/page.tsx
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// import Link from "next/link";

// // เตรียม array ไว้เป็นโครง (เดี๋ยวค่อยเปลี่ยนมาใช้ข้อมูลจริงจาก DB)
// const YEARS = [2023, 2024, 2025];

// const MONTHS = [
//   "ม.ค.",
//   "ก.พ.",
//   "มี.ค.",
//   "เม.ย.",
//   "พ.ค.",
//   "มิ.ย.",
//   "ก.ค.",
//   "ส.ค.",
//   "ก.ย.",
//   "ต.ค.",
//   "พ.ย.",
//   "ธ.ค.",
// ];

// export default function UserProfilePage() {
//   // ตอนนี้ยังไม่ดึงข้อมูลจริง แค่ทำโครง UI
//   // TODO: ดึงข้อมูล user, summary, recommendation จากฐานข้อมูลมาใส่แทนที่ placeholder เหล่านี้

//   return (
//     <main className="min-h-screen pb-12 space-y-22">
//       {/* 1) HEADER ของโปรไฟล์ */}
//       <section className="mx-auto max-w-6xl px-6">
//         <div className="rounded-2xl bg-black/20 border border-border-muted p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="space-y-1.5">
//             {/* TODO: ใช้ชื่อเล่น + email จริงจาก DB */}
//             <h1 className="text-2xl md:text-3xl font-semibold">benjamin</h1>
//             <p className="text-sm text-text-secondary">ben@gmail.com</p>
//             <p className="text-xs text-text-secondary/80">
//               Member since: 2025-11-10
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3 text-xs">
//             <span className="inline-flex items-center rounded-full bg-primary-green/10 text-primary-green px-3 py-1 font-medium">
//               Role: User
//             </span>
//             {/* ถ้าอนาคตมี field เพิ่ม เช่น แผนก / faculty ค่อยเพิ่ม pill ตรงนี้ได้ */}
//           </div>
//         </div>
//       </section>

//       {/* 2) ประวัติการคำนวณคาร์บอนรายเดือน (Summary History) */}
//       <section className="mx-auto max-w-6xl px-6 space-y-4">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <h2 className="text-xl md:text-2xl font-semibold">
//             ประวัติการคำนวณคาร์บอนรายเดือน
//           </h2>

//           {/* ตัวกรองปี */}
//           <div className="flex items-center gap-2 text-sm">
//             <span className="text-text-secondary">ปี</span>
//             <select
//               className="h-9 rounded-md border border-border-muted bg-black/30 px-3 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
//               defaultValue={2025}
//             >
//               {YEARS.map((year) => (
//                 <option key={year} value={year} className="bg-[#0F1A13]">
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* การ์ดเดือน เลื่อนซ้าย-ขวาได้ */}
//         <div className="mt-2 overflow-x-auto pb-2">
//           <div className="flex gap-4 min-w-max">
//             {MONTHS.map((month, index) => (
//               <article
//                 key={month}
//                 className="w-64 rounded-2xl bg-card-bg/80 border border-border-muted p-4 flex-shrink-0"
//               >
//                 <header className="flex items-center justify-between mb-3">
//                   <div>
//                     <p className="text-xs text-text-secondary/80">เดือน</p>
//                     <p className="text-sm font-semibold">{month} 2025</p>
//                   </div>
//                   {/* ตรงนี้จะค่อยเปลี่ยนเป็น “เดือนปัจจุบัน / มีข้อมูลล่าสุด” ก็ได้ */}
//                   <span className="text-[10px] px-2 py-1 rounded-full bg-black/30 text-text-secondary">
//                     Placeholder
//                   </span>
//                 </header>

//                 {/* TODO: แทนที่ตัวเลขด้วยข้อมูลจริงจาก summary */}
//                 <div className="space-y-1.5 text-xs text-text-secondary">
//                   <p className="flex justify-between">
//                     <span>รวมทั้งหมด</span>
//                     <span className="font-semibold text-white">0.0 kgCO₂e</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span>Scope 1</span>
//                     <span>0.0 kg</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span>Scope 2</span>
//                     <span>0.0 kg</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span>Scope 3</span>
//                     <span>0.0 kg</span>
//                   </p>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 3) ประวัติคำแนะนำที่เคยได้รับ (AI Recommendation History) */}
//       <section className="mx-auto max-w-6xl px-6 space-y-4">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <h2 className="text-xl md:text-2xl font-semibold">
//             ประวัติคำแนะนำที่เคยบันทึกไว้
//           </h2>

//           {/* ตัวกรองเดือน/ปี */}
//           <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
//             <div className="flex items-center gap-1.5">
//               <span className="text-text-secondary">ปี</span>
//               <select
//                 className="h-8 rounded-md border border-border-muted bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
//                 defaultValue={2025}
//               >
//                 {YEARS.map((year) => (
//                   <option key={year} value={year} className="bg-[#0F1A13]">
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-1.5">
//               <span className="text-text-secondary">เดือน</span>
//               <select
//                 className="h-8 rounded-md border border-border-muted bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
//                 defaultValue=""
//               >
//                 <option value="" className="bg-[#0F1A13]">
//                   ทั้งปี
//                 </option>
//                 {MONTHS.map((m) => (
//                   <option key={m} value={m} className="bg-[#0F1A13]">
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ตารางประวัติคำแนะนำ */}
//         <div className="rounded-2xl bg-black/20 border border-border-muted overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-xs md:text-sm">
//               <thead className="bg-black/40 text-text-secondary uppercase text-[11px]">
//                 <tr>
//                   <th className="px-4 py-2 text-left">วันที่บันทึก</th>
//                   <th className="px-4 py-2 text-left">หัวข้อคำแนะนำ</th>
//                   <th className="px-4 py-2 text-left">Scope</th>
//                   <th className="px-4 py-2 text-left">งบประมาณ</th>
//                   <th className="px-4 py-2 text-left">สถานะ</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {/* TODO: map จากรายการ recommendation ที่ผู้ใช้กด Save/Favorite */}
//                 <tr>
//                   <td
//                     className="px-4 py-4 text-center text-text-secondary"
//                     colSpan={5}
//                   >
//                     ยังไม่มีคำแนะนำที่บันทึกไว้
//                     ระบบจะโชว์รายการที่คุณกดบันทึกในอนาคต
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </section>

//       {/* 4) ปุ่มลัด (Quick Actions) */}
//       <section className="mx-auto max-w-6xl px-6 space-y-4">
//         <h2 className="text-xl md:text-2xl font-semibold">ทำต่อจากหน้านี้</h2>
//         <p className="text-xs md:text-sm text-text-secondary">
//           เลือกสิ่งที่คุณอยากทำ ไม่ว่าจะคำนวณคาร์บอนหรือรับคำแนะนำใหม่
//         </p>

//         <div className="grid gap-4 md:grid-cols-3">
//           {/* คำนวณคาร์บอน */}
//           <Link
//             href="/user/calculate"
//             // className="rounded-2xl bg-card-bg/80 border border-border-muted p-4 flex flex-col gap-2 hover:bg-black/30 transition-colors"
//             className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
//             transition-all"
//           >
//             <span className="text-sm font-semibold">คำนวณคาร์บอน</span>
//             <p className="text-xs text-text-secondary">
//               ไปยังหน้าคำนวณเพื่อกรอกกิจกรรมและดูการปล่อยคาร์บอนของคุณ
//             </p>
//           </Link>

//           {/* รับคำแนะนำใหม่ */}
//           <Link
//             href="/user/get-advice"
//             className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
//             transition-all"
//           >
//             <span className="text-sm font-semibold">รับคำแนะนำใหม่</span>
//             <p className="text-xs text-text-secondary">
//               เลือก Scope และประเภทสิ่งของ พร้อมตั้งงบประมาณ ระบบ AI
//               จะช่วยจัดสรรให้
//             </p>
//           </Link>

//           {/* ดูสรุปรายเดือน (ไปหน้า summary แยก) */}
//           <Link
//             href="/"
//             className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
//             transition-all"
//           >
//             <span className="text-sm font-semibold">กลับหน้าหลัก</span>
//             <p className="text-xs text-text-secondary">
//               เปิดหน้าหลัก เพื่ออ่านรายละเอียดต่างๆของระบบ ว่าทำอะไรได้บ้าง
//             </p>
//           </Link>
//         </div>
//       </section>
//     </main>
//   );
// }







// src/app/user/profile/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// =====================
// ====== TYPES =========
// =====================

type MonthSummary = {
  month: number
  total: number
  scope1: number
  scope2: number
  scope3: number
}

type RawCalcLog = {
  co2e_kg: number | null      // ชื่อให้ตรงกับคอลัมน์ใน DB
  calculated_at: string       // timestamp
  scope_id: number | null
}

type SavedRow = {
  savedId: number
  savedAt: string
  categoryId: number | null
  categoryCode: string
  categoryNameTh: string
  productId: number
  productName: string
  brand: string | null
  priceThb: number | null
  resultId: number
  rank: number | null
  estCo2Saving: number | null
  co2PerBaht: number | null
  requestId: number | null
  totalBudget: number | null
  requestCreatedAt: string | null
}

type SavedBaseRow = {
  saved_id: number
  saved_at: string
  result_id: number
  product_id: number
}

type CategoryOption = {
  categoryId: number
  code: string
  displayNameTh: string
}

type UserProfile = {
  id: string
  email: string | null
  displayName: string | null
  createdAt: string | null
  username: string | null
}

// =====================
// ===== HELPERS =======
// =====================

const MONTH_LABELS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
]

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const startYear = 2024
  const years: number[] = []
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y)
  }
  return years
}

function formatNumber(value: number | null | undefined, decimals = 2) {
  if (value == null || isNaN(value)) return "0.00"
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatDateTime(dt: string | null | undefined) {
  if (!dt) return "-"
  const date = new Date(dt)
  if (isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatDateOnly(dt: string | null | undefined) {
  if (!dt) return "-"
  const date = new Date(dt)
  if (isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(date)
}

// ใช้รวม co2 ของแต่ละเดือน / scope
function buildMonthSummaries(raw: RawCalcLog[], year: number): MonthSummary[] {
  const base: MonthSummary[] = []
  for (let m = 1; m <= 12; m++) {
    base.push({
      month: m,
      total: 0,
      scope1: 0,
      scope2: 0,
      scope3: 0,
    })
  }

  for (const row of raw) {
    if (!row.co2e_kg || !row.calculated_at) continue
    const dt = new Date(row.calculated_at)
    if (dt.getFullYear() !== year) continue

    const month = dt.getMonth() + 1
    const idx = month - 1
    const co2 = Number(row.co2e_kg) || 0
    base[idx].total += co2

    if (row.scope_id === 1) base[idx].scope1 += co2
    else if (row.scope_id === 2) base[idx].scope2 += co2
    else if (row.scope_id === 3) base[idx].scope3 += co2
  }

  return base
}

// =====================
// ====== PAGE =========
// =====================

const supabase = createClient()

export default function UserProfilePage() {
  const YEAR_OPTIONS = useMemo(() => getYearOptions(), [])

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const [yearForSummary, setYearForSummary] = useState<number>(() => {
    const current = new Date().getFullYear()
    return YEAR_OPTIONS.includes(current) ? current : YEAR_OPTIONS[YEAR_OPTIONS.length - 1]
  })

  const [yearForSaved, setYearForSaved] = useState<number>(() => {
    const current = new Date().getFullYear()
    return YEAR_OPTIONS.includes(current) ? current : YEAR_OPTIONS[YEAR_OPTIONS.length - 1]
  })
  const [monthFilterSaved, setMonthFilterSaved] = useState<string>("") // "" = ทั้งปี
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>(() =>
    buildMonthSummaries([], yearForSummary),
  )
  const [savedRows, setSavedRows] = useState<SavedRow[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===========================
  // ===== MAIN LOADER =========
  // ===========================

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        // 1) ดึง user จาก auth
        const { data: authData, error: authErr } = await supabase.auth.getUser()
        if (authErr) {
          console.error("❌ auth.getUser error =", authErr)
          setError("ไม่สามารถอ่านข้อมูลผู้ใช้จากระบบล็อกอินได้")
          toast.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ")
          return
        }

        const authUser = authData?.user
        if (!authUser) {
          console.error("❌ no auth user")
          setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง")
          toast.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ")
          return
        }

        const userId = authUser.id

        // 2) ดึงข้อมูลจากตาราง users (profile ภายใน)
        const { data: userRow, error: userRowErr } = await supabase
          .from("users")
          .select("user_id, username, created_at")
          .eq("user_id", userId)
          .maybeSingle()

        if (userRowErr) {
          // ถ้ามีปัญหา RLS หรืออื่น ๆ จะมาดูตรงนี้
          console.error("❌ users table error =", userRowErr)
        }

        const profile: UserProfile = {
          id: userId,
          email: authUser.email ?? null,
          displayName: authUser.user_metadata?.full_name ?? null,
          createdAt: userRow?.created_at ?? authUser.created_at ?? null,
          username: userRow?.username ?? null,
        }

        if (!cancelled) {
          setUserProfile(profile)
        }

        // 3) ดึง log คาร์บอน ทั้งปีของ user คนนี้ (ผ่าน carbon_input → carbon_calculation_log)
        const yearStart = `${yearForSummary}-01-01`
        const yearEnd = `${yearForSummary + 1}-01-01`

        // 3.1 หา input_id ของ user (ไม่จำกัดปี เพื่อกันเคส submitted_at ไม่ตรงปี แต่ log คำนวณปีนี้)
        const { data: inputRows, error: inputErr } = await supabase
          .from("carbon_input")
          .select("input_id")
          .eq("user_id", userId)

        if (inputErr) {
          console.warn("⚠️ carbon_input error =", inputErr)
        }

        const inputIds = (inputRows ?? []).map((r: any) => r.input_id)
        let safeCalcRows: RawCalcLog[] = []

        if (inputIds.length > 0) {
          // 3.2 โหลด log ที่ is_active ของ input เหล่านี้ และคัดเฉพาะช่วงปีที่เลือกด้วย calculated_at
          const { data: calcRows, error: calcErr } = await supabase
            .from("carbon_calculation_log")
            .select("input_id, co2e_kg, calculated_at, scope_id")
            // ดึงทั้ง is_active = true/false ตามที่ผู้ใช้ร้องขอ
            .in("input_id", inputIds)
            .gte("calculated_at", yearStart)
            .lt("calculated_at", yearEnd)

          if (calcErr) {
            console.warn("⚠️ carbon_calculation_log error =", calcErr)
          }

          safeCalcRows = (calcRows ?? []).map((r: any) => ({
            co2e_kg: r.co2e_kg ?? 0,
            calculated_at: r.calculated_at,
            scope_id: r.scope_id,
          }))
        }

        const summaries = buildMonthSummaries(safeCalcRows, yearForSummary)

        if (!cancelled) {
          setMonthSummaries(summaries)
        }


        // 4) ดึง product_category (ตัวเลือก filter)
        const { data: catRows, error: catErr } = await supabase
          .from("product_category")
          .select("category_id, code, display_name_th")
          .eq("is_active", true)
          .order("category_id", { ascending: true })

        if (catErr) {
          console.error("❌ product_category error =", catErr)
        }

        if (!cancelled) {
          const list: CategoryOption[] = (catRows ?? []).map((c: any) => ({
            categoryId: c.category_id,
            code: c.code,
            displayNameTh: c.display_name_th,
          }))
          setCategoryOptions(list)
        }

        // 5) ดึงรายการที่ user เคยกดบันทึกสินค้า
        const { data: savedBase, error: savedBaseErr } = await supabase
          .from("recommendation_saved_product")
          .select("saved_id, saved_at, result_id, product_id")
          .eq("user_id", userId)
          .order("saved_at", { ascending: false })

        if (savedBaseErr) {
          console.error("❌ recommendation_saved_product error =", savedBaseErr)
        }

        const base: SavedBaseRow[] = (savedBase ?? []) as SavedBaseRow[]
        if (base.length === 0) {
          if (!cancelled) setSavedRows([])
          return
        }

        const resultIds = Array.from(new Set(base.map((r: SavedBaseRow) => r.result_id)))
        const productIds = Array.from(new Set(base.map((r: SavedBaseRow) => r.product_id)))

        // --- ดึง product
        const { data: productRows, error: productErr } = await supabase
          .from("product")
          .select("product_id, product_name, brand, price_thb, category_id")
          .in("product_id", productIds)

        if (productErr) {
          console.error("❌ product error =", productErr)
        }

        // --- ดึง result (ดึง rank + co2 saving)
        const { data: resultRows, error: resultErr } = await supabase
          .from("recommendation_result")
          .select("result_id, request_item_id, rank, est_co2_saving, co2_saving_per_baht")
          .in("result_id", resultIds)

        if (resultErr) {
          console.error("❌ recommendation_result error =", resultErr)
        }

        // --- ดึง request_item → request_id, category_id
        const requestItemIds = Array.from(
          new Set((resultRows ?? []).map((r: any) => r.request_item_id as number)),
        )

        const { data: requestItemRows, error: requestItemErr } = await supabase
          .from("recommendation_request_item")
          .select("request_item_id, request_id, category_id")
          .in("request_item_id", requestItemIds)

        if (requestItemErr) {
          console.error("❌ recommendation_request_item error =", requestItemErr)
        }

        // --- ดึง request → total_budget + created_at
        const requestIds = Array.from(
          new Set((requestItemRows ?? []).map((r: any) => r.request_id as number)),
        )

        const { data: requestRows, error: requestErr } = await supabase
          .from("recommendation_request")
          .select("request_id, total_budget, created_at")
          .in("request_id", requestIds)

        if (requestErr) {
          console.error("❌ recommendation_request error =", requestErr)
        }

        // --- Map ให้ join ง่าย ๆ
        const productById = new Map<number, any>()
          ; (productRows ?? []).forEach((p: any) => {
            productById.set(p.product_id, p)
          })

        const resultById = new Map<number, any>()
          ; (resultRows ?? []).forEach((r: any) => {
            resultById.set(r.result_id, r)
          })

        const requestItemById = new Map<number, any>()
          ; (requestItemRows ?? []).forEach((ri: any) => {
            requestItemById.set(ri.request_item_id, ri)
          })

        const requestById = new Map<number, any>()
          ; (requestRows ?? []).forEach((rq: any) => {
            requestById.set(rq.request_id, rq)
          })

        const categoryById = new Map<number, CategoryOption>()
          ; (catRows ?? []).forEach((c: any) => {
            categoryById.set(c.category_id, {
              categoryId: c.category_id,
              code: c.code,
              displayNameTh: c.display_name_th,
            })
          })

        const joined: SavedRow[] = (base as any[]).map((row: any) => {
          const res = resultById.get(row.result_id)
          const item = res ? requestItemById.get(res.request_item_id) : undefined
          const req = item ? requestById.get(item.request_id) : undefined
          const product = productById.get(row.product_id)
          const category = product ? categoryById.get(product.category_id) : undefined

          return {
            savedId: row.saved_id,
            savedAt: row.saved_at,
            productId: row.product_id,
            resultId: row.result_id,
            categoryId: product?.category_id ?? null,
            categoryCode: category?.code ?? "",
            categoryNameTh: category?.displayNameTh ?? "",
            productName: product?.product_name ?? "-",
            brand: product?.brand ?? null,
            priceThb: product?.price_thb ?? null,
            rank: res?.rank ?? null,
            estCo2Saving: res?.est_co2_saving ?? null,
            co2PerBaht: res?.co2_saving_per_baht ?? null,
            requestId: item?.request_id ?? null,
            totalBudget: req?.total_budget ?? null,
            requestCreatedAt: req?.created_at ?? null,
          }
        })

        if (!cancelled) {
          setSavedRows(joined)
        }
      } catch (e) {
        console.error("❌ load profile page error =", e)
        if (!cancelled) {
          setError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ")
          toast.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
    // ปีสำหรับ summary เปลี่ยน → โหลดใหม่
  }, [yearForSummary])

  // ===========================
  // ===== FILTERED SAVED ======
  // ===========================

  const filteredSavedRows = useMemo(() => {
    return savedRows.filter((row) => {
      const dt = row.savedAt ? new Date(row.savedAt) : null
      if (!dt || isNaN(dt.getTime())) return false

      if (dt.getFullYear() !== yearForSaved) return false

      if (monthFilterSaved) {
        const monthIdx = MONTH_LABELS.indexOf(monthFilterSaved)
        if (monthIdx >= 0 && dt.getMonth() !== monthIdx) return false
      }

      if (categoryFilter !== "all") {
        if (row.categoryCode !== categoryFilter) return false
      }

      return true
    })
  }, [savedRows, yearForSaved, monthFilterSaved, categoryFilter])

  // ===========================
  // ========= UI ==============
  // ===========================

  const displayName =
    userProfile?.displayName || userProfile?.username || "ผู้ใช้"

  return (
    <main className="min-h-screen pb-12 space-y-14">
      {/* 1) HEADER ของโปรไฟล์ */}
      <section className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-emerald-600/30 via-emerald-500/15 to-slate-900/35 shadow-[0_12px_40px_rgba(0,0,0,0.25)] px-5 py-4 md:px-6 md:py-5 flex items-center gap-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-10 -top-14 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-teal-300/15 blur-3xl" />
          </div>

          <div className="relative flex items-center gap-4 md:gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/15 text-lg font-semibold text-white shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-white">
                {displayName}
              </h1>
              <p className="text-sm text-emerald-50/85">
                {userProfile?.email ?? "ไม่มีอีเมลในระบบ"}
              </p>
              <p className="text-xs text-emerald-50/65">
                Member since:{" "}
                {userProfile?.createdAt
                  ? formatDateOnly(userProfile.createdAt)
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2) ประวัติการคำนวณคาร์บอนรายเดือน */}
      <section className="mx-auto max-w-6xl px-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            ประวัติการคำนวณคาร์บอนรายเดือน
          </h2>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">ปี</span>
            <select
              className="h-9 rounded-md border border-white/25 bg-black/30 px-3 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
              value={yearForSummary}
              onChange={(e) => setYearForSummary(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year} className="bg-[#0F1A13]">
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* การ์ดเดือน เลื่อนซ้าย-ขวาได้ */}
        <div className="mt-2 overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {monthSummaries.map((m) => {
              const hasData =
                m.total > 0 || m.scope1 > 0 || m.scope2 > 0 || m.scope3 > 0
              return (
                <article
                  key={m.month}
                  className="w-64 rounded-2xl bg-card-bg/80 border border-white/25 p-4 flex-shrink-0 shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
                >
                  <header className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-text-secondary/80">เดือน</p>
                      <p className="text-sm font-semibold">
                        {MONTH_LABELS[m.month - 1]} {yearForSummary}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full border ${
                        hasData
                          ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-100"
                          : "bg-red-500/20 border-red-400/60 text-red-100"
                      }`}
                    >
                      {hasData ? "มีข้อมูล" : "ยังไม่มีข้อมูล"}
                    </span>
                  </header>

                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <p className="flex justify-between">
                      <span>รวมทั้งหมด</span>
                      <span className="font-semibold text-white">
                        {formatNumber(m.total)} kgCO₂e
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Scope 1</span>
                      <span>{formatNumber(m.scope1)} kg</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Scope 2</span>
                      <span>{formatNumber(m.scope2)} kg</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Scope 3</span>
                      <span>{formatNumber(m.scope3)} kg</span>
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3) ประวัติคำแนะนำที่เคยบันทึกไว้ */}
      <section className="mx-auto max-w-6xl px-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            ประวัติคำแนะนำที่เคยบันทึกไว้
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary">ปี</span>
              <select
                className="h-8 rounded-md border border-white/25 bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
                value={yearForSaved}
                onChange={(e) => setYearForSaved(Number(e.target.value))}
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year} className="bg-[#0F1A13]">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary">เดือน</span>
              <select
                className="h-8 rounded-md border border-white/25 bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
                value={monthFilterSaved}
                onChange={(e) => setMonthFilterSaved(e.target.value)}
              >
                <option value="" className="bg-[#0F1A13]">
                  ทั้งปี
                </option>
                {MONTH_LABELS.map((m) => (
                  <option key={m} value={m} className="bg-[#0F1A13]">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary">ประเภทสินค้า</span>
              <select
                className="h-8 rounded-md border border-white/25 bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all" className="bg-[#0F1A13]">
                  สินค้าทั้งหมด
                </option>
                {categoryOptions.map((c) => (
                  <option
                    key={c.categoryId}
                    value={c.code}
                    className="bg-[#0F1A13]"
                  >
                    {c.displayNameTh}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-black/20 border border-white/25 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-black/40 text-text-secondary uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-2 text-left">วันที่บันทึก</th>
                  <th className="px-4 py-2 text-left">ประเภทสินค้า</th>
                  <th className="px-4 py-2 text-left">ชื่อสินค้า / ยี่ห้อ</th>
                  <th className="px-4 py-2 text-left">ลำดับที่แนะนำ</th>
                  <th className="px-4 py-2 text-left">ลด CO₂ (kg/ปี)</th>
                  <th className="px-4 py-2 text-left">CO₂ / บาท</th>
                  <th className="px-4 py-2 text-left">ราคาสินค้า (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSavedRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-4 text-center text-text-secondary"
                      colSpan={7}
                    >
                      ยังไม่มีคำแนะนำที่บันทึกไว้ในช่วงที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredSavedRows.map((row) => (
                    <tr key={row.savedId} className="border-t border-white/15">
                      <td className="px-4 py-3">
                        {formatDateTime(row.savedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {row.categoryNameTh || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {row.productName}
                        </span>
                        {row.brand && (
                          <span className="text-text-secondary">
                            {" "}
                            ({row.brand})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.rank != null ? `อันดับที่ ${row.rank}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {row.estCo2Saving != null
                          ? `${formatNumber(row.estCo2Saving)} kg/ปี`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {row.co2PerBaht != null
                          ? `${formatNumber(row.co2PerBaht, 4)} CO₂/บาท`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {row.priceThb != null
                          ? formatNumber(Number(row.priceThb))
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* (ลบส่วนปุ่มลัดด้านล่างตามคำขอ) */}
    </main>
  )
}
