// export default function GetAdvicePage() {
//   return (
//     <div className="p-8 text-white">
//       <h1 className="text-2xl font-bold">Get-Advice-summary</h1>
//       <p className="text-gray-400 mt-2">
//         หน้านี้ยังอยู่ระหว่างการพัฒนา 🔧
//       </p>
//     </div>
//   )
// }


// src/app/user/get-advice/summary/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  useRouter,
  useSearchParams,
} from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


import { Loader2, ArrowLeft, Save, Sparkles } from "lucide-react"
import { toast } from "sonner"

type RequestRow = {
  request_id: number
  user_id: string
  total_budget: number | string
  created_at: string
}

type RequestItemRow = {
  request_item_id: number
  request_id: number
  category_id: number
  priority: number
  requested_qty: number
  product_category: {
    code: string | null
    display_name_th: string | null
  } | null
}

type ResultRow = {
  result_id: number
  request_item_id: number
  product_id: number
  rank: number
  rationale: string | null
  est_co2_saving: number | null
  co2_saving_per_baht: number | null
  product: {
    product_name: string
    brand: string | null
    price_thb: number | string
    category_id: number
    product_category: {
      code: string | null
      display_name_th: string | null
    } | null
  } | null
}

type DetailRow = {
  product_id: number
  [key: string]: any
}

type EnrichedResult = {
  resultId: number
  productId: number
  rank: number
  productName: string
  brand: string
  priceThb: number
  estCo2: number | null
  co2PerBaht: number | null
  rationale: string | null
  detail: DetailRow | null
}

type RecommendationGroup = {
  requestItemId: number
  categoryId: number
  categoryCode: string
  categoryNameTh: string
  priority: number
  qty: number
  results: EnrichedResult[]
}

type SummaryState = {
  requestId: number
  totalBudget: number
  createdAt: string
  groups: RecommendationGroup[]
}

const META_COLS = new Set(["product_id", "created_at", "updated_at", "is_active", "id"])

function formatNumber(value: any, digits = 2) {
  if (value === null || value === undefined) return "-"
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits,
  }).format(num)
}

export default function AdviceSummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [summary, setSummary] = useState<SummaryState | null>(null)
  const [savedResultIds, setSavedResultIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  // โหลดข้อมูลจาก request ล่าสุด / ตาม request_id ใน URL
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1) เช็ค user
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser()

        if (userErr) throw userErr
        if (!user) {
          setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง")
          toast.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง")
          return
        }
        setUserId(user.id)

        // 2) หา request_id
        const queryRequestId = searchParams.get("request_id")
        let activeRequestId: number | null = null

        if (queryRequestId) {
          const parsed = Number(queryRequestId)
          if (!Number.isNaN(parsed)) {
            activeRequestId = parsed
          }
        }

        // ถ้าไม่มีใน URL → ใช้ request ล่าสุดของ user
        if (!activeRequestId) {
          const { data: lastReq, error: lastErr } = await supabase
            .from("recommendation_request")
            .select("request_id,total_budget,created_at,user_id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          if (lastErr) throw lastErr
          if (!lastReq) {
            setError("ยังไม่มีคำขอคำแนะนำจาก AI")
            return
          }
          activeRequestId = lastReq.request_id
        }

        // 3) โหลด recommendation_request
        const { data: reqRow, error: reqErr } = await supabase
          .from("recommendation_request")
          .select("request_id,total_budget,created_at,user_id")
          .eq("request_id", activeRequestId)
          .single()

        if (reqErr) throw reqErr
        if (!reqRow) {
          setError("ไม่พบคำขอคำแนะนำที่เลือก")
          return
        }

        // 4) โหลด request_items + category
        const { data: itemRows, error: itemErr } = await supabase
          .from("recommendation_request_item")
          .select(
            `
          request_item_id,
          request_id,
          category_id,
          priority,
          requested_qty,
          product_category (
            code,
            display_name_th
          )
        `
          )
          .eq("request_id", activeRequestId)
          .order("priority", { ascending: true })

        if (itemErr) throw itemErr
        if (!itemRows || itemRows.length === 0) {
          setError("ยังไม่มีรายละเอียดหมวดสินค้าสำหรับคำขอนี้")
          return
        }

        const typedItems = itemRows as unknown as RequestItemRow[]
        const requestItemIds = typedItems.map((r) => r.request_item_id)

        // 5) โหลดผลลัพธ์ recommendation_result + product
        const { data: resultRows, error: resErr } = await supabase
          .from("recommendation_result")
          .select(
            `
          result_id,
          request_item_id,
          product_id,
          rank,
          rationale,
          est_co2_saving,
          co2_saving_per_baht,
          product (
            product_name,
            brand,
            price_thb,
            category_id,
            product_category (
              code,
              display_name_th
            )
          )
        `
          )
          .in("request_item_id", requestItemIds)
          .order("rank", { ascending: true })

        if (resErr) throw resErr
        if (!resultRows || resultRows.length === 0) {
          setError("งบที่กรอกนั้นไม่พอสำหรับการแนะนำสินค้าในคำขอนี้")
          return
        }

        const typedResults = resultRows as unknown as ResultRow[]
        const allResultIds = typedResults.map((r) => r.result_id)

        // 6) โหลดว่ามี product ไหนถูก "บันทึกสินค้า" ไว้แล้วบ้าง
        const { data: savedRows, error: savedErr } = await supabase
          .from("recommendation_saved_product")
          .select("result_id")
          .eq("user_id", user.id)
          .in("result_id", allResultIds)

        if (savedErr) throw savedErr
        setSavedResultIds(
          savedRows?.map((r: { result_id: number }) => r.result_id) ?? []
        )

        // 7) เตรียม map category → product_ids สำหรับดึงตารางรายละเอียด
        const categoryProductMap: Record<string, Set<number>> = {}

        for (const r of typedResults) {
          const code =
            r.product?.product_category?.code ??
            typedItems.find((it) => it.request_item_id === r.request_item_id)?.product_category?.code ??
            ""
          if (!code) continue
          if (!categoryProductMap[code]) {
            categoryProductMap[code] = new Set<number>()
          }
          categoryProductMap[code].add(r.product_id)
        }

        // 8) ดึงรายละเอียดจากตารางสินค้าแต่ละประเภท (ev_car, fan, light_bulb, ...)
        const detailMap: Record<string, Record<number, DetailRow>> = {}

        await Promise.all(
          Object.entries(categoryProductMap).map(async ([code, ids]) => {
            const tableName = code // code กับชื่อตารางเหมือนกันใน schema นี้
            const { data, error } = await supabase
              .from(tableName)
              .select("*")
              .in("product_id", Array.from(ids))

            if (error) {
              console.error(`โหลดรายละเอียดจากตาราง ${tableName} ล้มเหลว:`, error)
              return
            }

            const rows = (data ?? []) as DetailRow[]
            detailMap[code] = {}
            rows.forEach((row) => {
              detailMap[code][row.product_id] = row
            })
          })
        )

        // 9) ประกอบข้อมูลเป็น group ต่อหมวด / request_item
        const groups: RecommendationGroup[] = typedItems.map((item) => {
          const code = item.product_category?.code ?? "unknown"
          const nameTh = item.product_category?.display_name_th ?? `หมวด ${item.category_id}`

          const resultsForItem = typedResults
            .filter((r) => r.request_item_id === item.request_item_id)
            .sort((a, b) => a.rank - b.rank)

          const enriched: EnrichedResult[] = resultsForItem.map((r) => {
            const prod = r.product
            const categoryCode = prod?.product_category?.code ?? code
            const detail =
              detailMap[categoryCode]?.[r.product_id] ??
              null

            return {
              resultId: r.result_id,
              productId: r.product_id,
              rank: r.rank,
              productName: prod?.product_name ?? "-",
              brand: prod?.brand ?? "",
              priceThb: Number(prod?.price_thb ?? 0),
              estCo2: r.est_co2_saving,
              co2PerBaht: r.co2_saving_per_baht,
              rationale: r.rationale,
              detail,
            }
          })

          return {
            requestItemId: item.request_item_id,
            categoryId: item.category_id,
            categoryCode: code,
            categoryNameTh: nameTh,
            priority: item.priority,
            qty: item.requested_qty,
            results: enriched,
          }
        })

        const totalBudget = Number(reqRow.total_budget ?? 0)

        setSummary({
          requestId: reqRow.request_id,
          totalBudget,
          createdAt: reqRow.created_at,
          groups,
        })
      } catch (e: any) {
        console.error("❌ load summary error =", e)
        setError("โหลดผลการแนะนำสินค้าไม่สำเร็จ")
        toast.error("โหลดผลการแนะนำสินค้าไม่สำเร็จ")
      } finally {
        setLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const isAnyLoading = loading

  const totalCategories = useMemo(
    () => summary?.groups.length ?? 0,
    [summary],
  )

  const handleSaveGroup = async (group: RecommendationGroup) => {
    if (!userId) {
      toast.error("กรุณาเข้าสู่ระบบก่อนบันทึกสินค้า")
      return
    }

    if (group.results.length === 0) {
      toast.error("ไม่มีสินค้าให้บันทึกในหมวดนี้")
      return
    }

    try {
      setSavingMap((prev) => ({ ...prev, [group.requestItemId]: true }))

      // เลือกเฉพาะ result ที่ยังไม่ถูกบันทึกมาก่อน
      const unsavedResults = group.results.filter(
        (r) => !savedResultIds.includes(r.resultId),
      )

      if (unsavedResults.length === 0) {
        toast.success("หมวดนี้ถูกบันทึกสินค้าไว้แล้ว")
        return
      }

      const rows = unsavedResults.map((r) => ({
        user_id: userId,
        result_id: r.resultId,
        product_id: r.productId,
      }))

      const { error } = await supabase
        .from("recommendation_saved_product")
        .insert(rows)

      if (error) {
        console.error(error)
        toast.error("บันทึกสินค้าไม่สำเร็จ")
        return
      }

      setSavedResultIds((prev) => [
        ...prev,
        ...unsavedResults.map((r) => r.resultId),
      ])
      toast.success("บันทึกสินค้าสำเร็จสำหรับหมวดนี้")
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดระหว่างบันทึกสินค้า")
    } finally {
      setSavingMap((prev) => ({ ...prev, [group.requestItemId]: false }))
    }
  }

  if (isAnyLoading) {
    return (
      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20 text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          <p className="text-sm text-muted-foreground">
            กำลังโหลดผลการแนะนำสินค้า...
          </p>
        </div>
      </main>
    )
  }

  if (!summary || error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-foreground">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/user/get-advice")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">
            ผลการแนะนำสินค้าโดย AI
          </h1>
        </div>
        <Card className="bg-black/30 border border-red-500/40">
          <CardContent className="py-10 text-center text-sm text-red-300">
            {error ?? "งบที่กรอกอาจไม่พอ ทำให้ยังไม่มีผลการแนะนำ"}
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 text-foreground space-y-8">
      {/* หัวข้อรวม */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.push("/user/get-advice")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button> */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-semibold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-400" />
                ผลการแนะนำสินค้าโดย AI

              </h1>
              <p className="text-xs md:text-base text-muted-foreground mt-3">
                งบประมาณรวมที่ใช้:{" "}
                <span className="font-medium text-emerald-300">
                  {formatNumber(summary.totalBudget)} บาท
                </span>{"  "}
                หมวดที่ขอคำแนะนำ:{" "}
                <span className="font-medium text-emerald-300">
                  {totalCategories} หมวด
                </span>
              </p>
            </div>
          </div>

          {/* <div className="flex flex-col items-end gap-2 text-right text-xs md:text-sm text-muted-foreground">
            <span>
              Request ID:{" "}
              <span className="font-mono text-emerald-300">
                {summary.requestId}
              </span>
            </span>
          </div> */}
        </div>
      </section>

      {/* แสดงผลทีละหมวด */}
      <section className="space-y-6">
        {summary.groups.map((group, index) => {
          const alreadySaved =
            group.results.length > 0 &&
            group.results.every((r) =>
              savedResultIds.includes(r.resultId),
            )

          const firstDetail = group.results[0]?.detail
          const detailKeys = firstDetail
            ? Object.keys(firstDetail).filter(
              (k) => !META_COLS.has(k),
            )
            : []

          return (
            <Card
              key={group.requestItemId}
              className="bg-black/40 border border-emerald-500/25 shadow-lg"
            >
              <CardHeader className="border-b border-white/10 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-base font-semibold text-emerald-300">
                      {index + 1}
                    </div>
                    <span className="text-sm text-emerald-200">หมวดที่ {index + 1}</span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <CardTitle className="text-xl md:text-2xl font-semibold text-foreground flex flex-wrap items-center gap-2">
                      {group.categoryNameTh}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
                        <Badge className="bg-emerald-600/20 text-emerald-200 px-3 py-0.5 rounded-full hover:bg-emerald-600/20 hover:text-emerald-200 transition-none">
                          Priority {group.priority} {group.priority === 1 && "– สำคัญที่สุด"}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/10 text-white/80 px-3 py-0.5 rounded-full hover:bg-white/10 hover:text-white/80 transition-none">
                          จำนวนที่ต้องการ: <span className="font-semibold ml-1">{group.qty}</span> ชิ้น
                        </Badge>
                      </div>
                    </CardTitle>
                    <span className="text-muted-foreground ml-auto text-[11px] md:text-xs">
                      แสดงอันดับ 1–3 จากสินค้าในหมวดนี้
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-4">
                {/* สรุปแบบข้อความ */}
                <div className="space-y-1 text-xs md:text-base text-muted-foreground">
                  {group.results.length === 0 ? (
                    <p className="italic text-red-300/80">
                      งบไม่พอหรือยังไม่มีสินค้าในงบนี้สำหรับหมวดนี้
                    </p>
                  ) : (
                    group.results.map((r) => (
                      <p
                        key={r.resultId}
                        className="leading-relaxed"
                      >
                        <span className="font-semibold text-emerald-300">
                          อันดับที่ {r.rank}:
                        </span>{" "}
                        <span className="text-muted-foreground">แนะนำสินค้า </span>
                        <span className="text-foreground font-semibold">{r.productName}</span>
                        {r.brand && (
                          <>
                            <span className="text-muted-foreground"> แบรนด์ </span>
                            <span className="text-foreground font-semibold">{r.brand}</span>
                          </>
                        )}
                        {typeof r.estCo2 === "number" && (
                          <>
                            {" "}
                            – ลด CO₂{" "}
                            <span className="font-bold text-emerald-200">
                              {formatNumber(r.estCo2)}
                            </span>{" "}
                            kg/ปี
                          </>
                        )}
                        {typeof r.co2PerBaht === "number" && (
                          <>
                            {" "}
                            <span className="text-foreground font-semibold">เเละ  </span>
                            ลด CO₂ ≈{" "}
                            <span className="font-bold text-emerald-200">
                              {formatNumber(r.co2PerBaht, 4)}
                            </span>{" "}
                            CO₂/บาท
                          </>
                        )}
                      </p>
                    ))
                  )}
                </div>



                {/* ตารางรายละเอียด */}
                {group.results.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs md:text-base font-medium text-foreground">
                      รายละเอียดสินค้าอันดับ 1–3 ในหมวดนี้
                    </p>

                    <ScrollArea className="w-full rounded-md border border-white/20 bg-black/40">
                      {/* ให้เนื้อหาข้างในกว้างเท่าตาราง แล้วเลื่อนใน ScrollArea แทน */}
                      <div className="min-w-max">
                        <table className="w-full border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-white/5 text-left text-[11px] md:text-xs uppercase tracking-wide text-muted-foreground divide-x divide-white/20">
                              <th className="px-4 py-2 border-b border-white/20">อันดับ</th>
                              <th className="px-4 py-2 border-b border-white/20">ชื่อสินค้า</th>
                              <th className="px-4 py-2 border-b border-white/20">ยี่ห้อ</th>
                              <th className="px-4 py-2 border-b border-white/20">ราคา (บาท)</th>
                              {detailKeys.map((key) => (
                                <th key={key} className="px-4 py-2 border-b border-white/20">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.results.map((r, idx) => {
                              const detail = r.detail
                              return (
                                <tr
                                  key={r.resultId}
                                  className={idx % 2 === 0 ? "bg-black/30 divide-x divide-white/20" : "bg-black/10 divide-x divide-white/20"}
                                >
                                  <td className="px-4 py-2 border-b border-white/10">
                                    {r.rank}
                                  </td>
                                  <td className="px-4 py-2 border-b border-white/10">
                                    {r.productName}
                                  </td>
                                  <td className="px-4 py-2 border-b border-white/10">
                                    {r.brand || "-"}
                                  </td>
                                  <td className="px-4 py-2 border-b border-white/10">
                                    {formatNumber(r.priceThb)}
                                  </td>
                                  {detailKeys.map((key) => (
                                    <td
                                      key={key}
                                      className="px-4 py-2 border-b border-white/10"
                                    >
                                      {detail ? formatNumber(detail[key]) : "-"}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* แถบเลื่อนแนวนอน */}
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                )}


                {/* ปุ่มบันทึกสินค้า */}
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/80 px-4 py-2 text-xs md:text-sm font-semibold text-black shadow-lg hover:bg-emerald-500 disabled:bg-emerald-700/60 disabled:text-emerald-100/60"
                    onClick={() => handleSaveGroup(group)}
                    disabled={
                      savingMap[group.requestItemId] ||
                      group.results.length === 0
                    }
                  >
                    {alreadySaved ? (
                      <>
                        <Save className="h-4 w-4" />
                        บันทึกแล้ว (หมวดนี้)
                      </>
                    ) : savingMap[group.requestItemId] ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        บันทึกสินค้า (หมวดนี้)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </main>
  )
}
