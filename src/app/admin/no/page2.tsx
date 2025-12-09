// src/app/calculate/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"
import { Loader2, RotateCcw, FileDown, Trash2, Edit3 } from "lucide-react"

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
  is_active?: boolean | null
}

type ActivityFieldRow = {
  field_id: number
  activity_id: number
  field_key: string
  field_label: string
  field_type: FieldType
  field_order: number | null
  dropdown_group_key: string | null
  is_active?: boolean | null
}

type OptionItemRow = {
  option_id: number
  dropdown_group_key: string
  display_name: string
  is_active?: boolean | null
  is_context_only?: boolean | null
}

type UnitRow = {
  unit_id: number
  name: string
  symbol: string | null
  code: string | null
}

type ActivityFieldUnitRow = {
  field_id: number
  unit_id: number
}

type FieldValueState = {
  valueNum?: string
  unitId?: string
  optionId?: string
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

type CarbonLogRow = {
  input_id: number
  co2e_kg: number
  scope_id: number
}

type HistoryField = {
  fieldId: number
  label: string
  displayValue: string
}

type HistoryItem = {
  key: string
  scopeId: number | null
  scopeName: string
  activityId: number
  activityName: string
  submittedAt: string
  totalCo2eKg: number
  fields: HistoryField[]
  // ใช้สำหรับปุ่ม "แก้ไข"
  rawInputs: {
    field_id: number
    field_type: FieldType
    value_num: number | null
    unit_id: number | null
    option_id: number | null
  }[]
}

function isActiveFlag(row: { is_active?: boolean | null } | null | undefined) {
  if (!row) return false
  return row.is_active === undefined || row.is_active === null || row.is_active === true
}

function formatNumber(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "-"
  return n.toFixed(digits)
}

export default function CalculatePage() {
  const router = useRouter()

  // ---------- master data ----------
  const [scopes, setScopes] = useState<ScopeRow[]>([])
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [fields, setFields] = useState<ActivityFieldRow[]>([])
  const [options, setOptions] = useState<OptionItemRow[]>([])
  const [units, setUnits] = useState<UnitRow[]>([])
  const [fieldUnits, setFieldUnits] = useState<ActivityFieldUnitRow[]>([])

  // ---------- form selection ----------
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null)
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)
  const [formFields, setFormFields] = useState<ActivityFieldRow[]>([])
  const [fieldUnitsMap, setFieldUnitsMap] = useState<Record<number, UnitRow[]>>({})
  const [fieldValues, setFieldValues] = useState<Record<number, FieldValueState>>({})

  // ---------- history ----------
  const [history, setHistory] = useState<HistoryItem[]>([])

  // ---------- loading flags ----------
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resetting, setResetting] = useState(false)

  // ---------- helper maps ----------
  const scopeMap = useMemo(
    () => new Map<number, ScopeRow>(scopes.map((s) => [s.scope_id, s])),
    [scopes],
  )

  const activityMap = useMemo(
    () => new Map<number, ActivityRow>(activities.map((a) => [a.activity_id, a])),
    [activities],
  )

  const fieldMap = useMemo(
    () => new Map<number, ActivityFieldRow>(fields.map((f) => [f.field_id, f])),
    [fields],
  )

  const optionMap = useMemo(
    () => new Map<number, OptionItemRow>(options.map((o) => [o.option_id, o])),
    [options],
  )

  const unitMap = useMemo(
    () => new Map<number, UnitRow>(units.map((u) => [u.unit_id, u])),
    [units],
  )

  // =========================================================
  // โหลด master data + history รอบแรก
  // =========================================================
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoadingInitial(true)

        const [scopeRes, activityRes, fieldRes, optionRes, unitRes, fieldUnitRes] =
          await Promise.all([
            supabase.from("scope").select("scope_id, scope_name").order("scope_id", {
              ascending: true,
            }),
            supabase
              .from("activity")
              .select("activity_id, activity_name, scope_id, is_active")
              .order("activity_id", { ascending: true }),
            supabase
              .from("activity_field")
              .select(
                "field_id, activity_id, field_key, field_label, field_type, field_order, dropdown_group_key, is_active",
              )
              .order("field_order", { ascending: true }),
            supabase
              .from("option_item")
              .select("option_id, dropdown_group_key, display_name, is_active, is_context_only"),
            supabase.from("unit").select("unit_id, name, symbol, code"),
            supabase.from("activity_field_unit").select("field_id, unit_id"),
          ])

        if (scopeRes.error) throw scopeRes.error
        if (activityRes.error) throw activityRes.error
        if (fieldRes.error) throw fieldRes.error
        if (optionRes.error) throw optionRes.error
        if (unitRes.error) throw unitRes.error
        if (fieldUnitRes.error) throw fieldUnitRes.error

        setScopes(scopeRes.data ?? [])
        setActivities(activityRes.data ?? [])
        setFields(fieldRes.data ?? [])
        setOptions(optionRes.data ?? [])
        setUnits(unitRes.data ?? [])
        setFieldUnits(fieldUnitRes.data ?? [])

        // default scope + activity (เลือกตัวแรกจากรายการทั้งหมด)
        const firstScopeId = (scopeRes.data ?? [])[0]?.scope_id ?? null
        setSelectedScopeId(firstScopeId)

        if (firstScopeId != null) {
          const activeActs = (activityRes.data ?? []).filter(
            (a) => isActiveFlag(a) && a.scope_id === firstScopeId,
          )
          const firstActId = activeActs[0]?.activity_id ?? null
          setSelectedActivityId(firstActId)
        }

        await loadHistoryInternal(
          activityRes.data ?? [],
          fieldRes.data ?? [],
          optionRes.data ?? [],
          unitRes.data ?? [],
          scopeRes.data ?? [],
        )
      } catch (err: any) {
        console.error(err)
        toast.error(err?.message ?? "โหลดข้อมูลเริ่มต้นไม่สำเร็จ")
      } finally {
        setLoadingInitial(false)
      }
    }

    loadInitial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =========================================================
  // สร้าง formFields + fieldUnitsMap เมื่อเปลี่ยน activity
  // =========================================================
  useEffect(() => {
    if (!selectedActivityId) {
      setFormFields([])
      setFieldUnitsMap({})
      return
    }

    // field ที่ active เท่านั้นสำหรับฟอร์ม (แต่ history จะใช้ทุกอัน)
    const fs = fields
      .filter((f) => f.activity_id === selectedActivityId && isActiveFlag(f))
      .sort((a, b) => (a.field_order ?? 0) - (b.field_order ?? 0))
    setFormFields(fs)

    // mapping field -> units
    const map: Record<number, UnitRow[]> = {}
    fs.forEach((f) => {
      if (f.field_type === "number") {
        const links = fieldUnits.filter((fu) => fu.field_id === f.field_id)
        const uList = links
          .map((fu) => unitMap.get(fu.unit_id))
          .filter((u): u is UnitRow => !!u)
        map[f.field_id] = uList
      }
    })
    setFieldUnitsMap(map)
  }, [selectedActivityId, fields, fieldUnits, unitMap])

  // =========================================================
  // โหลด history (ใช้ master data ที่มีอยู่แล้ว)
  // =========================================================
  async function loadHistoryInternal(
    activityRows = activities,
    fieldRows = fields,
    optionRows = options,
    unitRows = units,
    scopeRows = scopes,
  ) {
    try {
      setLoadingHistory(true)

      const [ciRes, logRes] = await Promise.all([
        supabase
          .from("carbon_input")
          .select(
            "input_id, activity_id, field_id, submitted_at, value_num, unit_id, option_id, field_type_cached",
          )
          .order("submitted_at", { ascending: false })
          .limit(200),
        supabase.from("carbon_calculation_log").select("input_id, co2e_kg, scope_id"),
      ])

      if (ciRes.error) throw ciRes.error
      if (logRes.error) throw logRes.error

      const ciRows = (ciRes.data ?? []) as CarbonInputRow[]
      const logRows = (logRes.data ?? []) as CarbonLogRow[]

      const actMap = new Map<number, ActivityRow>(
        activityRows.map((a: any) => [a.activity_id, a]),
      )
      const fldMap = new Map<number, ActivityFieldRow>(
        fieldRows.map((f: any) => [f.field_id, f]),
      )
      const optMap = new Map<number, OptionItemRow>(
        optionRows.map((o: any) => [o.option_id, o]),
      )
      const uMap = new Map<number, UnitRow>(unitRows.map((u: any) => [u.unit_id, u]))
      const scMap = new Map<number, ScopeRow>(scopeRows.map((s: any) => [s.scope_id, s]))

      const logMap = new Map<number, CarbonLogRow>()
      for (const row of logRows) {
        logMap.set(row.input_id, row)
      }

      // group key = activity_id + submitted_at
      const groups = new Map<string, HistoryItem>()

      for (const row of ciRows) {
        const groupKey = `${row.activity_id}|${row.submitted_at}`
        let group = groups.get(groupKey)

        if (!group) {
          const act = actMap.get(row.activity_id)
          const sc = act ? scMap.get(act.scope_id) : null

          group = {
            key: groupKey,
            scopeId: act?.scope_id ?? null,
            scopeName: sc?.scope_name ?? `Scope ${act?.scope_id ?? "-"}`,
            activityId: row.activity_id,
            activityName: act?.activity_name ?? `Activity ${row.activity_id}`,
            submittedAt: row.submitted_at,
            totalCo2eKg: 0,
            fields: [],
            rawInputs: [],
          }

          groups.set(groupKey, group)
        }

        const f = fldMap.get(row.field_id)
        const label = f?.field_label ?? `Field ${row.field_id}`

        let displayValue = "-"

        if (row.field_type_cached === "dropdown") {
          const opt = row.option_id ? optMap.get(row.option_id) : null
          displayValue = opt?.display_name ?? "-"
        } else if (row.field_type_cached === "number") {
          const unit = row.unit_id ? uMap.get(row.unit_id) : null
          const symbol = unit?.symbol || unit?.code || unit?.name || ""
          if (row.value_num != null) {
            displayValue = symbol ? `${row.value_num} ${symbol}` : `${row.value_num}`
          }
        } else {
          // text: ถ้าคุณมีคอลัมน์ text แยก (เช่น value_text) ค่อยทำเพิ่มภายหลัง
          displayValue = row.value_num != null ? String(row.value_num) : "-"
        }

        group.fields.push({ fieldId: row.field_id, label, displayValue })

        group.rawInputs.push({
          field_id: row.field_id,
          field_type: row.field_type_cached,
          value_num: row.value_num,
          unit_id: row.unit_id,
          option_id: row.option_id,
        })

        const log = logMap.get(row.input_id)
        if (log && typeof log.co2e_kg === "number") {
          group.totalCo2eKg += Number(log.co2e_kg)
        }
      }

      const items = Array.from(groups.values()).sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      )

      setHistory(items)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "โหลดประวัติไม่สำเร็จ")
    } finally {
      setLoadingHistory(false)
    }
  }

  async function reloadHistory() {
    await loadHistoryInternal()
  }

  // =========================================================
  // handlers – form
  // =========================================================
  function handleSelectScope(scopeId: number | null) {
    setSelectedScopeId(scopeId)

    if (scopeId == null) {
      setSelectedActivityId(null)
      setFormFields([])
      setFieldValues({})
      return
    }

    const actsInScope = activities.filter((a) => isActiveFlag(a) && a.scope_id === scopeId)
    const firstActId = actsInScope[0]?.activity_id ?? null
    setSelectedActivityId(firstActId)
    setFieldValues({})
  }

  function handleSelectActivity(activityId: number) {
    setSelectedActivityId(activityId)
    setFieldValues({})
  }

  function updateFieldValue(fieldId: number, patch: Partial<FieldValueState>) {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: { ...(prev[fieldId] ?? {}), ...patch },
    }))
  }

  async function handleSubmitActivity() {
    if (!selectedActivityId) {
      toast.error("กรุณาเลือกกิจกรรม")
      return
    }

    if (formFields.length === 0) {
      toast.error("ยังไม่มีช่องกรอกสำหรับกิจกรรมนี้")
      return
    }

    // validate
    for (const field of formFields) {
      const v = fieldValues[field.field_id] ?? {}

      if (field.field_type === "number") {
        if (!v.valueNum || Number.isNaN(Number(v.valueNum))) {
          toast.error(`กรุณากรอกค่าให้ครบในช่อง "${field.field_label}"`)
          return
        }
        if (!v.unitId) {
          toast.error(`กรุณาเลือกหน่วยให้ครบในช่อง "${field.field_label}"`)
          return
        }
      } else if (field.field_type === "dropdown") {
        if (!v.optionId) {
          toast.error(`กรุณาเลือกตัวเลือกในช่อง "${field.field_label}"`)
          return
        }
      }
      // text ปล่อยให้ว่างได้
    }

    const payload = formFields.map((field) => {
      const v = fieldValues[field.field_id] ?? {}
      return {
        field_id: field.field_id,
        value_num: field.field_type === "number" && v.valueNum ? Number(v.valueNum) : null,
        unit_id: field.field_type === "number" && v.unitId ? Number(v.unitId) : null,
        option_id: field.field_type === "dropdown" && v.optionId ? Number(v.optionId) : null,
      }
    })

    const submittedAt = new Date().toISOString()

    try {
      setSubmitting(true)

      const { error } = await supabase.rpc("fn_submit_activity_json_v2", {
        _activity_id: selectedActivityId,
        _submitted_at: submittedAt,
        _payload: payload,
      })

      if (error) throw error

      toast.success("บันทึกข้อมูลและคำนวณสำเร็จแล้ว")

      // ล้างฟอร์ม (แต่ยังเลือก Scope/Activity เดิม)
      setFieldValues({})

      // reload history
      await reloadHistory()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "บันทึกข้อมูลไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }

  // =========================================================
  // handlers – history / reset / export
  // =========================================================
  async function handleResetAll() {
    const ok = window.confirm("ต้องการล้างข้อมูลการคำนวณทั้งหมดของคุณหรือไม่?")
    if (!ok) return

    try {
      setResetting(true)

      // RLS จะลบได้เฉพาะของ user ปัจจุบัน
      const { error } = await supabase.from("carbon_input").delete()
      if (error) throw error

      toast.success("ล้างข้อมูลสำเร็จแล้ว")
      setHistory([])
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "ล้างข้อมูลไม่สำเร็จ")
    } finally {
      setResetting(false)
    }
  }

  async function handleDeleteHistoryItem(item: HistoryItem) {
    const ok = window.confirm(
      `ต้องการลบรายการ "${item.activityName}" ที่บันทึกเวลา ${new Date(
        item.submittedAt,
      ).toLocaleString()} หรือไม่?`,
    )
    if (!ok) return

    try {
      const { error } = await supabase
        .from("carbon_input")
        .delete()
        .eq("activity_id", item.activityId)
        .eq("submitted_at", item.submittedAt)

      if (error) throw error

      toast.success("ลบรายการแล้ว")
      await reloadHistory()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? "ลบรายการไม่สำเร็จ")
    }
  }

  function handleEditHistoryItem(item: HistoryItem) {
    // เลือก Scope + Activity ให้ตรงกับรายการที่แก้
    if (item.scopeId != null) handleSelectScope(item.scopeId)
    handleSelectActivity(item.activityId)

    const nextValues: Record<number, FieldValueState> = {}

    for (const r of item.rawInputs) {
      if (r.field_type === "number") {
        nextValues[r.field_id] = {
          valueNum: r.value_num != null ? String(r.value_num) : "",
          unitId: r.unit_id != null ? String(r.unit_id) : undefined,
        }
      } else if (r.field_type === "dropdown") {
        nextValues[r.field_id] = {
          optionId: r.option_id != null ? String(r.option_id) : undefined,
        }
      }
    }

    setFieldValues(nextValues)

    // scroll ขึ้นไปด้านบนให้เห็นฟอร์ม
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleGoSummary() {
    router.push("/calculate/summary")
  }

  // =========================================================
  // render helpers
  // =========================================================
  const activitiesOfScope = useMemo(() => {
    if (!selectedScopeId) return []
    return activities.filter((a) => isActiveFlag(a) && a.scope_id === selectedScopeId)
  }, [activities, selectedScopeId])

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10 space-y-8 text-foreground">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-semibold text-emerald-800">
            คำนวณคาร์บอนฟุตพรินท์
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            เลือกกิจกรรมของคุณ กรอกข้อมูล และดูผลคำนวณแบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-amber-400 text-amber-700 hover:bg-amber-50"
            onClick={handleResetAll}
            disabled={resetting}
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            ล้างข้อมูลทั้งหมด
          </Button>

          <Button
            size="sm"
            className="gap-1 bg-emerald-700 hover:bg-emerald-800"
            onClick={handleGoSummary}
          >
            <FileDown className="w-4 h-4" />
            Export PDF / สรุปผล
          </Button>
        </div>
      </header>

      {/* แบบฟอร์มกรอกข้อมูล */}
      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">แบบฟอร์มกรอกข้อมูล</CardTitle>
          <CardDescription className="text-sm md:text-base">
            1) เลือก Scope → 2) เลือกกิจกรรม → 3) กรอกข้อมูลให้ครบ แล้วกด{" "}
            <span className="font-semibold text-emerald-700">เสร็จสิ้น</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scope selector */}
          <section className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              เลือก Scope
            </Label>

            <Select
              value={selectedScopeId ? String(selectedScopeId) : ""}
              onValueChange={(v) => handleSelectScope(v ? Number(v) : null)}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="เลือก Scope" />
              </SelectTrigger>

              <SelectContent>
                {scopes.map((s) => (
                  <SelectItem key={s.scope_id} value={String(s.scope_id)}>
                    {s.scope_name ?? `Scope ${s.scope_id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedScopeId && (
              <p className="text-xs text-muted-foreground mt-1">
                ตอนนี้กำลังกรอกใน{" "}
                <span className="font-medium">
                  {scopeMap.get(selectedScopeId)?.scope_name ?? `Scope ${selectedScopeId}`}
                </span>
              </p>
            )}
          </section>

          {/* Activity selector */}
          <section className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              เลือกกิจกรรมใน Scope นี้
            </Label>

            {loadingInitial ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังโหลดกิจกรรม...
              </div>
            ) : activitiesOfScope.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรมใน Scope นี้</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {activitiesOfScope.map((act) => {
                  const isSelected = act.activity_id === selectedActivityId

                  return (
                    <button
                      key={act.activity_id}
                      type="button"
                      onClick={() => handleSelectActivity(act.activity_id)}
                      className={[
                        "rounded-2xl border px-3 py-3 text-left text-sm transition-all",
                        "hover:shadow-md hover:bg-emerald-100/80",
                        isSelected
                          ? "border-emerald-600 bg-emerald-100"
                          : "border-emerald-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="font-semibold text-emerald-900">
                        {act.activity_name ?? `Activity ${act.activity_id}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Dynamic fields */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-900">รายละเอียดกิจกรรม</h3>
              {selectedActivityId && (
                <span className="text-xs text-muted-foreground">
                  Activity ID: {selectedActivityId}
                </span>
              )}
            </div>

            {!selectedActivityId ? (
              <p className="text-sm text-muted-foreground">กรุณาเลือก Scope และ Activity ก่อน</p>
            ) : formFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีช่องกรอกสำหรับกิจกรรมนี้</p>
            ) : (
              <div className="space-y-4">
                {formFields.map((field) => {
                  const v = fieldValues[field.field_id] ?? {}
                  const unitsForField = fieldUnitsMap[field.field_id] ?? []
                  const isNumber = field.field_type === "number"
                  const isDropdown = field.field_type === "dropdown"

                  return (
                    <div
                      key={field.field_id}
                      className="rounded-2xl border border-emerald-200 bg-white px-3 py-3 space-y-2"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-emerald-900">
                            {field.field_label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            key:{" "}
                            <code className="font-mono text-[11px]">{field.field_key}</code>
                          </p>
                        </div>

                        {typeof field.field_order === "number" && (
                          <span className="text-[11px] text-muted-foreground">
                            ลำดับที่ {field.field_order}
                          </span>
                        )}
                      </div>

                      {/* Control */}
                      {isNumber && (
                        <div className="grid grid-cols-[1.4fr,0.9fr] gap-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            placeholder="กรอกตัวเลข"
                            className="bg-emerald-50/50"
                            value={v.valueNum ?? ""}
                            onChange={(e) =>
                              updateFieldValue(field.field_id, { valueNum: e.target.value })
                            }
                          />

                          <Select
                            value={v.unitId ?? ""}
                            onValueChange={(val) =>
                              updateFieldValue(field.field_id, { unitId: val })
                            }
                          >
                            <SelectTrigger className="bg-emerald-50/50">
                              <SelectValue placeholder="เลือกหน่วย" />
                            </SelectTrigger>

                            <SelectContent>
                              {unitsForField.length === 0 ? (
                                <SelectItem value="__none__" disabled>
                                  ยังไม่ได้กำหนดหน่วย
                                </SelectItem>
                              ) : (
                                unitsForField.map((u) => (
                                  <SelectItem key={u.unit_id} value={String(u.unit_id)}>
                                    {u.symbol || u.code || u.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isDropdown && (
                        <Select
                          value={v.optionId ?? ""}
                          onValueChange={(val) =>
                            updateFieldValue(field.field_id, { optionId: val })
                          }
                        >
                          <SelectTrigger className="bg-emerald-50/50">
                            <SelectValue placeholder="เลือกตัวเลือก" />
                          </SelectTrigger>

                          <SelectContent>
                            {options
                              .filter(
                                (o) =>
                                  o.dropdown_group_key === field.dropdown_group_key &&
                                  isActiveFlag(o),
                              )
                              .map((o) => (
                                <SelectItem key={o.option_id} value={String(o.option_id)}>
                                  {o.display_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}

                      {!isNumber && !isDropdown && (
                        <Input
                          placeholder="กรอกข้อความ"
                          className="bg-emerald-50/50"
                          value={v.valueNum ?? ""}
                          onChange={(e) =>
                            updateFieldValue(field.field_id, { valueNum: e.target.value })
                          }
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Submit button */}
          <div className="pt-2 flex justify-end">
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 px-6"
              size="lg"
              onClick={handleSubmitActivity}
              disabled={submitting || !selectedActivityId}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              เสร็จสิ้น – บันทึกและคำนวณ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-emerald-800">
              ประวัติการคำนวณ (Real-time)
            </h2>
            <p className="text-sm text-muted-foreground">
              ทุกครั้งที่กด “เสร็จสิ้น” จะถูกบันทึกไว้ที่นี่ทันที แม้ภายหลัง Admin จะปิดการใช้งาน
              Activity / Field แล้ว
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="border-emerald-300"
            onClick={reloadHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[420px] rounded-2xl border border-emerald-200 bg-emerald-50/60 px-3 py-3">
          {loadingInitial || loadingHistory ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังโหลดประวัติ...
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              ยังไม่มีประวัติการคำนวณ
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                        {item.scopeName}
                      </p>
                      <p className="text-sm md:text-base font-semibold text-emerald-950">
                        {item.activityName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        บันทึกเมื่อ {new Date(item.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm md:text-base font-semibold text-emerald-800">
                        คาร์บอนที่เกิดขึ้น:{" "}
                        <span className="text-emerald-900">
                          {formatNumber(item.totalCo2eKg)} kg CO₂
                        </span>
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 gap-1 border-sky-500 text-sky-700 hover:bg-sky-50"
                          onClick={() => handleEditHistoryItem(item)}
                        >
                          <Edit3 className="w-3 h-3" />
                          แก้ไข
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-3 gap-1"
                          onClick={() => handleDeleteHistoryItem(item)}
                        >
                          <Trash2 className="w-3 h-3" />
                          ลบ
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-emerald-100 pt-2 mt-1 space-y-1.5">
                    {item.fields.map((f) => (
                      <p key={f.fieldId} className="text-[13px] text-muted-foreground">
                        <span className="font-medium text-emerald-900">{f.label}: </span>{" "}
                        {f.displayValue}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </section>
    </main>
  )
}