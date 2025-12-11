// src/app/admin/general-advice-admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// -----------------------------
// Types
// -----------------------------
type AdviceCategory = {
  id: string
  name_th: string | null
  icon: string | null
  color_hex: string | null
  order_index: number | null
}

type AdviceDetail = {
  id: string
  category_id: string
  detail_th: string
  order_index: number | null
}

type CategoryWithDetails = AdviceCategory & {
  details: AdviceDetail[]
}

// -----------------------------
// Presets (icon / color ให้ admin เลือก)
// -----------------------------
const ICON_PRESETS = [
  { key: "waste", emoji: "🗑️", label: "การจัดการขยะ" },
  { key: "refrigerant", emoji: "❄️", label: "สารทำความเย็น / แอร์" },
  { key: "women", emoji: "🚶‍♀️", label: "การเดินทางของคนผู้หญิง" },
  { key: "man", emoji: "🚶", label: "การเดินทางของคนผู้ชาย" },
  { key: "freight", emoji: "🚚", label: "ขนส่งวัตถุดิบ/สินค้า" },
  { key: "water", emoji: "💧", label: "น้ำประปาและการใช้น้ำ" },
  { key: "energy", emoji: "⚡", label: "การใช้พลังงานไฟฟ้า" },
  { key: "solar", emoji: "🌞", label: "โซลาร์และพลังงานสะอาด" },
  { key: "tree", emoji: "🌳", label: "พื้นที่สีเขียว / ต้นไม้" },
  { key: "leaf", emoji: "🍃", label: "ลดใช้ทรัพยากร / กระดาษ" },
  { key: "bike", emoji: "🚲", label: "จักรยาน / การเดินทางสะอาด" },
  { key: "bus", emoji: "🚌", label: "รถโดยสารสาธารณะ" },
  { key: "car", emoji: "🚗", label: "รถยนต์" },
  { key: "building", emoji: "🏫", label: "อาคารเรียน / สำนักงาน" },
  { key: "home", emoji: "🏠", label: "ที่พัก / หอพัก" },
  { key: "plug", emoji: "🔌", label: "อุปกรณ์ไฟฟ้า / ปลั๊ก" },
  { key: "tools", emoji: "🛠️", label: "ซ่อมบำรุง" },
  { key: "package", emoji: "📦", label: "บรรจุภัณฑ์ / พัสดุ" },
  { key: "lab", emoji: "🧪", label: "ห้องแล็บ / เคมีภัณฑ์" },
  { key: "food", emoji: "🍽️", label: "อาหาร / โรงอาหาร" },
  { key: "rain", emoji: "🌧️", label: "น้ำฝน / ระบบระบายน้ำ" },
  { key: "analytics", emoji: "📊", label: "การติดตามผล / รายงาน" },
]

const COLOR_PRESETS = [
  { key: "yellow", hex: "#FACC15" },
  { key: "cyan", hex: "#06B6D4" },
  { key: "blue", hex: "#0F6FFF" },
  { key: "gray", hex: "#6B7280" },
  { key: "dark", hex: "#111827" },
  { key: "green-soft", hex: "#16A34A" },
  { key: "green-deep", hex: "#166534" },
  { key: "green-lime", hex: "#65A30D" },
  { key: "teal", hex: "#0D9488" },
  { key: "emerald", hex: "#10B981" },
  { key: "orange", hex: "#F97316" },
  { key: "amber", hex: "#F59E0B" },
  { key: "red-soft", hex: "#EF4444" },
  { key: "rose", hex: "#F97373" },
  { key: "gray-soft", hex: "#4B5563" },
  { key: "gray-light", hex: "#9CA3AF" },
  { key: "slate", hex: "#1F2937" },
  { key: "slate-soft", hex: "#111827" },
  { key: "indigo", hex: "#4F46E5" },
  { key: "sky", hex: "#0EA5E9" },
  { key: "mint", hex: "#A7F3D0" },
  { key: "light-cyan", hex: "#CFFAFE" },
  { key: "light-amber", hex: "#FEF3C7" },
]

// -----------------------------
// Component หลัก
// -----------------------------
export default function GeneralAdviceAdminPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<CategoryWithDetails[]>([])

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: catRows, error: catErr } = await supabase
        .from("advice_category")
        .select("id, name_th, icon, color_hex, order_index")
        .order("order_index", { ascending: true })

      if (catErr) {
        toast.error(catErr.message)
        setLoading(false)
        return
      }

      const { data: detailRows, error: detailErr } = await supabase
        .from("advice_detail")
        .select("id, category_id, detail_th, order_index")
        .order("order_index", { ascending: true })

      if (detailErr) {
        toast.error(detailErr.message)
        setLoading(false)
        return
      }

      const catRowsTyped: AdviceCategory[] = catRows ?? []
      const detailRowsTyped: AdviceDetail[] = detailRows ?? []

      const grouped: CategoryWithDetails[] = catRowsTyped.map((c) => ({
        ...c,
        details: detailRowsTyped.filter(
          (d) => d.category_id === c.id
        ),
      }))

      // setCategories(grouped)
      // setLoading(false)

      //       const grouped: CategoryWithDetails[] =
      //   (catRows ?? []).map((c) => ({
      //     ...c,
      //     details: (detailRows ?? []).filter(
      //       (d) => d.category_id === c.id
      //     ),
      //   }))

      setCategories(grouped)
      setLoading(false)
    }

    load()
  }, [supabase])


  // helper อัปเดต state local
  function updateCategoryLocal(id: string, patch: Partial<CategoryWithDetails>) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    )
  }

  function updateDetailLocal(id: string, patch: Partial<AdviceDetail>) {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        details: c.details.map((d) =>
          d.id === id ? { ...d, ...patch } : d
        ),
      }))
    )
  }

  // -----------------------------
  // CRUD Category
  // -----------------------------
  async function handleSaveCategory(cat: CategoryWithDetails) {
    setSaving(true)
    const { error } = await supabase
      .from("advice_category")
      .update({
        name_th: cat.name_th,
        icon: cat.icon,
        color_hex: cat.color_hex,
        order_index: cat.order_index,
      })
      .eq("id", cat.id)

    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success("บันทึกหมวดสำเร็จ")
  }

  async function handleAddCategory() {
    setSaving(true)
    const lastOrder = categories.at(-1)?.order_index ?? 0

    const { data, error } = await supabase
      .from("advice_category")
      .insert({
        name_th: "หมวดใหม่",
        icon: "📊",
        color_hex: "#4B5563",
        order_index: (lastOrder ?? 0) + 1,
      })
      .select("id, name_th, icon, color_hex, order_index")
      .single()

    setSaving(false)
    if (error || !data) {
      toast.error(error?.message ?? "ไม่สามารถเพิ่มหมวดได้")
      return
    }

    setCategories((prev) => [...prev, { ...data, details: [] }])
    toast.success("เพิ่มหมวดใหม่แล้ว")
  }

  async function handleDeleteCategory(catId: string) {
    if (!window.confirm("ลบหมวดนี้และคำแนะนำทั้งหมดในหมวดนี้?")) return

    setSaving(true)
    const { error } = await supabase
      .from("advice_category")
      .delete()
      .eq("id", catId)

    setSaving(false)
    if (error) return toast.error(error.message)

    setCategories((prev) => prev.filter((c) => c.id !== catId))
    toast.success("ลบหมวดสำเร็จ")
  }

  // -----------------------------
  // CRUD Detail
  // -----------------------------
  async function handleSaveDetail(detail: AdviceDetail) {
    setSaving(true)
    const { error } = await supabase
      .from("advice_detail")
      .update({
        detail_th: detail.detail_th,
        order_index: detail.order_index,
      })
      .eq("id", detail.id)

    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success("บันทึกคำแนะนำสำเร็จ")
  }

  async function handleAddDetail(categoryId: string) {
    setSaving(true)

    const category = categories.find((c) => c.id === categoryId)
    const lastOrder = category?.details.at(-1)?.order_index ?? 0

    const { data, error } = await supabase
      .from("advice_detail")
      .insert({
        category_id: categoryId,
        detail_th: "คำแนะนำใหม่",
        order_index: (lastOrder ?? 0) + 1,
      })
      .select("id, category_id, detail_th, order_index")
      .single()

    setSaving(false)
    if (error || !data) {
      toast.error(error?.message ?? "ไม่สามารถเพิ่มคำแนะนำได้")
      return
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, details: [...c.details, data] }
          : c
      )
    )
    toast.success("เพิ่มคำแนะนำแล้ว")
  }

  async function handleDeleteDetail(id: string) {
    if (!window.confirm("ลบคำแนะนำนี้?")) return

    setSaving(true)
    const { error } = await supabase
      .from("advice_detail")
      .delete()
      .eq("id", id)

    setSaving(false)
    if (error) return toast.error(error.message)

    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        details: c.details.filter((d) => d.id !== id),
      }))
    )
    toast.success("ลบคำแนะนำสำเร็จ")
  }

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-white">
        <p className="text-sm text-text-secondary">กำลังโหลดข้อมูล...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8 text-white">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold">
            จัดการคำแนะนำทั่วไป
          </h1>
          <p className="max-w-3xl text-sm md:text-base text-text-secondary leading-relaxed">
            เพิ่ม / แก้ไขหมวดคำแนะนำทั่วไปและ bullet ต่าง ๆ ข้อมูลที่บันทึกจะถูกนำไปใช้ทันทีในคำเเนะนำทั่วไป
          </p>
        </div>

        <button
          onClick={handleAddCategory}
          disabled={saving}
          className="rounded-lg px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/40 text-white text-sm shadow-lg shadow-black/20
            hover:bg-white/25 hover:shadow-black/40 transition-all"
        >
          + เพิ่มหมวดใหม่
        </button>
      </header>

      {/* Categories */}
      <section className="space-y-4">
        {categories.map((cat) => (
          <details
            key={cat.id}
            className="group rounded-2xl bg-black/25 border border-white/25 px-4 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon || "📌"}</span>
                <div>
                  <p className="font-semibold text-xl">
                    {cat.name_th || "ไม่มีชื่อหมวด"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    ลำดับการแสดงผล: {cat.order_index ?? "-"}
                  </p>
                </div>
              </div>

              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full 
                           bg-white/10 text-[10px] font-bold 
                           transition-transform duration-150 group-open:rotate-180"
              >
                ˅
              </span>
            </summary>

            {/* ฟอร์มหมวด */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-text-secondary">ชื่อหมวด</label>
                <input
                  className="w-full rounded-md bg-black/40 border border-white/30 px-3 py-2 text-sm"
                  value={cat.name_th ?? ""}
                  onChange={(e) =>
                    updateCategoryLocal(cat.id, { name_th: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary">
                  ลำดับ
                </label>
                <input
                  type="number"
                  className="w-full rounded-md bg-black/40 border border-white/30 px-3 py-2 text-sm"
                  value={cat.order_index ?? ""}
                  onChange={(e) =>
                    updateCategoryLocal(cat.id, {
                      order_index: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary">ไอคอน</label>
                <select
                  className="w-full rounded-md bg-black/40 border border-white/30 px-3 py-2 text-sm"
                  value={cat.icon ?? ""}
                  onChange={(e) =>
                    updateCategoryLocal(cat.id, { icon: e.target.value })
                  }
                >
                  <option value="">-- เลือกไอคอน --</option>
                  {ICON_PRESETS.map((i) => (
                    <option key={i.key} value={i.emoji}>
                      {i.emoji} {i.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary">
                  สี header (color_hex)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-md bg-black/40 border border-white/30 px-3 py-2 text-sm"
                    value={cat.color_hex ?? ""}
                    onChange={(e) =>
                      updateCategoryLocal(cat.id, {
                        color_hex: e.target.value,
                      })
                    }
                  >
                    <option value="">-- เลือกสี --</option>
                    {COLOR_PRESETS.map((c) => (
                      <option key={c.key} value={c.hex}>
                        {c.key} ({c.hex})
                      </option>
                    ))}
                  </select>
                  <div
                    className="h-8 w-8 rounded-md border border-white/20"
                    style={{
                      backgroundColor: cat.color_hex || "#1F2937",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleSaveCategory(cat)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-xs font-medium bg-green-600/70 border border-white/20 hover:bg-green-600 disabled:opacity-60"
              >
                บันทึกหมวด
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-xs font-medium bg-red-600/70 hover:bg-red-600 disabled:opacity-60"
              >
                ลบหมวด
              </button>
            </div>

            {/* รายการคำแนะนำ */}
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold mt-8">
                รายการคำแนะนำในหมวดนี้
              </h3>

              {cat.details.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-xl bg-black/30 border border-white/20 px-3 py-3 space-y-2"
                >
                  <textarea
                    className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2 text-sm min-h-[60px]"
                    value={detail.detail_th}
                    onChange={(e) =>
                      updateDetailLocal(detail.id, {
                        detail_th: e.target.value,
                      })
                    }
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        ลำดับ:
                      </span>
                      <input
                        type="number"
                        className="w-20 rounded-md bg-black/40 border border-white/20 px-2 py-1 text-xs"
                        value={detail.order_index ?? ""}
                        onChange={(e) =>
                          updateDetailLocal(detail.id, {
                            order_index: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveDetail(detail)}
                        disabled={saving}
                        className="rounded-md px-3 py-1 text-xs bg-green-600/80 border border-white/20 hover:bg-green-600 disabled:opacity-60"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => handleDeleteDetail(detail.id)}
                        disabled={saving}
                        className="rounded-md px-3 py-1 text-xs bg-red-600/70 hover:bg-red-600 disabled:opacity-60"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => handleAddDetail(cat.id)}
                disabled={saving}
                className="mt-1 rounded-md px-3 py-1.5 text-xs font-medium bg-white/20 border border-white/20 hover:bg-white/35 disabled:opacity-60"
              >
                + เพิ่มคำแนะนำ
              </button>
            </div>
          </details>
        ))}
      </section>
    </main>
  )
}
