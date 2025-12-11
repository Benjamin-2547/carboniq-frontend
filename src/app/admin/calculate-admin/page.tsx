// src/app/admin/calculate-admin/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Scope = {
  scope_id: number
  scope_name: string | null
}

type FieldType = "number" | "dropdown" | "text"

type ActivityRow = {
  activity_id: number | string // string = temp id
  activity_name: string | null
  scope_id: number

  _isNew?: boolean
  _isSaving?: boolean
}

type ActivityField = {
  field_id: number | string // string = temp id ตอนสร้างใหม่
  activity_id: number
  field_key: string
  field_label: string
  field_type: FieldType
  field_order: number | null
  dropdown_group_key: string | null

  // UI flags
  _isNew?: boolean
  _isSaving?: boolean
}

type Unit = {
  unit_id: number
  name: string
  symbol: string | null
  code: string | null
  quantity_kind: string | null
  conversion_factor: number | null
}

type ActivityFieldUnitRow = {
  field_id: number
  unit_id: number
}

type DropdownGroupRow = {
  dropdown_group_key: string
  description: string | null

  _isNew?: boolean
  _isSaving?: boolean
}

type OptionFactorType = "source_factor_id" | "emission_factor_id" | "context_only"

type OptionItem = {
  option_id: number | string // string = temp
  dropdown_group_key: string
  value_code: string
  display_name: string
  source_factor_id: number | null
  emission_factor_id: number | null
  is_context_only: boolean

  // UI helper
  factor_type: OptionFactorType
  _isNew?: boolean
  _isSaving?: boolean
}

type SourceFactor = {
  source_id: number
  name: string
}

type EmissionFactor = {
  efid: number
  name: string
}

type FieldUnitsMap = Record<string, number[]> // key = String(field_id หรือ tempId)

const supabase = createClient()

function sortDropdownGroups(list: DropdownGroupRow[]) {
  return [...list].sort((a, b) => a.dropdown_group_key.localeCompare(b.dropdown_group_key))
}

function keyOf(id: number | string | null | undefined) {
  return id == null ? "" : String(id)
}

function isNumberId(id: number | string | null): id is number {
  return typeof id === "number"
}

export default function AdminCalculatePage() {
  // ---------- State ----------
  const [scopes, setScopes] = useState<Scope[]>([])
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null)

  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<number | string | null>(null)

  const [activityFields, setActivityFields] = useState<ActivityField[]>([])

  const [units, setUnits] = useState<Unit[]>([])
  const [fieldUnits, setFieldUnits] = useState<FieldUnitsMap>({})

  const [dropdownGroups, setDropdownGroups] = useState<DropdownGroupRow[]>([])
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)
  const [options, setOptions] = useState<OptionItem[]>([])

  const [sourceFactors, setSourceFactors] = useState<SourceFactor[]>([])
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([])

  const [loadingScopes, setLoadingScopes] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)

  const [savingActivity, setSavingActivity] = useState(false)
  const [savingField, setSavingField] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [savingOption, setSavingOption] = useState(false)

  const [renamingGroup, setRenamingGroup] = useState(false)
  const [renameDraftKey, setRenameDraftKey] = useState("")

  // ---------- Derived ----------
  const activeScope = useMemo(
    () => scopes.find((s) => s.scope_id === selectedScopeId) ?? null,
    [scopes, selectedScopeId],
  )

  const activeActivity = useMemo(() => {
    const k = keyOf(selectedActivityId)
    return activities.find((a) => keyOf(a.activity_id) === k) ?? null
  }, [activities, selectedActivityId])

  const activeGroup = useMemo(
    () => dropdownGroups.find((g) => g.dropdown_group_key === selectedGroupKey) ?? null,
    [dropdownGroups, selectedGroupKey],
  )
  const isGroupSaved = !!activeGroup && !activeGroup._isNew

  // =========================================================
  // Load Initial
  // =========================================================
  useEffect(() => {
    async function loadInitial() {
      setLoadingScopes(true)
      const { data: scopeRows, error: scopeErr } = await supabase
        .from("scope")
        .select("scope_id, scope_name")
        .order("scope_id", { ascending: true })
      setLoadingScopes(false)

      if (scopeErr) {
        toast.error(scopeErr.message || "โหลด Scope ไม่สำเร็จ")
      } else {
        setScopes(scopeRows ?? [])
        if (scopeRows && scopeRows.length > 0) {
          setSelectedScopeId((prev) => prev ?? scopeRows[0].scope_id)
        }
      }

      const { data: unitRows, error: unitErr } = await supabase
        .from("unit")
        .select("unit_id, name, symbol, code, quantity_kind, conversion_factor")
        .order("unit_id", { ascending: true })
      if (unitErr) toast.error(unitErr.message || "โหลดหน่วย (unit) ไม่สำเร็จ")
      setUnits(unitRows ?? [])

      // dropdown_group: แสดงเฉพาะ is_active=true
      const { data: groupRows, error: groupErr } = await supabase
        .from("dropdown_group")
        .select("dropdown_group_key, description")
        .eq("is_active", true)
        .order("dropdown_group_key", { ascending: true })
      if (groupErr) toast.error(groupErr.message || "โหลด Dropdown Group ไม่สำเร็จ")

      const groups: DropdownGroupRow[] = sortDropdownGroups(
        (groupRows ?? []).map((g: any) => ({
          ...g,
          _isNew: false,
          _isSaving: false,
        })),
      )
      setDropdownGroups(groups)
      if (groups.length > 0) {
        setSelectedGroupKey((prev) => prev ?? groups[0].dropdown_group_key)
        setRenameDraftKey((prev) => prev || groups[0].dropdown_group_key)
      } else {
        setSelectedGroupKey(null)
        setRenameDraftKey("")
      }

      const { data: srcRows } = await supabase
        .from("source_factor")
        .select("source_id, name")
        .order("source_id", { ascending: true })
      setSourceFactors(srcRows ?? [])

      // emission_factor: แสดงเฉพาะ is_active=true
      const { data: efRows } = await supabase
        .from("emission_factor")
        .select("efid, name")
        .eq("is_active", true)
        .order("efid", { ascending: true })
      setEmissionFactors(efRows ?? [])
    }

    loadInitial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =========================================================
  // Load activities when scope changes (only is_active=true)
  // =========================================================
  useEffect(() => {
    if (!selectedScopeId) {
      setActivities([])
      setSelectedActivityId(null)
      return
    }

    async function loadActivities() {
      setLoadingActivities(true)

      const { data, error } = await supabase
        .from("activity")
        .select("activity_id, activity_name, scope_id")
        .eq("scope_id", selectedScopeId)
        .eq("is_active", true)
        .order("activity_id", { ascending: true })

      setLoadingActivities(false)

      if (error) {
        toast.error(error.message || "โหลด Activity ไม่สำเร็จ")
        setActivities([])
        setSelectedActivityId(null)
        return
      }

      const list: ActivityRow[] = (data ?? []).map((a: any) => ({
        ...a,
        _isNew: false,
        _isSaving: false,
      }))

      setActivities(list)

      setSelectedActivityId((prev) => {
        if (prev != null) {
          const exists = list.some((a) => keyOf(a.activity_id) === keyOf(prev))
          if (exists) return prev
        }
        return list.length > 0 ? list[0].activity_id : null
      })
    }

    loadActivities()
  }, [selectedScopeId])

  // =========================================================
  // Load fields + mapping units when activity changes (only is_active=true)
  // =========================================================
  useEffect(() => {
    if (!isNumberId(selectedActivityId)) {
      setActivityFields([])
      setFieldUnits({})
      return
    }

    async function loadFields() {
      setLoadingFields(true)

      const { data: fieldRows, error: fieldErr } = await supabase
        .from("activity_field")
        .select("field_id, activity_id, field_key, field_label, field_type, field_order, dropdown_group_key")
        .eq("activity_id", selectedActivityId)
        .eq("is_active", true)
        .order("field_order", { ascending: true })

      if (fieldErr) {
        setLoadingFields(false)
        toast.error(fieldErr.message || "โหลด Activity Field ไม่สำเร็จ")
        setActivityFields([])
        setFieldUnits({})
        return
      }

      const list: ActivityField[] = (fieldRows ?? []).map((f: any) => ({
        ...f,
        _isNew: false,
        _isSaving: false,
      }))

      setActivityFields(list)

      const ids = list
        .map((f) => (typeof f.field_id === "number" ? f.field_id : null))
        .filter((x): x is number => typeof x === "number")

      if (ids.length === 0) {
        setFieldUnits({})
        setLoadingFields(false)
        return
      }

      const { data: mapRows, error: mapErr } = await supabase
        .from("activity_field_unit")
        .select("field_id, unit_id")
        .in("field_id", ids)

      setLoadingFields(false)

      if (mapErr) {
        toast.error(mapErr.message || "โหลด mapping unit ไม่สำเร็จ")
        setFieldUnits({})
        return
      }

      const map: FieldUnitsMap = {}
      ;(mapRows ?? []).forEach((row: ActivityFieldUnitRow) => {
        const k = keyOf(row.field_id)
        if (!map[k]) map[k] = []
        map[k].push(row.unit_id)
      })
      setFieldUnits(map)
    }

    loadFields()
  }, [selectedActivityId])

  // =========================================================
  // Load options when group changes (only is_active=true)
  // =========================================================
  useEffect(() => {
    if (!selectedGroupKey) {
      setOptions([])
      return
    }

    async function loadOptions() {
      setLoadingOptions(true)

      const { data, error } = await supabase
        .from("option_item")
        .select("option_id, dropdown_group_key, value_code, display_name, source_factor_id, emission_factor_id, is_context_only")
        .eq("dropdown_group_key", selectedGroupKey)
        .eq("is_active", true)
        .order("option_id", { ascending: true })

      setLoadingOptions(false)

      if (error) {
        toast.error(error.message || "โหลด Option ของกลุ่มนี้ไม่สำเร็จ")
        setOptions([])
        return
      }

      const rows: OptionItem[] = (data ?? []).map((row: any) => {
        let factor_type: OptionFactorType = "context_only"
        if (row.is_context_only) factor_type = "context_only"
        else if (row.source_factor_id) factor_type = "source_factor_id"
        else if (row.emission_factor_id) factor_type = "emission_factor_id"

        return {
          ...row,
          factor_type,
          _isNew: false,
          _isSaving: false,
        }
      })

      setOptions(
        rows.sort((a, b) => {
          const nameA = (a.display_name || a.value_code || "").toLowerCase()
          const nameB = (b.display_name || b.value_code || "").toLowerCase()
          return nameA.localeCompare(nameB)
        }),
      )
    }

    loadOptions()
  }, [selectedGroupKey])

  // =========================================================
  // 0) Activity CRUD
  // =========================================================
  function addActivityRow() {
    if (!selectedScopeId) {
      toast.error("กรุณาเลือก Scope ก่อน")
      return
    }
    const tempId = `new-act-${Date.now()}`
    setActivities((prev) => [
      ...prev,
      {
        activity_id: tempId,
        activity_name: "",
        scope_id: selectedScopeId,
        _isNew: true,
        _isSaving: false,
      },
    ])
    setSelectedActivityId(tempId)
  }

  function updateActivityLocal(id: ActivityRow["activity_id"], patch: Partial<ActivityRow>) {
    setActivities((prev) => prev.map((a) => (a.activity_id === id ? { ...a, ...patch } : a)))
  }

  async function saveActivityRow(activity: ActivityRow) {
    if (!selectedScopeId) return toast.error("ยังไม่ได้เลือก Scope")

    const name = (activity.activity_name ?? "").trim()
    if (!name) return toast.error("กรุณากรอกชื่อ Activity")

    const payload: any = {
      activity_name: name,
      scope_id: selectedScopeId,
      is_active: true, // สำคัญ: ให้ active เสมอ
    }

    setSavingActivity(true)
    updateActivityLocal(activity.activity_id, { _isSaving: true })

    if (activity._isNew) {
      const { data, error } = await supabase
        .from("activity")
        .insert(payload)
        .select("activity_id, activity_name, scope_id")
        .maybeSingle()

      if (error || !data) {
        toast.error(error?.message ?? "เพิ่ม Activity ไม่สำเร็จ")
        updateActivityLocal(activity.activity_id, { _isSaving: false })
        setSavingActivity(false)
        return
      }

      setActivities((prev) =>
        prev
          .map((a) =>
            a.activity_id === activity.activity_id
              ? { ...data, _isNew: false, _isSaving: false }
              : a,
          )
          .sort((x, y) => Number(keyOf(x.activity_id)) - Number(keyOf(y.activity_id))),
      )

      setSelectedActivityId(data.activity_id)
      toast.success("เพิ่ม Activity แล้ว")
      setSavingActivity(false)
      return
    }

    if (!isNumberId(activity.activity_id)) {
      toast.error("Activity นี้ยังไม่พร้อมบันทึก (id ไม่ถูกต้อง)")
      updateActivityLocal(activity.activity_id, { _isSaving: false })
      setSavingActivity(false)
      return
    }

    const { error } = await supabase.from("activity").update(payload).eq("activity_id", activity.activity_id)

    if (error) {
      toast.error(error.message || "บันทึก Activity ไม่สำเร็จ")
      updateActivityLocal(activity.activity_id, { _isSaving: false })
      setSavingActivity(false)
      return
    }

    updateActivityLocal(activity.activity_id, { activity_name: name, _isNew: false, _isSaving: false })
    toast.success("บันทึก Activity แล้ว")
    setSavingActivity(false)
  }

  async function deleteActivityRow(activity: ActivityRow) {
    // unsaved
    if (activity._isNew) {
      setActivities((prev) => prev.filter((a) => a.activity_id !== activity.activity_id))
      if (keyOf(selectedActivityId) === keyOf(activity.activity_id)) {
        setSelectedActivityId(null)
        setActivityFields([])
        setFieldUnits({})
      }
      return
    }

    if (!isNumberId(activity.activity_id)) return

    // check related ACTIVE fields count
    const { count: fieldCount, error: cntErr } = await supabase
      .from("activity_field")
      .select("field_id", { count: "exact", head: true })
      .eq("activity_id", activity.activity_id)
      .eq("is_active", true)

    if (cntErr) {
      toast.error(cntErr.message || "ตรวจสอบความเชื่อมโยงไม่สำเร็จ")
      return
    }

    const hasFields = (fieldCount ?? 0) > 0
    const ok = window.confirm(
      hasFields
        ? `Activity นี้มี Activity Field (ที่ยังใช้งาน) อยู่ ${fieldCount} รายการ\nต้องการลบ Activity พร้อมปิดการใช้งาน Field ทั้งหมดด้วยไหม?`
        : `ต้องการลบ Activity "${activity.activity_name ?? activity.activity_id}" หรือไม่?`,
    )
    if (!ok) return

    setSavingActivity(true)
    updateActivityLocal(activity.activity_id, { _isSaving: true })

    // 1) ปิดการใช้งาน Fields ที่ผูกกับ activity นี้ (กันข้อมูลค้าง)
    if (hasFields) {
      const { error: deactFieldsErr } = await supabase
        .from("activity_field")
        .update({ is_active: false })
        .eq("activity_id", activity.activity_id)
        .eq("is_active", true)

      if (deactFieldsErr) {
        toast.error(deactFieldsErr.message || "ลบ Activity Field ไม่สำเร็จ")
        updateActivityLocal(activity.activity_id, { _isSaving: false })
        setSavingActivity(false)
        return
      }
    }

    // 2) ปิดการใช้งาน Activity
    const { error } = await supabase
      .from("activity")
      .update({ is_active: false })
      .eq("activity_id", activity.activity_id)
      .eq("is_active", true)

    if (error) {
      toast.error(error.message || "ลบ Activity ไม่สำเร็จ")
      updateActivityLocal(activity.activity_id, { _isSaving: false })
      setSavingActivity(false)
      return
    }

    // update UI
    const next = activities.find((a) => keyOf(a.activity_id) !== keyOf(activity.activity_id))
    setActivities((prev) => prev.filter((a) => keyOf(a.activity_id) !== keyOf(activity.activity_id)))

    if (keyOf(selectedActivityId) === keyOf(activity.activity_id)) {
      setSelectedActivityId(next?.activity_id ?? null)
      setActivityFields([])
      setFieldUnits({})
    }

    toast.success("ลบ Activity แล้ว")
    setSavingActivity(false)
  }

  // =========================================================
  // 1) Activity Field CRUD
  // =========================================================
  function addActivityFieldRow() {
    if (!isNumberId(selectedActivityId)) {
      toast.error("กรุณาเลือก Activity (ที่บันทึกแล้ว) ก่อน")
      return
    }

    const tempId = `new-field-${Date.now()}`
    setActivityFields((prev) => [
      ...prev,
      {
        field_id: tempId,
        activity_id: selectedActivityId,
        field_key: "",
        field_label: "",
        field_type: "number",
        field_order: (prev.at(-1)?.field_order ?? 0) + 1,
        dropdown_group_key: null,
        _isNew: true,
        _isSaving: false,
      },
    ])

    setFieldUnits((prev) => ({ ...prev, [tempId]: prev[tempId] ?? [] }))
  }

  function updateActivityFieldLocal(id: ActivityField["field_id"], patch: Partial<ActivityField>) {
    setActivityFields((prev) => prev.map((f) => (f.field_id === id ? { ...f, ...patch } : f)))
  }

  function toggleUnitForField(fieldId: number | string, unitId: number) {
    const k = keyOf(fieldId)
    setFieldUnits((prev) => {
      const current = prev[k] ?? []
      const exists = current.includes(unitId)
      const next = exists ? current.filter((u) => u !== unitId) : [...current, unitId]
      return { ...prev, [k]: next }
    })
  }

  async function saveActivityField(field: ActivityField) {
    if (!isNumberId(selectedActivityId)) {
      toast.error("ยังไม่ได้เลือก Activity ที่บันทึกแล้ว")
      return
    }

    if (!field.field_key.trim()) return toast.error("กรุณากรอก field_key")
    if (!field.field_label.trim()) return toast.error("กรุณากรอกชื่อ Label")

    if (field.field_type === "dropdown" && !field.dropdown_group_key) {
      return toast.error("กรุณาเลือก dropdown_group_key สำหรับ field แบบ dropdown")
    }

    const payload: any = {
      activity_id: selectedActivityId,
      field_key: field.field_key.trim(),
      field_label: field.field_label.trim(),
      field_type: field.field_type,
      field_order: field.field_order ?? null,
      dropdown_group_key: field.field_type === "dropdown" ? field.dropdown_group_key : null,
      is_active: true, // สำคัญ: insert/update ให้ active
    }

    const tempKey = keyOf(field.field_id)
    const selectedUnitIds = fieldUnits[tempKey] ?? []

    setSavingField(true)
    updateActivityFieldLocal(field.field_id, { _isSaving: true })

    // INSERT
    if (field._isNew) {
      const { data, error } = await supabase
        .from("activity_field")
        .insert(payload)
        .select("field_id, activity_id, field_key, field_label, field_type, field_order, dropdown_group_key")
        .maybeSingle()

      if (error || !data) {
        toast.error(error?.message ?? "เพิ่ม activity_field ไม่สำเร็จ")
        updateActivityFieldLocal(field.field_id, { _isSaving: false })
        setSavingField(false)
        return
      }

      const realId = data.field_id as number
      const realKey = keyOf(realId)

      if (payload.field_type === "number") {
        if (selectedUnitIds.length > 0) {
          const rows = selectedUnitIds.map((u) => ({ field_id: realId, unit_id: u }))
          const { error: mapErr } = await supabase.from("activity_field_unit").insert(rows)
          if (mapErr) toast.error(mapErr.message || "บันทึก unit mapping ไม่สำเร็จ")
        }
      } else {
        setFieldUnits((prev) => {
          const { [tempKey]: _, ...rest } = prev
          return rest
        })
      }

      setActivityFields((prev) =>
        prev
          .map((f) => (f.field_id === field.field_id ? { ...data, _isNew: false, _isSaving: false } : f))
          .sort((a, b) => (a.field_order ?? 0) - (b.field_order ?? 0)),
      )

      setFieldUnits((prev) => {
        const temp = prev[tempKey] ?? []
        const { [tempKey]: _, ...rest } = prev
        if (payload.field_type !== "number") return rest
        return { ...rest, [realKey]: temp }
      })

      toast.success("เพิ่ม Activity Field แล้ว")
      setSavingField(false)
      return
    }

    // UPDATE
    const fieldIdNum = field.field_id as number
    const { error: updErr } = await supabase
      .from("activity_field")
      .update(payload)
      .eq("field_id", fieldIdNum)

    if (updErr) {
      toast.error(updErr.message || "บันทึก activity_field ไม่สำเร็จ")
      updateActivityFieldLocal(field.field_id, { _isSaving: false })
      setSavingField(false)
      return
    }

    const realKey = keyOf(fieldIdNum)

    const { error: delMapErr } = await supabase.from("activity_field_unit").delete().eq("field_id", fieldIdNum)
    if (delMapErr) toast.error(delMapErr.message || "ลบ unit mapping เดิมไม่สำเร็จ")

    if (payload.field_type === "number") {
      const finalUnits = fieldUnits[realKey] ?? []
      if (finalUnits.length > 0) {
        const rows = finalUnits.map((u) => ({ field_id: fieldIdNum, unit_id: u }))
        const { error: insMapErr } = await supabase.from("activity_field_unit").insert(rows)
        if (insMapErr) toast.error(insMapErr.message || "บันทึก unit mapping ไม่สำเร็จ")
      }
    } else {
      setFieldUnits((prev) => {
        const { [realKey]: _, ...rest } = prev
        return rest
      })
    }

    updateActivityFieldLocal(field.field_id, { _isNew: false, _isSaving: false })
    toast.success("บันทึก Activity Field แล้ว")
    setSavingField(false)
  }

  async function deleteActivityField(field: ActivityField) {
    if (field._isNew) {
      const k = keyOf(field.field_id)
      setActivityFields((prev) => prev.filter((f) => f.field_id !== field.field_id))
      setFieldUnits((prev) => {
        const { [k]: _, ...rest } = prev
        return rest
      })
      return
    }

    const ok = window.confirm(`ต้องการลบ Field "${field.field_label}" หรือไม่?`)
    if (!ok) return

    const fieldIdNum = field.field_id as number

    const { error } = await supabase
      .from("activity_field")
      .update({ is_active: false })
      .eq("field_id", fieldIdNum)
      .eq("is_active", true)

    if (error) {
      toast.error(error.message || "ลบ activity_field ไม่สำเร็จ")
      return
    }

    const k = keyOf(fieldIdNum)
    setActivityFields((prev) => prev.filter((f) => f.field_id !== field.field_id))
    setFieldUnits((prev) => {
      const { [k]: _, ...rest } = prev
      return rest
    })

    toast.success("ลบ Activity Field แล้ว")
  }

  // =========================================================
  // 2) Dropdown Group + Options CRUD (+ delete + rename/migrate)
  // =========================================================
  function addDropdownGroupRow() {
    const key = prompt("กรอก key ของ group (เช่น vehicle_type, fuel_type):")
    if (!key) return
    const trimmed = key.trim()
    if (!trimmed) return

    if (dropdownGroups.some((g) => g.dropdown_group_key === trimmed)) {
      toast.error("Group key นี้มีอยู่แล้ว")
      setSelectedGroupKey(trimmed)
      return
    }

    setDropdownGroups((prev) =>
      sortDropdownGroups([
        ...prev,
        { dropdown_group_key: trimmed, description: "", _isNew: true, _isSaving: false },
      ]),
    )
    setSelectedGroupKey(trimmed)
    setRenameDraftKey(trimmed)
    toast.success("เพิ่ม Dropdown Group ใน UI แล้ว (อย่าลืมกดบันทึก)")
  }

  function updateDropdownGroupLocal(key: string, patch: Partial<DropdownGroupRow>) {
    setDropdownGroups((prev) => prev.map((g) => (g.dropdown_group_key === key ? { ...g, ...patch } : g)))
  }

  async function saveDropdownGroup() {
    if (!selectedGroupKey) return
    const group = dropdownGroups.find((g) => g.dropdown_group_key === selectedGroupKey)
    if (!group) return

    setSavingGroup(true)
    updateDropdownGroupLocal(group.dropdown_group_key, { _isSaving: true })

    const { error } = await supabase.from("dropdown_group").upsert({
      dropdown_group_key: group.dropdown_group_key,
      description: group.description ?? null,
      is_active: true, // สำคัญ: บันทึกแล้วต้อง active
    } as any)

    setSavingGroup(false)
    updateDropdownGroupLocal(group.dropdown_group_key, { _isSaving: false })

    if (error) {
      toast.error(error.message || "บันทึก Dropdown Group ไม่สำเร็จ")
      return
    }

    updateDropdownGroupLocal(group.dropdown_group_key, { _isNew: false })
    toast.success("บันทึก Dropdown Group แล้ว")
  }

  async function renameDropdownGroupKey(oldKey: string, newKeyRaw: string) {
    const newKey = newKeyRaw.trim()
    if (!newKey) return toast.error("กรุณากรอก key ใหม่")
    if (newKey === oldKey) return toast.error("key ใหม่ต้องต่างจากเดิม")
    if (dropdownGroups.some((g) => g.dropdown_group_key === newKey)) return toast.error("key ใหม่นี้มีอยู่แล้วใน UI")

    const group = dropdownGroups.find((g) => g.dropdown_group_key === oldKey)
    if (!group) return

    // ถ้ายังไม่ save (อยู่ใน UI เท่านั้น) => แค่เปลี่ยน key ใน state
    if (group._isNew) {
      setDropdownGroups((prev) =>
        prev.map((g) => (g.dropdown_group_key === oldKey ? { ...g, dropdown_group_key: newKey } : g)),
      )
      if (selectedGroupKey === oldKey) setSelectedGroupKey(newKey)
      setRenameDraftKey(newKey)
      toast.success("แก้ key ใน UI แล้ว (อย่าลืมกดบันทึก)")
      return
    }

    const ok = window.confirm(
      `ต้องการเปลี่ยน key จาก "${oldKey}" → "${newKey}" ไหม?\nระบบจะย้ายการอ้างอิงใน option_item และ activity_field ให้ด้วย`,
    )
    if (!ok) return

    setRenamingGroup(true)

    // 1) เช็ค newKey ใน DB (รวมถึงที่ inactive)
    const { data: existsRow, error: existsErr } = await supabase
      .from("dropdown_group")
      .select("dropdown_group_key, is_active")
      .eq("dropdown_group_key", newKey)
      .maybeSingle()

    if (existsErr) {
      toast.error(existsErr.message || "ตรวจสอบ key ใหม่ไม่สำเร็จ")
      setRenamingGroup(false)
      return
    }

    // 2) เตรียม group ใหม่ (ถ้ามีอยู่แต่ inactive -> revive, ถ้าไม่มี -> insert)
    if (existsRow) {
      if (existsRow.is_active) {
        toast.error("key ใหม่นี้มีอยู่แล้วในฐานข้อมูล")
        setRenamingGroup(false)
        return
      } else {
        const { error: reviveErr } = await supabase
          .from("dropdown_group")
          .update({ is_active: true, description: group.description ?? null })
          .eq("dropdown_group_key", newKey)
        if (reviveErr) {
          toast.error(reviveErr.message || "กู้คืน group ใหม่ไม่สำเร็จ")
          setRenamingGroup(false)
          return
        }
      }
    } else {
      const { error: insErr } = await supabase.from("dropdown_group").insert({
        dropdown_group_key: newKey,
        description: group.description ?? null,
        is_active: true,
      } as any)

      if (insErr) {
        toast.error(insErr.message || "สร้าง group ใหม่ไม่สำเร็จ")
        setRenamingGroup(false)
        return
      }
    }

    // 3) ย้าย references (ย้ายทั้งหมด ไม่สนใจ is_active เพื่อกันข้อมูลค้าง)
    const { error: optUpdErr } = await supabase
      .from("option_item")
      .update({ dropdown_group_key: newKey })
      .eq("dropdown_group_key", oldKey)
    if (optUpdErr) toast.error(optUpdErr.message || "ย้าย option_item ไม่สำเร็จ")

    const { error: fieldUpdErr } = await supabase
      .from("activity_field")
      .update({ dropdown_group_key: newKey })
      .eq("dropdown_group_key", oldKey)
    if (fieldUpdErr) toast.error(fieldUpdErr.message || "ย้าย activity_field ไม่สำเร็จ")

    // 4) ปิดการใช้งาน group เก่า (แทน delete)
    const { error: deactOldErr } = await supabase
      .from("dropdown_group")
      .update({ is_active: false })
      .eq("dropdown_group_key", oldKey)
      .eq("is_active", true)

    if (deactOldErr) {
      toast.error(deactOldErr.message || "ปิดการใช้งาน group เก่าไม่สำเร็จ")
      setRenamingGroup(false)
      return
    }

    // 5) update UI
    setDropdownGroups((prev) =>
      sortDropdownGroups(prev.map((g) => (g.dropdown_group_key === oldKey ? { ...g, dropdown_group_key: newKey } : g))),
    )

    setActivityFields((prev) =>
      prev.map((f) => (f.dropdown_group_key === oldKey ? { ...f, dropdown_group_key: newKey } : f)),
    )

    setOptions((prev) => prev.map((o) => ({ ...o, dropdown_group_key: newKey })))

    setSelectedGroupKey(newKey)
    setRenameDraftKey(newKey)

    toast.success("เปลี่ยน key และย้ายการอ้างอิงเรียบร้อย")
    setRenamingGroup(false)
  }

  async function deleteDropdownGroupKey(groupKey: string) {
    const group = dropdownGroups.find((g) => g.dropdown_group_key === groupKey)
    if (!group) return

    // unsaved group in UI only
    if (group._isNew) {
      const okUI = window.confirm(`ลบ group "${groupKey}" ออกจาก UI หรือไม่? (ยังไม่ถูกบันทึกลงฐานข้อมูล)`)
      if (!okUI) return
      setDropdownGroups((prev) => prev.filter((g) => g.dropdown_group_key !== groupKey))
      if (selectedGroupKey === groupKey) {
        const next = dropdownGroups.find((g) => g.dropdown_group_key !== groupKey)
        setSelectedGroupKey(next?.dropdown_group_key ?? null)
        setRenameDraftKey(next?.dropdown_group_key ?? "")
      }
      toast.success("ลบ group (ใน UI) แล้ว")
      return
    }

    // check usage in DB (เฉพาะ ACTIVE)
    const { count: optCount, error: optCntErr } = await supabase
      .from("option_item")
      .select("option_id", { count: "exact", head: true })
      .eq("dropdown_group_key", groupKey)
      .eq("is_active", true)

    if (optCntErr) {
      toast.error(optCntErr.message || "ตรวจสอบ option_item ไม่สำเร็จ")
      return
    }

    const { count: fieldCount, error: fieldCntErr } = await supabase
      .from("activity_field")
      .select("field_id", { count: "exact", head: true })
      .eq("dropdown_group_key", groupKey)
      .eq("is_active", true)

    if (fieldCntErr) {
      toast.error(fieldCntErr.message || "ตรวจสอบ activity_field ไม่สำเร็จ")
      return
    }

    const usedOpt = optCount ?? 0
    const usedField = fieldCount ?? 0
    const used = usedOpt + usedField

    const ok = window.confirm(
      used > 0
        ? `Group "${groupKey}" ถูกใช้อยู่ (ที่ยัง active)\n- option_item: ${usedOpt}\n- activity_field: ${usedField}\n\nต้องการ "ลบพร้อมล้างการอ้างอิง" ไหม?\n(จะปิดการใช้งาน option_item ทั้งหมดและตั้งค่า activity_field.dropdown_group_key = null)`
        : `ต้องการลบ Group "${groupKey}" หรือไม่?`,
    )
    if (!ok) return

    setSavingGroup(true)
    updateDropdownGroupLocal(groupKey, { _isSaving: true })

    if (used > 0) {
      // 1) clear activity_field refs (เฉพาะ active)
      const { error: clrErr } = await supabase
        .from("activity_field")
        .update({ dropdown_group_key: null })
        .eq("dropdown_group_key", groupKey)
        .eq("is_active", true)

      if (clrErr) {
        toast.error(clrErr.message || "ล้างการอ้างอิงใน activity_field ไม่สำเร็จ")
        updateDropdownGroupLocal(groupKey, { _isSaving: false })
        setSavingGroup(false)
        return
      }

      // 2) deactivate options (แทน delete)
      const { error: deactOptErr } = await supabase
        .from("option_item")
        .update({ is_active: false })
        .eq("dropdown_group_key", groupKey)
        .eq("is_active", true)

      if (deactOptErr) {
        toast.error(deactOptErr.message || "ลบ option_item ไม่สำเร็จ")
        updateDropdownGroupLocal(groupKey, { _isSaving: false })
        setSavingGroup(false)
        return
      }
    }

    // 3) deactivate group (แทน delete)
    const { error: deactGroupErr } = await supabase
      .from("dropdown_group")
      .update({ is_active: false })
      .eq("dropdown_group_key", groupKey)
      .eq("is_active", true)

    updateDropdownGroupLocal(groupKey, { _isSaving: false })
    setSavingGroup(false)

    if (deactGroupErr) {
      toast.error(deactGroupErr.message || "ลบ dropdown_group ไม่สำเร็จ")
      return
    }

    // update UI
    setDropdownGroups((prev) => prev.filter((g) => g.dropdown_group_key !== groupKey))
    setActivityFields((prev) =>
      prev.map((f) => (f.dropdown_group_key === groupKey ? { ...f, dropdown_group_key: null } : f)),
    )

    if (selectedGroupKey === groupKey) {
      const next = dropdownGroups.find((g) => g.dropdown_group_key !== groupKey)
      setSelectedGroupKey(next?.dropdown_group_key ?? null)
      setRenameDraftKey(next?.dropdown_group_key ?? "")
      setOptions([])
    }

    toast.success("ลบ Dropdown Group แล้ว")
  }

  function addOptionRow() {
    if (!selectedGroupKey) {
      toast.error("กรุณาเลือก Dropdown Group ก่อน")
      return
    }
    if (!isGroupSaved) {
      toast.error("กรุณากดบันทึก Dropdown Group ก่อนเพิ่ม Option")
      return
    }

    const tempId = `new-opt-${Date.now()}`
    setOptions((prev) => [
      ...prev,
      {
        option_id: tempId,
        dropdown_group_key: selectedGroupKey,
        value_code: "",
        display_name: "",
        source_factor_id: null,
        emission_factor_id: null,
        is_context_only: true,
        factor_type: "context_only",
        _isNew: true,
        _isSaving: false,
      },
    ])
  }

  function updateOptionLocal(id: OptionItem["option_id"], patch: Partial<OptionItem>) {
    setOptions((prev) => prev.map((o) => (o.option_id === id ? { ...o, ...patch } : o)))
  }

  async function saveOption(option: OptionItem) {
    if (!selectedGroupKey) return
    if (!isGroupSaved) return toast.error("กรุณาบันทึก Dropdown Group ก่อน")

    if (!option.value_code.trim()) return toast.error("กรุณากรอก value_code")
    if (!option.display_name.trim()) return toast.error("กรุณากรอกชื่อที่แสดง (display_name)")

    let source_factor_id: number | null = null
    let emission_factor_id: number | null = null
    let is_context_only = false

    if (option.factor_type === "context_only") {
      is_context_only = true
    } else if (option.factor_type === "source_factor_id") {
      source_factor_id = option.source_factor_id
      if (!source_factor_id) return toast.error("กรุณาเลือก Source Factor")
    } else if (option.factor_type === "emission_factor_id") {
      emission_factor_id = option.emission_factor_id
      if (!emission_factor_id) return toast.error("กรุณาเลือก Emission Factor")
    }

    const payload: any = {
      dropdown_group_key: selectedGroupKey,
      value_code: option.value_code.trim(),
      display_name: option.display_name.trim(),
      source_factor_id,
      emission_factor_id,
      is_context_only,
      is_active: true, // สำคัญ
    }

    setSavingOption(true)
    updateOptionLocal(option.option_id, { _isSaving: true })

    if (option._isNew) {
      const { data, error } = await supabase
        .from("option_item")
        .insert(payload)
        .select("option_id, dropdown_group_key, value_code, display_name, source_factor_id, emission_factor_id, is_context_only")
        .maybeSingle()

      if (error || !data) {
        toast.error(error?.message ?? "เพิ่ม Option ไม่สำเร็จ")
        updateOptionLocal(option.option_id, { _isSaving: false })
        setSavingOption(false)
        return
      }

      let factor_type: OptionFactorType = "context_only"
      if (data.is_context_only) factor_type = "context_only"
      else if (data.source_factor_id) factor_type = "source_factor_id"
      else if (data.emission_factor_id) factor_type = "emission_factor_id"

      setOptions((prev) =>
        prev.map((o) =>
          o.option_id === option.option_id
            ? { ...data, factor_type, _isNew: false, _isSaving: false }
            : o,
        ),
      )

      toast.success("เพิ่ม Option แล้ว")
    } else {
      const { error } = await supabase.from("option_item").update(payload).eq("option_id", option.option_id)

      if (error) {
        toast.error(error.message || "บันทึก Option ไม่สำเร็จ")
        updateOptionLocal(option.option_id, { _isSaving: false })
        setSavingOption(false)
        return
      }

      updateOptionLocal(option.option_id, {
        ...payload,
        factor_type: option.factor_type,
        _isNew: false,
        _isSaving: false,
      })

      toast.success("บันทึก Option แล้ว")
    }

    setSavingOption(false)
  }

  async function deleteOption(option: OptionItem) {
    if (option._isNew) {
      setOptions((prev) => prev.filter((o) => o.option_id !== option.option_id))
      return
    }

    const ok = window.confirm(`ต้องการลบตัวเลือก "${option.display_name}" หรือไม่?`)
    if (!ok) return

    const { error } = await supabase
      .from("option_item")
      .update({ is_active: false })
      .eq("option_id", option.option_id)
      .eq("is_active", true)

    if (error) {
      toast.error(error.message || "ลบ Option ไม่สำเร็จ")
      return
    }

    setOptions((prev) => prev.filter((o) => o.option_id !== option.option_id))
    toast.success("ลบ Option แล้ว")
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10 text-white">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold">จัดการโครงสร้างแบบฟอร์มคำนวณคาร์บอน </h1>
        <p className="max-w-3xl text-sm md:text-base text-text-secondary leading-relaxed whitespace-nowrap">
          เลือก Scope → จัดการ Activity → จัดการ Activity Fields (unit / dropdown) และจัดการ Dropdown Group + Options
        </p>
      </header>

      {/* Scope */}
      <section className="rounded-3xl bg-black/30 border border-white/25 px-6 py-6 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold mb-1">เลือก Scope ที่ต้องการจัดการ</h2>

        <div className="space-y-1.5">
          {/* <label className="text-xs text-text-secondary">Scope</label> */}
          <select
            className="h-10 w-full rounded-md border border-white/30 bg-black/40 px-3 text-sm mt-3"
            value={selectedScopeId ?? ""}
            onChange={(e) => {
              const v = e.target.value
              setSelectedScopeId(v ? Number(v) : null)

              // reset downstream
              setSelectedActivityId(null)
              setActivities([])
              setActivityFields([])
              setFieldUnits({})
            }}
          >
            {loadingScopes && <option value="">กำลังโหลด...</option>}
            {!loadingScopes && scopes.length === 0 && <option value="">(ยังไม่มี Scope)</option>}
            {!loadingScopes &&
              scopes.map((s) => (
                <option key={s.scope_id} value={s.scope_id}>
                  {s.scope_name ?? `Scope ${s.scope_id}`}
                </option>
              ))}
          </select>
        </div>

        {/* {activeScope && (
          <p className="mt-2 text-xs md:text-sm text-text-secondary">
            ตอนนี้กำลังแก้ไข Scope:{" "}
            <span className="font-medium text-white">{activeScope.scope_name ?? `Scope ${activeScope.scope_id}`}</span>
          </p>
        )} */}
      </section>

      {/* Activity Manager */}
      <section className="space-y-4 rounded-3xl bg-black/30 border border-white/25 px-6 py-6">
        <div className="flex items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">จัดการ Activity ใน Scope นี้</h2>
            <p className="text-sm text-text-secondary mt-1">
              📌 เพิ่ม / แก้ไขชื่อ / ลบ Activity แล้วเลือก Activity ที่ต้องการ เพื่อไปจัดการช่องข้อมูล (Fields) ด้านล่าง
            </p>
          </div>
          <Button
            size="sm"
            className="h-9 rounded-lg px-4 bg-white/10 backdrop-blur-sm border border-white/40 text-white text-sm shadow-lg shadow-black/20 hover:bg-white/20 hover:shadow-black/30 transition-all"
            onClick={addActivityRow}
            disabled={!selectedScopeId}
          >
            + เพิ่ม Activity
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/40">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-white/10 text-[11px] uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-3 py-2 text-left w-[14%]">ID</th>
                <th className="px-3 py-2 text-left w-[56%]">ชื่อ Activity</th>
                <th className="px-3 py-2 text-left w-[30%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loadingActivities ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-text-secondary">
                    กำลังโหลด Activity...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-text-secondary">
                    ยังไม่มี Activity ใน Scope นี้
                  </td>
                </tr>
              ) : (
                activities.map((a) => {
                  const isSelected = keyOf(selectedActivityId) === keyOf(a.activity_id)
                  return (
                    <tr
                      key={keyOf(a.activity_id)}
                      className={`border-t border-white/10 align-top ${isSelected ? "bg-white/10" : "hover:bg-white/10"}`}
                    >
                      <td className="px-3 py-2 text-text-secondary">
                        <span className="font-medium text-white">{keyOf(a.activity_id)}</span>
                        {a._isNew && <span className="ml-2 text-[10px] text-yellow-300/90">(ใหม่)</span>}
                      </td>

                      <td className="px-3 py-2">
                        <Input
                          value={a.activity_name ?? ""}
                          onChange={(e) => updateActivityLocal(a.activity_id, { activity_name: e.target.value })}
                          className="h-8 bg-black/40 border-white/30 text-xs"
                        />
                        {a._isNew && (
                          <p className="mt-1 text-[10px] text-text-secondary">
                            * Activity ใหม่ต้องกดบันทึกก่อน ถึงจะไปสร้าง Field ได้
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            size="sm"
                            className="h-8 px-3 rounded-md bg-white/10 border border-white/50 text-white text-[11px] hover:bg-white/20"
                            onClick={() => setSelectedActivityId(a.activity_id)}
                          >
                            เลือก
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-3 rounded-md bg-green-600/70 text-white text-[11px] hover:bg-green-600"
                            disabled={a._isSaving || savingActivity}
                            onClick={() => saveActivityRow(a)}
                          >
                            {a._isSaving ? "กำลังบันทึก..." : "บันทึก"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-3 rounded-md bg-red-600/70 hover:bg-red-600 text-[11px]"
                            disabled={a._isSaving || savingActivity}
                            onClick={() => deleteActivityRow(a)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {activeActivity && (
          <p className="mt-2 text-xs md:text-sm text-text-secondary">
            ตอนนี้เลือก Activity:{" "}
            <span className="font-medium text-emerald-300">
              {activeActivity.activity_name ?? `Activity ${keyOf(activeActivity.activity_id)}`}
            </span>
          </p>
        )}
      </section>

      {/* Activity Fields */}
      <section className="space-y-4 rounded-3xl bg-black/30 border border-white/25 px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">ช่องข้อมูล (Activity Fields)</h2>
            <p className="text-sm text-text-secondary mt-1">
              📌 สร้าง / แก้ไข และกำหนดลำดับการแสดงผล
              รวมทั้งเลือกหน่วยหรือ dropdown_group ที่ใช้
            </p>
          </div>
          <Button
            size="sm"
            className="h-9 rounded-lg px-4 bg-white/10 backdrop-blur-sm border border-white/40 text-white text-sm shadow-lg shadow-black/20 hover:bg-white/20 hover:shadow-black/30 transition-all"
            onClick={addActivityFieldRow}
            disabled={!isNumberId(selectedActivityId)}
          >
            + เพิ่ม Activity Field
          </Button>
        </div>

        {!isNumberId(selectedActivityId) ? (
          <div className="rounded-2xl border border-white/20 bg-black/40 px-4 py-4 text-sm text-text-secondary">
            กรุณาเลือก Activity ที่ “บันทึกแล้ว” ก่อน เพื่อจัดการ Fields
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/40">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-white/10 text-[11px] uppercase tracking-wide text-text-secondary">
                <tr>
                  <th className="px-3 py-2 text-left w-[16%]">field_key</th>
                  <th className="px-3 py-2 text-left w-[20%]">ชื่อแสดงผล</th>
                  <th className="px-3 py-2 text-left w-[12%]">ประเภท</th>
                  <th className="px-3 py-2 text-left w-[10%]">ลำดับ</th>
                  <th className="px-3 py-2 text-left w-[27%]">หน่วย / Dropdown Group</th>
                  <th className="px-3 py-2 text-left w-[15%]">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loadingFields ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-text-secondary">
                      กำลังโหลด Activity Fields...
                    </td>
                  </tr>
                ) : activityFields.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-text-secondary">
                      ยังไม่มี Activity Field ในกิจกรรมนี้
                    </td>
                  </tr>
                ) : (
                  activityFields.map((field) => {
                    const isNumber = field.field_type === "number"
                    const isDropdown = field.field_type === "dropdown"
                    const selectedUnitIds = fieldUnits[keyOf(field.field_id)] ?? []

                    return (
                      <tr key={field.field_id} className="border-t border-white/10 hover:bg-white/10 align-top">
                        <td className="px-3 py-2">
                          <Input
                            value={field.field_key}
                            onChange={(e) => updateActivityFieldLocal(field.field_id, { field_key: e.target.value })}
                            className="h-8 bg-black/40 border-white/30 text-xs"
                          />
                        </td>

                        <td className="px-3 py-2">
                          <Input
                            value={field.field_label}
                            onChange={(e) => updateActivityFieldLocal(field.field_id, { field_label: e.target.value })}
                            className="h-8 bg-black/40 border-white/30 text-xs"
                          />
                        </td>

                        <td className="px-3 py-2">
                          <select
                            className="h-8 w-full rounded-md bg-black/40 border border-white/30 px-2 text-xs"
                            value={field.field_type}
                            onChange={(e) =>
                              updateActivityFieldLocal(field.field_id, {
                                field_type: e.target.value as FieldType,
                                ...(e.target.value === "dropdown" ? {} : { dropdown_group_key: null }),
                              })
                            }
                          >
                            <option value="number">number</option>
                            <option value="dropdown">dropdown</option>
                            {/* <option value="text">text</option> */}
                          </select>
                        </td>

                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            value={field.field_order ?? ""}
                            onChange={(e) =>
                              updateActivityFieldLocal(field.field_id, {
                                field_order: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 bg-black/40 border-white/30 text-xs"
                          />
                        </td>

                        <td className="px-3 py-2">
                          {isNumber && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-text-secondary">เลือกหน่วยที่ใช้ได้กับช่องนี้</p>
                              <div className="flex flex-wrap gap-1">
                                {units.map((u) => (
                                  <label
                                    key={u.unit_id}
                                    className="inline-flex items-center gap-1 rounded-full bg-black/40 border border-white/20 px-2 py-0.5 text-[10px]"
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-3 w-3"
                                      checked={selectedUnitIds.includes(u.unit_id)}
                                      onChange={() => toggleUnitForField(field.field_id, u.unit_id)}
                                    />
                                    {u.symbol || u.code || u.name}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {isDropdown && (
                            <div className="space-y-1">
                              {/* <p className="text-[10px] text-text-secondary">เลือก dropdown_group_key ที่ใช้เป็นชุดตัวเลือก</p> */}
                              <select
                                className="h-8 w-full rounded-md bg-black/40 border border-white/30 px-2 text-xs"
                                value={field.dropdown_group_key ?? ""}
                                onChange={(e) =>
                                  updateActivityFieldLocal(field.field_id, {
                                    dropdown_group_key: e.target.value || null,
                                  })
                                }
                              >
                                <option value="">เลือก dropdown_group ที่ใช้เป็นชุดตัวเลือก</option>
                                {dropdownGroups.map((g) => (
                                  <option key={g.dropdown_group_key} value={g.dropdown_group_key}>
                                    {g.dropdown_group_key}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {!isNumber && !isDropdown && (
                            <p className="text-[11px] text-text-secondary">ช่องข้อความธรรมดา (text) ไม่ต้องผูก unit / dropdown</p>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-8 px-3 rounded-md bg-green-600/70 text-white text-[11px] hover:bg-green-600"
                              disabled={field._isSaving || savingField}
                              onClick={() => saveActivityField(field)}
                            >
                              {field._isSaving ? "กำลังบันทึก..." : "บันทึก"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-3 rounded-md bg-red-600/70 hover:bg-red-600 text-[11px]"
                              onClick={() => deleteActivityField(field)}
                            >
                              ลบ
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dropdown group + option editor */}
      <section className="space-y-5 rounded-3xl bg-black/25 border border-white/25 px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">จัดการ Dropdown Group และตัวเลือก (option_item)</h2>
            <p className="text-xs md:text-sm text-text-secondary mt-1 max-w-3xl">
              📌 ใช้สำหรับ field_type = &quot;dropdown&quot; ซึ่งทุก group จะมี key เช่น{" "}
              <code className="text-[15px] text-emerald-300">vehicle_type</code>, <code className="text-[15px] text-emerald-300">fuel_type</code>{" "}
            </p>  
            <p className="text-xs md:text-sm text-text-secondary mt-1 max-w-3xl">
              และมี option ที่เป็นตัวเลือกต่างๆใน Dropdown Group นั้นๆ
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 px-3 rounded-md bg-white/10 border border-white/50 text-white text-xs shadow-lg shadow-black/20 hover:bg-white/20 hover:shadow-black/30"
              onClick={addDropdownGroupRow}
            >
              + สร้าง Group ใหม่
            </Button>

            <Button
              size="sm"
              className="h-8 px-3 rounded-md bg-green-600/70 text-white text-xs hover:bg-green-600"
              disabled={!selectedGroupKey || savingGroup}
              onClick={saveDropdownGroup}
            >
              {savingGroup ? "กำลังบันทึก..." : "บันทึก Group ปัจจุบัน"}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              className="h-8 px-3 rounded-md bg-red-600/80 hover:bg-red-600 text-xs"
              disabled={!selectedGroupKey || savingGroup}
              onClick={() => selectedGroupKey && deleteDropdownGroupKey(selectedGroupKey)}
            >
              ลบ Group
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[260px,1fr] mt-8">
          {/* list group ซ้ายมือ */}
          <div className="space-y-8">
            <p className="text-[14px] text-text-secondary mb-2">เลือก Group ที่ต้องการแก้ไข</p>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {dropdownGroups.length === 0 ? (
                <span className="text-xs text-text-secondary">ยังไม่มี dropdown_group ในระบบ</span>
              ) : (
                dropdownGroups.map((g) => (
                  <button
                    key={g.dropdown_group_key}
                    type="button"
                    onClick={() => {
                      setSelectedGroupKey(g.dropdown_group_key)
                      setRenameDraftKey(g.dropdown_group_key)
                    }}
                    className={`text-left rounded-lg px-3 py-2 border text-xs transition-colors ${
                      selectedGroupKey === g.dropdown_group_key
                        ? "bg-white text-black border-white"
                        : "bg-black/30 border-white/40 text-text-secondary hover:bg-white/10"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between gap-2">
                      <span>{g.dropdown_group_key}</span>
                      {g._isNew && <span className="text-[10px] text-yellow-500">(ใหม่)</span>}
                    </div>
                    {g.description && <div className="text-[10px] opacity-80 line-clamp-2">{g.description}</div>}
                  </button>
                ))
              )}
            </div>

            {selectedGroupKey && (
              <div className="mt-3 space-y-3">
                <label className="text-[14px] text-text-secondary">
                  คำอธิบายของ{" "}
                  <span className="font-semibold text-emerald-300">{selectedGroupKey}</span>
                </label>
                <textarea
                  className="w-full min-h-[70px] rounded-md bg-black/40 border border-white/30 px-2 py-1.5 text-xs"
                  value={dropdownGroups.find((g) => g.dropdown_group_key === selectedGroupKey)?.description ?? ""}
                  onChange={(e) => updateDropdownGroupLocal(selectedGroupKey, { description: e.target.value })}
                />

                {/* Rename key UI */}
                <p className="text-[14px] text-text-secondary mb-1">แก้ชื่อ key</p>
                <div className="rounded-xl border border-white/20 bg-black/30 px-3 py-3 space-y-2">
                  <Input
                    value={renameDraftKey}
                    onChange={(e) => setRenameDraftKey(e.target.value)}
                    className="h-8 bg-black/40 border-white/30 text-xs"
                    placeholder="key ใหม่ เช่น vehicle_type_v2"
                  />
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-md bg-white/10 border border-white/50 text-white text-xs hover:bg-white/20"
                    disabled={!selectedGroupKey || renamingGroup}
                    onClick={() => selectedGroupKey && renameDropdownGroupKey(selectedGroupKey, renameDraftKey)}
                  >
                    {renamingGroup ? "กำลังย้าย..." : "เปลี่ยน key"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* options ขวามือ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                ตัวเลือกใน group: <span className="text-emerald-300">{selectedGroupKey ?? "-"}</span>
              </p>
              <Button
                size="sm"
                className="h-8 px-3 rounded-md bg-white/10 border border-white/50 text-white text-xs shadow-lg shadow-black/20 hover:bg-white/20 hover:shadow-black/30"
                disabled={!selectedGroupKey || !isGroupSaved}
                onClick={addOptionRow}
              >
                + เพิ่ม Option
              </Button>
            </div>

            {!isGroupSaved && selectedGroupKey && (
              <div className="rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-[11px] text-text-secondary">
                * Group นี้ยังไม่ถูกบันทึกลงฐานข้อมูล — กรุณากด “บันทึก Group ปัจจุบัน” ก่อนเพิ่ม Option
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/40">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-white/10 text-[10px] uppercase tracking-wide text-text-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left w-[14%]">value_code</th>
                    <th className="px-3 py-2 text-left w-[20%]">display_name</th>
                    <th className="px-3 py-2 text-left w-[14%]">Factor Type</th>
                    <th className="px-3 py-2 text-left w-[24%]">Factor ที่เชื่อม</th>
                    <th className="px-3 py-2 text-left w-[16%]">หมายเหตุ</th>
                    <th className="px-3 py-2 text-left w-[12%]">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOptions ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-text-secondary">
                        กำลังโหลดตัวเลือก...
                      </td>
                    </tr>
                  ) : !selectedGroupKey ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-text-secondary">
                        กรุณาเลือก Dropdown Group ทางซ้ายก่อน
                      </td>
                    </tr>
                  ) : options.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-text-secondary">
                        ยังไม่มีตัวเลือกในกลุ่มนี้
                      </td>
                    </tr>
                  ) : (
                    options.map((opt) => {
                      const factorNote =
                        opt.factor_type === "source_factor_id"
                          ? "ใช้ค่าจาก source_factor"
                          : opt.factor_type === "emission_factor_id"
                          ? "ใช้ค่าจาก emission_factor"
                          : "ไม่ใช้คำนวณโดยตรง (context_only)"

                      return (
                        <tr key={opt.option_id} className="border-t border-white/10 hover:bg-white/10 align-top">
                          <td className="px-3 py-2">
                            <Input
                              value={opt.value_code}
                              onChange={(e) => updateOptionLocal(opt.option_id, { value_code: e.target.value })}
                              className="h-8 bg-black/40 border-white/30 text-[11px]"
                            />
                          </td>

                          <td className="px-3 py-2">
                            <Input
                              value={opt.display_name}
                              onChange={(e) => updateOptionLocal(opt.option_id, { display_name: e.target.value })}
                              className="h-8 bg-black/40 border-white/30 text-[11px]"
                            />
                          </td>

                          <td className="px-3 py-2">
                            <select
                              className="h-8 w-full rounded-md bg-black/40 border border-white/30 px-2 text-[11px]"
                              value={opt.factor_type}
                              onChange={(e) => {
                                const v = e.target.value as OptionFactorType
                                updateOptionLocal(opt.option_id, {
                                  factor_type: v,
                                  ...(v === "context_only"
                                    ? { source_factor_id: null, emission_factor_id: null, is_context_only: true }
                                    : v === "source_factor_id"
                                    ? { emission_factor_id: null, is_context_only: false }
                                    : { source_factor_id: null, is_context_only: false }),
                                })
                              }}
                            >
                              <option value="source_factor_id">source_factor_id</option>
                              <option value="emission_factor_id">emission_factor_id</option>
                              <option value="context_only">context_only</option>
                            </select>
                          </td>

                          <td className="px-3 py-2">
                            {opt.factor_type === "source_factor_id" && (
                              <select
                                className="h-8 w-full rounded-md bg-black/40 border border-white/30 px-2 text-[11px]"
                                value={opt.source_factor_id ?? ""}
                                onChange={(e) =>
                                  updateOptionLocal(opt.option_id, {
                                    source_factor_id: e.target.value ? Number(e.target.value) : null,
                                    is_context_only: false,
                                  })
                                }
                              >
                                <option value="">-- เลือก source_factor --</option>
                                {sourceFactors.map((s) => (
                                  <option key={s.source_id} value={s.source_id}>
                                    {s.source_id} - {s.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {opt.factor_type === "emission_factor_id" && (
                              <select
                                className="h-8 w-full rounded-md bg-black/40 border border-white/30 px-2 text-[11px]"
                                value={opt.emission_factor_id ?? ""}
                                onChange={(e) =>
                                  updateOptionLocal(opt.option_id, {
                                    emission_factor_id: e.target.value ? Number(e.target.value) : null,
                                    is_context_only: false,
                                  })
                                }
                              >
                                <option value="">-- เลือก emission_factor --</option>
                                {emissionFactors.map((ef) => (
                                  <option key={ef.efid} value={ef.efid}>
                                    {ef.efid} - {ef.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {opt.factor_type === "context_only" && (
                              <span className="text-[11px] text-text-secondary">ไม่ผูกกับ factor (ใช้เป็นข้อมูลเชิงบริบท)</span>
                            )}
                          </td>

                          <td className="px-3 py-2">
                            <span className="text-[10px] text-text-secondary">{factorNote}</span>
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex flex-row gap-2 items-center justify-end">
                              <Button
                                size="sm"
                                className="h-7 px-3 rounded-md bg-green-600/70 text-white text-[10px] hover:bg-green-600"
                                disabled={opt._isSaving || savingOption || !isGroupSaved}
                                onClick={() => saveOption(opt)}
                              >
                                {opt._isSaving ? "กำลังบันทึก..." : "บันทึก"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-3 rounded-md bg-red-600/70 hover:bg-red-600 text-[10px]"
                                onClick={() => deleteOption(opt)}
                              >
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 rounded-2xl bg-black/40 border border-white/20 px-4 py-3 text-[14px] leading-relaxed text-text-secondary space-y-1.5">
              <p className="font-semibold text-[18px] text-emerald-300 mb-1">Tips: Factor Type</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  ถ้าเป็น “เชื้อเพลิง / แหล่งพลังงาน” ใน scop 1,2 ใช้ <span className="font-medium text-[15px] text-emerald-300">source_factor</span>
                </li>
                <li>
                  ถ้าเป็น “กิจกรรม / กระบวนการคาร์บอน” ใน scop 3 ใช้ <span className="font-medium text-[15px] text-emerald-300">emission_factor</span>
                </li>
                <li>
                  ถ้าเป็น “ข้อมูลประกอบ” ไม่ได้ใช้คำนวณ เช่น ประเภทอาคาร, ประเภทวัสดุ ใช้ <span className="font-medium text-[15px] text-emerald-300">context_only</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
