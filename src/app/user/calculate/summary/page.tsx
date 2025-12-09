// src/app/calculate/summary/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { toast } from "sonner"
import { Loader2, ArrowLeft, FileDown, RefreshCw } from "lucide-react"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

const supabase = createClient()

type FieldType = "number" | "dropdown" | "text"

type ScopeRow = {
  scope_id: number
  scope_name: string | null
}

type ActivityRow = {
  activity_id: number
  activity_name: string | null
  scope_id: number
}

type ActivityFieldRow = {
  field_id: number
  activity_id: number
  field_label: string
  field_order: number | null
}

type OptionItemRow = {
  option_id: number
  display_name: string
}

type UnitRow = {
  unit_id: number
  name: string
  symbol: string | null
  code: string | null
}

type CarbonLogRow = {
  input_id: number
  scope_id: number
  co2e_kg: number | null
}

type CarbonInputRow = {
  input_id: number
  activity_id: number
  field_id: number
  submitted_at: string
  value_num: number | null
  unit_id: number | null
  option_id: number | null
  field_type_cached: FieldType
}

type ScopeSummary = {
  scope_id: number
  scope_name: string
  totalCo2eKg: number
  entryCount: number
}

type ChartDatum = {
  name: string
  value: number
}

type DetailPair = {
  label: string
  value: string
  order: number
}

type DetailItem = {
  key: string
  scopeId: number
  scopeName: string
  activityId: number
  activityName: string
  submittedAt: string
  pairs: DetailPair[]
  totalCo2eKg: number // ✅ carbon per item
}

function formatNumber(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "0.00"
  return Number(n).toFixed(digits)
}

function formatSmartNumber(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "-"
  const num = Number(n)
  return Number.isInteger(num) ? String(num) : formatNumber(num, 2)
}

function unitLabel(u: UnitRow | null | undefined) {
  if (!u) return ""
  return u.symbol || u.code || u.name || ""
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

const PIE_COLORS = ["#facc15", "#22d3ee", "#a78bfa"]

function scopeTheme(scopeId: number) {
  if (scopeId === 1) {
    return {
      band: "from-yellow-500/35 via-yellow-400/10 to-transparent",
      chip: "bg-yellow-400/10 border-yellow-300/20 text-white",
      accentText: "text-yellow-200",
      dot: "bg-yellow-400",
    }
  }
  if (scopeId === 2) {
    return {
      band: "from-cyan-500/35 via-cyan-400/10 to-transparent",
      chip: "bg-cyan-400/10 border-cyan-300/20 text-white",
      accentText: "text-cyan-200",
      dot: "bg-cyan-400",
    }
  }
  // return {
  //   band: "from-sky-500/35 via-sky-400/10 to-transparent",
  //   chip: "bg-sky-400/10 border-sky-300/20 text-sky-50",
  //   accentText: "text-sky-200",
  //   dot: "bg-sky-400",
  // }
  return {
    band: "from-purple-600/35 via-purple-500/10 to-transparent",
    chip: "bg-purple-500/10 border-purple-400/20 text-white",
    accentText: "text-purple-300",
    dot: "bg-purple-400",
  }
}

export default function SummaryPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [scopeSummaries, setScopeSummaries] = useState<ScopeSummary[]>([])
  const [detailsByScope, setDetailsByScope] = useState<Record<number, DetailItem[]>>({})
  const [showAllByScope, setShowAllByScope] = useState<Record<number, boolean>>({})
  const [printedAt, setPrintedAt] = useState<string | null>(null)

  useEffect(() => {
    setPrintedAt(new Date().toLocaleString())
  }, [])

  async function loadSummaryAndDetails() {
    try {
      setLoading(true)

      const [
        scopeRes,
        logRes,
        activityRes,
        fieldRes,
        optionRes,
        unitRes,
        ciRes,
      ] = await Promise.all([
        supabase
          .from("scope")
          .select("scope_id, scope_name")
          .order("scope_id", { ascending: true }),
        supabase
          .from("carbon_calculation_log")
          .select("input_id, scope_id, co2e_kg"),
        supabase
          .from("activity")
          .select("activity_id, activity_name, scope_id"),
        supabase
          .from("activity_field")
          .select("field_id, activity_id, field_label, field_order"),
        supabase
          .from("option_item")
          .select("option_id, display_name"),
        supabase
          .from("unit")
          .select("unit_id, name, symbol, code"),
        supabase
          .from("carbon_input")
          .select(
            "input_id, activity_id, field_id, submitted_at, value_num, unit_id, option_id, field_type_cached",
          )
          .order("submitted_at", { ascending: false })
          .limit(500),
      ])

      if (scopeRes.error) throw scopeRes.error
      if (logRes.error) throw logRes.error
      if (activityRes.error) throw activityRes.error
      if (fieldRes.error) throw fieldRes.error
      if (optionRes.error) throw optionRes.error
      if (unitRes.error) throw unitRes.error
      if (ciRes.error) throw ciRes.error

      const scopes = (scopeRes.data ?? []) as ScopeRow[]
      const logs = (logRes.data ?? []) as CarbonLogRow[]
      const activities = (activityRes.data ?? []) as ActivityRow[]
      const fields = (fieldRes.data ?? []) as ActivityFieldRow[]
      const options = (optionRes.data ?? []) as OptionItemRow[]
      const units = (unitRes.data ?? []) as UnitRow[]
      const inputs = (ciRes.data ?? []) as CarbonInputRow[]

      // ✅ map input_id -> co2e sum
      const co2eByInputId = new Map<number, number>()
      for (const r of logs) {
        if (r.input_id == null || r.co2e_kg == null) continue
        co2eByInputId.set(
          r.input_id,
          (co2eByInputId.get(r.input_id) ?? 0) + Number(r.co2e_kg),
        )
      }

      // --------- SUMMARY (รวม co2e ตาม scope) ----------
      const totalByScope: Record<number, number> = {}
      const countByScope: Record<number, number> = {}

      for (const row of logs) {
        if (row.scope_id == null || row.co2e_kg == null) continue
        const sid = row.scope_id
        totalByScope[sid] = (totalByScope[sid] ?? 0) + Number(row.co2e_kg)
        countByScope[sid] = (countByScope[sid] ?? 0) + 1
      }

      const summaries: ScopeSummary[] = scopes.map((s) => ({
        scope_id: s.scope_id,
        scope_name: s.scope_name ?? `Scope ${s.scope_id}`,
        totalCo2eKg: totalByScope[s.scope_id] ?? 0,
        entryCount: countByScope[s.scope_id] ?? 0,
      }))

      setScopeSummaries(summaries)

      // --------- DETAILS (1 รายการ = 1 ครั้งกด “เสร็จสิ้น”) ----------
      const scopeMap = new Map<number, ScopeRow>(scopes.map((s) => [s.scope_id, s]))
      const actMap = new Map<number, ActivityRow>(activities.map((a) => [a.activity_id, a]))
      const fieldMap = new Map<number, ActivityFieldRow>(fields.map((f) => [f.field_id, f]))
      const optMap = new Map<number, OptionItemRow>(options.map((o) => [o.option_id, o]))
      const unitMap = new Map<number, UnitRow>(units.map((u) => [u.unit_id, u]))

      const groupMap = new Map<
        string,
        { base: DetailItem; pairsRaw: DetailPair[] }
      >()

      for (const row of inputs) {
        const act = actMap.get(row.activity_id)
        const scopeId = act?.scope_id ?? -1
        if (scopeId === -1) continue

        const scopeName = scopeMap.get(scopeId)?.scope_name ?? `Scope ${scopeId}`
        const activityName = act?.activity_name ?? `Activity ${row.activity_id}`

        const gKey = `${row.activity_id}|${row.submitted_at}`

        if (!groupMap.has(gKey)) {
          groupMap.set(gKey, {
            base: {
              key: gKey,
              scopeId,
              scopeName,
              activityId: row.activity_id,
              activityName,
              submittedAt: row.submitted_at,
              pairs: [],
              totalCo2eKg: 0, // ✅ init
            },
            pairsRaw: [],
          })
        }

        const g = groupMap.get(gKey)!

        // ✅ add carbon for this input_id into the group total
        g.base.totalCo2eKg += co2eByInputId.get(row.input_id) ?? 0

        const fld = fieldMap.get(row.field_id)
        const label = fld?.field_label ?? `Field ${row.field_id}`
        const order =
          typeof fld?.field_order === "number" ? fld!.field_order! : 9999

        let value = "-"

        if (row.field_type_cached === "dropdown") {
          const opt = row.option_id != null ? optMap.get(row.option_id) : null
          value = opt?.display_name ?? "-"
        } else if (row.field_type_cached === "number") {
          const u = row.unit_id != null ? unitMap.get(row.unit_id) : null
          const uText = unitLabel(u)
          if (row.value_num != null) {
            value = uText
              ? `${formatSmartNumber(row.value_num)} ${uText}`
              : `${formatSmartNumber(row.value_num)}`
          }
        } else {
          value = row.value_num != null ? String(row.value_num) : "-"
        }

        g.pairsRaw.push({ label, value, order })
      }

      const byScope: Record<number, DetailItem[]> = {}

      for (const { base, pairsRaw } of groupMap.values()) {
        const pairs = [...pairsRaw].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
        const item: DetailItem = { ...base, pairs }

        if (!byScope[item.scopeId]) byScope[item.scopeId] = []
        byScope[item.scopeId].push(item)
      }

      for (const sid of Object.keys(byScope)) {
        byScope[Number(sid)].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        )
      }

      setDetailsByScope(byScope)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "โหลดสรุปผลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummaryAndDetails()
  }, [])

  const summaryMap = useMemo(() => {
    return new Map<number, ScopeSummary>(scopeSummaries.map((s) => [s.scope_id, s]))
  }, [scopeSummaries])

  const grandTotal = useMemo(
    () => scopeSummaries.reduce((sum, s) => sum + (s.totalCo2eKg || 0), 0),
    [scopeSummaries],
  )

  const chartData: ChartDatum[] = useMemo(
    () =>
      scopeSummaries
        .filter((s) => s.totalCo2eKg > 0)
        .map((s) => ({ name: s.scope_name, value: s.totalCo2eKg })),
    [scopeSummaries],
  )

  const orderedScopes = useMemo(
    () => [...scopeSummaries].sort((a, b) => a.scope_id - b.scope_id),
    [scopeSummaries],
  )

  function handleBack() {
    router.push("/user/calculate")
  }

  function handleExportPdf() {
    if (typeof window !== "undefined") window.print()
  }

  function toggleShowAll(scopeId: number) {
    setShowAllByScope((prev) => ({ ...prev, [scopeId]: !prev[scopeId] }))
  }

  return (
    <>
      {/* ========= Layout สำหรับดูบนจอ (UI สี ๆ ปกติ) ========= */}
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10 space-y-20 text-foreground print:hidden">
        {/* Header */}
        <header className="no-print flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              สรุปผลการคำนวณคาร์บอนฟุตพรินท์
            </h1>

            <p className="text-sm text-muted-foreground">
              คาร์บอนรวมทั้งหมด:{" "}
              <span className="font-semibold text-emerald-300">
                {formatNumber(grandTotal)} kg CO₂
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-amber-400/80 text-amber-200 bg-black/30 hover:bg-amber-500/20"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้าคำนวณ
            </Button>

            <Button
              size="sm"
              className="gap-1 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/40"
              onClick={handleExportPdf}
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </header>

        {/* Summary cards */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            สรุปแต่ละ Scope
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <Card
                  key={idx}
                  className="border border-white/10 bg-black/30 rounded-3xl"
                >
                  <CardContent className="p-4 space-y-3 animate-pulse">
                    <div className="h-5 w-32 bg-white/10 rounded-full" />
                    <div className="h-8 w-28 bg-white/10 rounded-full" />
                    <div className="h-3 w-40 bg-white/10 rounded-full" />
                  </CardContent>
                </Card>
              ))
            ) : orderedScopes.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">
                ยังไม่มีข้อมูลการคำนวณ ให้กลับไปกรอกข้อมูลในหน้าคำนวณก่อน
              </p>
            ) : (
              orderedScopes.map((scope) => {
                const theme = scopeTheme(scope.scope_id)
                const percent =
                  grandTotal > 0
                    ? (scope.totalCo2eKg / grandTotal) * 100
                    : 0

                return (
                  <Card
                    key={scope.scope_id}
                    className="border border-white/10 bg-black/30 rounded-3xl overflow-hidden"
                  >
                    <CardHeader
                      className={`pb-3 bg-gradient-to-r ${theme.band}`}
                    >
                      <CardTitle className="text-base md:text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${theme.dot}`}
                          />
                          {scope.scope_name?.trim() ||
                            `Scope ${scope.scope_id}`}
                        </span>

                        <span className="text-xs text-black/80 bg-white/80 px-2 py-0.5 rounded-full">
                          {scope.entryCount} รายการ
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        คาร์บอนรวมใน Scope นี้
                      </p>

                      <p className="text-2xl font-semibold">
                        {formatNumber(scope.totalCo2eKg)}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          kg CO₂
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        สัดส่วน{" "}
                        <span className={`font-semibold ${theme.accentText}`}>
                          {formatNumber(percent, 1)}%
                        </span>{" "}
                        ของทั้งหมด
                      </p>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </section>

        {/* Pie chart */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              สัดส่วนคาร์บอนฟุตพรินท์ของแต่ละ Scope
            </h2>
          </div>

          <Card className="border border-white/10 bg-black/30 rounded-3xl">
            <CardContent className="p-4 md:p-6">
              {loading ? (
                <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  กำลังโหลดกราฟ...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                  ยังไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟ
                </div>
              ) : (
                <div className="h-[320px] md:h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={78}
                        outerRadius={122}
                        paddingAngle={3}
                      >
                        {chartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="rgba(2,6,23,0.9)"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          `${formatNumber(value as number)} kg CO₂`,
                          "ปริมาณ",
                        ]}
                        contentStyle={{
                          background: "rgba(2,6,23,0.92)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 14,
                          color: "rgba(255,255,255,0.9)",
                        }}
                        itemStyle={{ color: "rgba(255,255,255,0.9)" }}
                        labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                      />

                      <Legend
                        wrapperStyle={{
                          color: "rgba(255,255,255,0.85)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  คาร์บอนรวมทั้งหมด:{" "}
                  <span className="font-semibold text-emerald-300">
                    {formatNumber(grandTotal)} kg CO₂
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* DETAILS — แนวนอน (full-width) เรียงลงมา 3 Scope */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                รายละเอียดที่กรอกในแต่ละ Scope
              </h2>
            </div>
          </div>

          {loading ? (
            <Card className="border border-white/10 bg-black/30 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังโหลดรายละเอียด...
                </div>
              </CardContent>
            </Card>
          ) : orderedScopes.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-4">
              {orderedScopes.map((scope) => {
                const theme = scopeTheme(scope.scope_id)
                const items = detailsByScope[scope.scope_id] ?? []
                const s = summaryMap.get(scope.scope_id)
                const percent =
                  grandTotal > 0
                    ? ((s?.totalCo2eKg ?? 0) / grandTotal) * 100
                    : 0

                const showAll = !!showAllByScope[scope.scope_id]
                const limit = 12
                const displayItems = showAll ? items : items.slice(0, limit)

                return (
                  <Card
                    key={`detail-scope-${scope.scope_id}`}
                    className="border border-white/10 bg-black/30 rounded-3xl overflow-hidden"
                  >
                    <CardHeader
                      className={`pb-4 bg-gradient-to-r ${theme.band}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${theme.dot}`}
                            />
                            {scope.scope_name?.trim() ||
                              `Scope ${scope.scope_id}`}
                          </CardTitle>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs bg-white/80 text-black/80 px-2 py-1 rounded-full">
                            {items.length} รายการที่กรอก
                          </span>

                          <span className="text-xs border border-white/15 bg-black/20 px-2 py-1 rounded-full">
                            รวม{" "}
                            <span className={`font-semibold ${theme.accentText}`}>
                              {formatNumber(s?.totalCo2eKg ?? 0)}
                            </span>{" "}
                            kg CO₂
                          </span>

                          <span className="text-xs border border-white/15 bg-black/20 px-2 py-1 rounded-full">
                            {formatNumber(percent, 1)}%
                          </span>

                          {items.length > limit && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-white/10 bg-black/20 hover:bg-white/5"
                              onClick={() => toggleShowAll(scope.scope_id)}
                            >
                              {showAll ? "ย่อรายการ" : "ดูทั้งหมด"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 md:p-6">
                      {items.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-muted-foreground">
                            ยังไม่มีรายละเอียดที่บันทึกใน Scope นี้
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[360px] md:h-[420px] pr-3">
                          <div className="space-y-3">
                            {displayItems.map((it) => (
                              <div
                                key={it.key}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-4 py-3"
                              >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                  <div className="space-y-1">
                                    <p className="text-sm md:text-base font-semibold text-foreground">
                                      {it.activityName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      บันทึกเมื่อ {formatDateTime(it.submittedAt)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground md:justify-end">
                                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">
                                      คาร์บอน:{" "}
                                      <span className="font-semibold text-foreground">
                                        {formatNumber(it.totalCo2eKg)}
                                      </span>{" "}
                                      kg CO₂
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {it.pairs.map((p, idx) => (
                                    <span
                                      key={`${it.key}-${idx}`}
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] leading-none ${theme.chip}`}
                                    >
                                      <span className="font-semibold">
                                        {p.label}
                                      </span>
                                      <span className="text-white/50">:</span>
                                      <span className="text-white/85">
                                        {p.value}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}

                      {items.length > limit && !showAll && (
                        <p className="text-[11px] text-muted-foreground mt-3">
                          แสดง {limit} รายการล่าสุดจากทั้งหมด {items.length} รายการ
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <div className="h-2" />
      </main>

      {/* ========= Layout สำหรับปริ้น (รายงานขาวดำ) ========= */}
      <section className="hidden print:block bg-white text-black px-10 py-10 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold mb-2">
          รายงานสรุปการคำนวณคาร์บอนฟุตพรินท์
        </h1>
        {printedAt && (
          <p className="mb-1">
            วันที่พิมพ์: {printedAt}
          </p>
        )}
        <p className="mb-4">
          คาร์บอนรวมทั้งหมด: {formatNumber(grandTotal)} kg CO₂
        </p>

        {orderedScopes.map((scope) => {
          const items = detailsByScope[scope.scope_id] ?? []
          const s = summaryMap.get(scope.scope_id)
          const percent =
            grandTotal > 0
              ? ((s?.totalCo2eKg ?? 0) / grandTotal) * 100
              : 0

          return (
            <div key={`print-scope-${scope.scope_id}`} className="mb-6">
              <h2 className="text-xl font-semibold">
                {scope.scope_name?.trim() || `Scope ${scope.scope_id}`}
              </h2>
              <p>
                คาร์บอนรวมใน Scope นี้:{" "}
                {formatNumber(s?.totalCo2eKg ?? 0)} kg CO₂ (
                {formatNumber(percent, 1)}% ของทั้งหมด)
              </p>
              <p className="mb-2">จำนวนรายการ: {items.length}</p>

              {items.length > 0 && (
                <ol className="ml-4 space-y-1">
                  {items.map((it, index) => (
                    <li key={it.key}>
                      <p className="font-semibold">
                        {index + 1}. {it.activityName} (
                        {formatDateTime(it.submittedAt)}) —{" "}
                        {formatNumber(it.totalCo2eKg)} kg CO₂
                      </p>
                      <ul className="ml-5 list-disc">
                        {it.pairs.map((p, idx) => (
                          <li key={`${it.key}-p-${idx}`}>
                            {p.label}: {p.value}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )
        })}
      </section>
    </>
  )
}

