// // src/app/admin/products/page.tsx

// export default function productPage() {
//   return (
//     <div className="p-8 text-white">
//       <h1 className="text-2xl font-bold">product</h1>
//       <p className="text-gray-400 mt-2">
//         หน้านี้ยังอยู่ระหว่างการพัฒนา 🔧
//       </p>
//     </div>
//   )
// }


// src/app/admin/product/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// ---------- Types ----------
type ProductCategory = {
  category_id: number
  category_name: string | null
  code: string | null
  display_name_th: string | null
}

type ProductRow = {
  product_id: number | string // string ชั่วคราวตอนสร้างใหม่
  category_id: number
  product_name: string | null
  brand: string | null
  price_thb: number | null
  // flag UI
  _isNew?: boolean
  _isSaving?: boolean
}

type SpecRow = Record<string, any>

// ---------- Supabase client ----------
const supabase = createClient()

export default function AdminProductPage() {
  // หมวดหมู่ / product / spec state
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  const [products, setProducts] = useState<ProductRow[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // สำหรับ editor รายละเอียด (ตาราง spec)
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null)
  const [specRow, setSpecRow] = useState<SpecRow | null>(null)
  const [loadingSpec, setLoadingSpec] = useState(false)
  const [savingSpec, setSavingSpec] = useState(false)

  // ---------- คำนวณ category ปัจจุบัน ----------
  const activeCategory = useMemo(
    () => categories.find((c) => c.category_id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  )

  // ------------------------------------------------
  // 1) โหลดหมวดหมู่ทั้งหมดจาก product_category
  // ------------------------------------------------
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true)
      const { data, error } = await supabase
        .from("product_category")
        .select("category_id, category_name, code, display_name_th")
        .order("category_id", { ascending: true })

      setLoadingCategories(false)

      if (error) {
        console.error(error)
        toast.error("โหลดหมวดหมู่ไม่สำเร็จ")
        return
      }

      const catList = (data ?? []) as ProductCategory[]
      setCategories(catList)

      // ตั้ง active category ตัวแรกถ้ายังไม่ได้เลือก
      if (!activeCategoryId && catList.length > 0) {
        setActiveCategoryId(catList[0].category_id)
      }
    }

    loadCategories()
  }, [activeCategoryId])

  // ------------------------------------------------
  // 2) โหลดสินค้าในหมวดที่เลือก (ตาราง product)
  // ------------------------------------------------
  useEffect(() => {
    if (!activeCategoryId) return

    async function loadProducts() {
      setLoadingProducts(true)

      const { data, error } = await supabase
        .from("product")
        .select("product_id, product_name, category_id, brand, price_thb")
        .eq("category_id", activeCategoryId)
        .order("product_id", { ascending: true })

      setLoadingProducts(false)

      if (error) {
        console.error(error)
        toast.error("โหลดสินค้าของหมวดนี้ไม่สำเร็จ")
        return
      }

      const rows: ProductRow[] = (data ?? []).map((row: any) => ({
        ...row,
        _isNew: false,
        _isSaving: false,
      }))

      setProducts(rows)
      setSelectedProduct(null)
      setSpecRow(null)
    }

    loadProducts()
  }, [activeCategoryId])

  // ------------------------------------------------
  // 3) CRUD: สินค้า (ตาราง product)
  // ------------------------------------------------

  function addProductRow() {
    if (!activeCategoryId) return

    const tempId = `new-${Date.now()}`
    setProducts((prev) => [
      ...prev,
      {
        product_id: tempId, // ชั่วคราว
        category_id: activeCategoryId,
        product_name: "",
        brand: "",
        price_thb: null,
        _isNew: true,
        _isSaving: false,
      },
    ])
  }

  function updateProductLocal(
    id: ProductRow["product_id"],
    field: keyof Pick<ProductRow, "product_name" | "brand" | "price_thb">,
    value: string,
  ) {
    setProducts((prev) =>
      prev.map((row) =>
        row.product_id === id
          ? {
            ...row,
            [field]:
              field === "price_thb"
                ? value === ""
                  ? null
                  : Number(value)
                : value,
          }
          : row,
      ),
    )
  }

  async function saveProduct(row: ProductRow) {
    if (!activeCategoryId) {
      toast.error("ยังไม่ได้เลือกหมวดหมู่")
      return
    }
    if (!row.product_name || row.product_name.trim() === "") {
      toast.error("กรุณากรอกชื่อสินค้า")
      return
    }

    const payload = {
      category_id: activeCategoryId,
      product_name: row.product_name.trim(),
      brand: row.brand?.trim() || null,
      price_thb: row.price_thb ?? null,
    }

    setProducts((prev) =>
      prev.map((r) =>
        r.product_id === row.product_id ? { ...r, _isSaving: true } : r,
      ),
    )

    // INSERT
    if (row._isNew) {
      const { data, error } = await supabase
        .from("product")
        .insert(payload)
        .select("product_id, product_name, category_id, brand, price_thb")
        .maybeSingle()

      if (error || !data) {
        console.error(error)
        toast.error("เพิ่มสินค้าไม่สำเร็จ")
        setProducts((prev) =>
          prev.map((r) =>
            r.product_id === row.product_id ? { ...r, _isSaving: false } : r,
          ),
        )
        return
      }

      const newRow: ProductRow = {
        ...data,
        _isNew: false,
        _isSaving: false,
      }

      setProducts((prev) =>
        prev
          .map((r) =>
            r.product_id === row.product_id ? newRow : r,
          )
          .sort((a, b) => Number(a.product_id) - Number(b.product_id)),
      )

      // สร้างแถวในตารางรายละเอียดของ category นี้ (เฉพาะ product_id)
      if (activeCategory?.code) {
        try {
          await supabase
            .from(activeCategory.code)
            .insert({ product_id: newRow.product_id })
        } catch (e) {
          console.warn("สร้างแถวรายละเอียดไม่สำเร็จ (ไม่ critical):", e)
        }
      }

      toast.success("เพิ่มสินค้าแล้ว")
    }
    // UPDATE
    else {
      const { error } = await supabase
        .from("product")
        .update(payload)
        .eq("product_id", row.product_id)

      if (error) {
        console.error(error)
        toast.error("บันทึกสินค้าไม่สำเร็จ")
        setProducts((prev) =>
          prev.map((r) =>
            r.product_id === row.product_id ? { ...r, _isSaving: false } : r,
          ),
        )
        return
      }

      setProducts((prev) =>
        prev
          .map((r) =>
            r.product_id === row.product_id
              ? { ...row, _isNew: false, _isSaving: false }
              : r,
          )
          .sort((a, b) => Number(a.product_id) - Number(b.product_id)),
      )

      toast.success("บันทึกสินค้าแล้ว")
    }
  }

  async function deleteProduct(row: ProductRow) {
    if (row._isNew) {
      // ยังไม่เคย save ลบทิ้งจาก state ได้เลย
      setProducts((prev) => prev.filter((r) => r.product_id !== row.product_id))
      if (selectedProduct?.product_id === row.product_id) {
        setSelectedProduct(null)
        setSpecRow(null)
      }
      return
    }

    const ok = window.confirm(`ต้องการลบสินค้า "${row.product_name}" หรือไม่?`)
    if (!ok) return

    // ลบรายละเอียดก่อน (ถ้าตารางมี on delete cascade จะลบซ้ำอีกครั้งก็ไม่เป็นไร)
    if (activeCategory?.code) {
      try {
        await supabase
          .from(activeCategory.code)
          .delete()
          .eq("product_id", row.product_id)
      } catch (e) {
        console.warn("ลบรายละเอียดไม่สำเร็จ (ไม่ critical):", e)
      }
    }

    const { error } = await supabase
      .from("product")
      .delete()
      .eq("product_id", row.product_id)

    if (error) {
      console.error(error)
      toast.error("ลบสินค้าไม่สำเร็จ")
      return
    }

    setProducts((prev) => prev.filter((r) => r.product_id !== row.product_id))
    if (selectedProduct?.product_id === row.product_id) {
      setSelectedProduct(null)
      setSpecRow(null)
    }
    toast.success("ลบสินค้าแล้ว")
  }

  // ------------------------------------------------
  // 4) โหลด / บันทึกตารางรายละเอียด (12 ตาราง spec)
  //     ใช้ code ใน product_category เป็นชื่อ table
  // ------------------------------------------------

  async function openSpecEditor(row: ProductRow) {
    if (!activeCategory?.code) {
      toast.error("หมวดนี้ไม่มี code")
      return
    }

    setSelectedProduct(row)
    setLoadingSpec(true)
    setSpecRow(null)

    const tableName = activeCategory.code

    // ลอง select แถวรายละเอียดก่อน
    let { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("product_id", row.product_id)
      .maybeSingle()

    // ถ้ายังไม่มี (null) ให้สร้างแถวใหม่ โดยใส่แค่ product_id
    if (!data && !error) {
      const insertRes = await supabase
        .from(tableName)
        .insert({ product_id: row.product_id })
        .select("*")
        .maybeSingle()
      data = insertRes.data
      error = insertRes.error
    }

    setLoadingSpec(false)

    if (error || !data) {
      console.error(error)
      toast.error("โหลดรายละเอียดสินค้าไม่สำเร็จ")
      return
    }

    setSpecRow(data as SpecRow)
  }

  function updateSpecLocal(field: string, value: string) {
    setSpecRow((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  async function saveSpec() {
    if (!activeCategory?.code || !selectedProduct || !specRow) return

    const tableName = activeCategory.code
    const payload: SpecRow = { ...specRow }
    // ไม่ให้แก้ product_id ผ่าน payload
    delete payload.product_id

    setSavingSpec(true)

    const { error } = await supabase
      .from(tableName)
      .update(payload)
      .eq("product_id", selectedProduct.product_id)

    setSavingSpec(false)

    if (error) {
      console.error(error)
      toast.error("บันทึกรายละเอียดสินค้าไม่สำเร็จ")
      return
    }

    toast.success("บันทึกรายละเอียดสินค้าแล้ว")
  }

  // ------------------------------------------------
  // 5) UI
  // ------------------------------------------------
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-white space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">ตารางสินค้าทั้งระบบ</h1>
        <p className="max-w-3xl text-sm md:text-base text-text-secondary leading-relaxed">
          เพิ่ม / แก้ไขหมวดสินค้า และรายละเอียดสินค้าทั้งหมด ข้อมูลที่บันทึกจะถูกนำไปใช้ทันทีในระบบแนะนำ
        </p>
      </header>

      {/* หมวดหมู่สินค้า (pills) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {loadingCategories ? (
            <span className="text-xs text-text-secondary">
              กำลังโหลดหมวดหมู่...
            </span>
          ) : categories.length === 0 ? (
            <span className="text-xs text-text-secondary">
              ยังไม่มีหมวดหมู่สินค้าในฐานข้อมูล
            </span>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveCategoryId(cat.category_id)}
                className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${activeCategoryId === cat.category_id
                    ? "bg-white text-black border-white"
                    : "bg-black/30 border-white/40 text-text-secondary hover:bg-white/10"
                  }`}
              >
                {cat.display_name_th || cat.category_name || `หมวด ${cat.category_id}`}
              </button>
            ))
          )}
        </div>

        {activeCategory && (
          <p className="text-2xl text-text-secondary mt-6">
            🔍 หมวดที่เลือก:{" "}
            <span className="font-medium text-emerald-300">
              {activeCategory.display_name_th || activeCategory.category_name}
            </span>{" "}
            <span className="font-medium text-emerald-300">
              ({activeCategory.code})
            </span>
          </p>
        )}
      </section>

      {/* ตารางสินค้าในหมวดที่เลือก */}
      <section className="space-y-4 rounded-3xl bg-black/30 border border-white/25 px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-2xl font-semibold">
              รายการสินค้าในหมวดนี้
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              📌 สามารถแก้ไขชื่อสินค้า, ยี่ห้อ, ราคา, เพิ่ม/ลบสินค้าได้
            </p>
          </div>
          <Button
            size="sm"
            onClick={addProductRow}
            className="h-9 rounded-lg px-4 bg-white/10 backdrop-blur-sm border border-white/40 text-white text-sm shadow-lg shadow-black/20 hover:bg-white/20 hover:shadow-black/30 transition-all"
            //className="h-9 rounded-lg px-4 bg-amber-400/10 backdrop-blur-sm border border-amber-400/80 text-amber-400 text-sm shadow-lg shadow-black/20 hover:bg-amber-400/20 hover:shadow-black/30 transition-all"
            disabled={!activeCategoryId}
          >
            + เพิ่มสินค้า
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/40">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-2 text-left w-[34%]">ชื่อสินค้า</th>
                <th className="px-4 py-2 text-left w-[26%]">ยี่ห้อ (Brand)</th>
                <th className="px-4 py-2 text-left w-[18%]">ราคา (บาท)</th>
                <th className="px-4 py-2 text-left w-[22%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loadingProducts ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-center text-text-secondary"
                  >
                    กำลังโหลดรายการสินค้า...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-center text-text-secondary"
                  >
                    ยังไม่มีสินค้าในหมวดนี้
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr
                    key={row.product_id}
                    className="border-t border-white/10 hover:bg-white/10"
                  >
                    <td className="px-4 py-2 align-top">
                      <Input
                        value={row.product_name ?? ""}
                        onChange={(e) =>
                          updateProductLocal(
                            row.product_id,
                            "product_name",
                            e.target.value,
                          )
                        }
                        className="h-9 bg-black/40 border-white/30 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <Input
                        value={row.brand ?? ""}
                        onChange={(e) =>
                          updateProductLocal(row.product_id, "brand", e.target.value)
                        }
                        className="h-9 bg-black/40 border-white/30 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={row.price_thb ?? ""}
                        onChange={(e) =>
                          updateProductLocal(
                            row.product_id,
                            "price_thb",
                            e.target.value,
                          )
                        }
                        className="h-9 bg-black/40 border-white/30 text-sm"
                        placeholder="เช่น 199000"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-md bg-green-600/70 text-white text-xs hover:bg-green-600"
                          disabled={row._isSaving}
                          onClick={() => saveProduct(row)}
                        >
                          {row._isSaving ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-3 rounded-md bg-red-600/70 hover:bg-red-600 text-xs"
                          onClick={() => deleteProduct(row)}
                        >
                          ลบ
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/40 text-xs text-white shadow-lg shadow-black/20 
                          hover:bg-white/20 hover:shadow-black/30 transition-all"
                          onClick={() => openSpecEditor(row)}
                        >
                          รายละเอียด
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Panel รายละเอียดสินค้า (ตาราง spec) */}
      {selectedProduct && (
        <section className="space-y-4 rounded-3xl bg-black/25 border border border-white/25 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-2xl font-semibold">
                รายละเอียดสินค้า (ตาราง {activeCategory?.code})
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                📌 แก้ไขข้อมูลรายละเอียดทั้งหมดของสินค้า
                สำหรับตารางผลิตภัณฑ์ของหมวดนี้
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              // className="h-8 px-3 rounded-md border-white/30 text-xs bg-black/40 hover:bg-black/60"
              className="gap-1 border-red-600/70 text-red-600 bg-black/30 hover:bg-red-600/50"
              onClick={() => {
                setSelectedProduct(null)
                setSpecRow(null)
              }}
            >
              ปิด
            </Button>
          </div>

          <p className="text-sm mt-10">
            สินค้า:{" "}
            <span className="font-semibold text-emerald-300">
              {selectedProduct.product_name} ({selectedProduct.brand})
            </span>
          </p>

          {loadingSpec ? (
            <p className="text-sm text-text-secondary">กำลังโหลดข้อมูล...</p>
          ) : !specRow ? (
            <p className="text-sm text-red-400">
              ไม่พบข้อมูลรายละเอียดในตาราง {activeCategory?.code}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(specRow)
                .filter(([key]) => key !== "product_id" && key !== "created_at")
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-text-secondary">
                      {key}
                    </label>
                    <Input
                      value={value ?? ""}
                      onChange={(e) => updateSpecLocal(key, e.target.value)}
                      className="h-9 bg-black/40 border-white/25 text-sm"
                    />
                  </div>
                ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              className="h-9 px-4 rounded-lg bg-black/30 border border-emerald-500/70 text-emerald-500 text-sm hover:bg-emerald-500/50 hover:text-white"
              // className="h-9 px-4 rounded-lg bg-white/90 text-black text-sm hover:bg-white"
              //gap-1 border-red-600/70 text-red-600 bg-black/30 hover:bg-red-600/50
              onClick={saveSpec}
              disabled={savingSpec || !specRow}
            >
              {savingSpec ? "กำลังบันทึก..." : "บันทึกรายละเอียด"}
            </Button>
          </div>
        </section>
      )}
    </main>
  )
}
