// src/app/user/get-advice/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import {
  Sparkles,
  Wand2,
  Lightbulb,
  Target,
  ArrowLeft,
  Info,
} from "lucide-react"

type BudgetLevel = "low" | "medium" | "high"
type EffortLevel = "easy" | "normal" | "hard"
type TimeFrame = "1m" | "3m" | "6m"
type AdviceStyle = "short" | "step" | "plan"

const topicOptions = [
  {
    id: "overall",
    label: "ลดคาร์บอนรวมทั้งหมด",
    description: "ให้ AI มองภาพรวมทุก Scope แล้วเสนอสิ่งที่คุ้มที่สุดก่อน",
  },
  {
    id: "energy",
    label: "การใช้ไฟฟ้า / แอร์ / อุปกรณ์ไฟฟ้า",
    description: "โฟกัสที่พลังงานในอาคาร ที่มักเป็นสัดส่วนใหญ่ของคาร์บอน",
  },
  {
    id: "transport",
    label: "การเดินทางของนักศึกษาและบุคลากร",
    description: "เช่น รถส่วนตัว มอเตอร์ไซค์ รถรับส่ง มาตรการแชร์รถ",
  },
  {
    id: "waste",
    label: "การจัดการขยะและของเสีย",
    description: "เช่น แยกขยะ ลดใช้ของครั้งเดียว มีระบบรีไซเคิล",
  },
  {
    id: "water",
    label: "การใช้น้ำและระบบสาธารณูปโภค",
    description: "เช่น น้ำประปา น้ำหล่อเย็น ระบบผลิตน้ำดื่ม",
  },
] as const

export default function GetAdvicePage() {
  const router = useRouter()

  const [selectedTopic, setSelectedTopic] = useState<string>("overall")
  const [budget, setBudget] = useState<BudgetLevel>("medium")
  const [effort, setEffort] = useState<EffortLevel>("normal")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("3m")
  const [style, setStyle] = useState<AdviceStyle>("step")
  const [useLatestSummary, setUseLatestSummary] = useState<boolean>(true)
  const [extraContext, setExtraContext] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedTopic) {
      toast.error("กรุณาเลือกหัวข้อที่อยากให้ AI ช่วยแนะนำก่อน")
      return
    }

    setSubmitting(true)

    // ตอนนี้ยังไม่มี AI: ส่งค่าไปหน้า summary ผ่าน query string ให้เพื่อนไปต่อยอดเรียก API เอาเอง
    const payload = {
      topic: selectedTopic,
      budget,
      effort,
      timeFrame,
      style,
      useLatestSummary: useLatestSummary ? "1" : "0",
      extraContext: extraContext.trim(),
    }

    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(payload)) {
      if (v !== "" && v != null) params.set(k, String(v))
    }

    router.push(`/user/get-advice/summary?${params.toString()}`)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10 space-y-10 text-foreground">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-xs text-emerald-100/80">
              รับคำแนะนำเพื่อลดคาร์บอนจาก AI
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold">
            แบบฟอร์มขอคำแนะนำจาก AI
          </h1>

          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            ระบุเป้าหมาย ข้อจำกัด และข้อมูลเพิ่มเติมเล็กน้อย
            เพื่อให้ระบบ AI สร้างคำแนะนำที่เหมาะกับ{" "}
            <span className="font-semibold text-emerald-300">
              มหาวิทยาลัยของคุณจริง ๆ
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-emerald-400/80 text-emerald-200 bg-black/30 hover:bg-emerald-500/20"
            onClick={() => router.push("/user/calculate/summary")}
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าสรุปคาร์บอน
          </Button>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Step hint */}
        <section className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 md:px-5 md:py-4 flex flex-wrap items-center gap-3 text-xs md:text-sm text-text-secondary">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1">
            <Target className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-medium text-emerald-200">
              ขั้นตอนในการขอคำแนะนำ
            </span>
          </div>
          <p>
            1) เลือกหัวข้อที่อยากโฟกัส → 2) ระบุงบประมาณ / ความยากในการเปลี่ยน →
            3) เล่าเพิ่มเติมเล็กน้อย → 4) กด{" "}
            <span className="font-semibold text-emerald-300">
              ขอคำแนะนำจาก AI
            </span>
          </p>
        </section>

        {/* Topic selection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold">
              1. เลือกหัวข้อที่อยากให้ AI ช่วยแนะนำ
            </h2>
            <p className="text-xs text-text-secondary">
              เลือกได้เพียง 1 หัวข้อในแต่ละครั้ง
            </p>
          </div>

          <Card className="border border-white/10 bg-black/30 rounded-3xl">
            <CardContent className="p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {topicOptions.map((topic) => {
                  const isActive = topic.id === selectedTopic
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={cn(
                        "text-left rounded-2xl border px-4 py-3 transition-all",
                        "bg-black/30 hover:bg-emerald-500/10 hover:border-emerald-400/70",
                        isActive
                          ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/25"
                          : "border-white/15"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm md:text-base font-semibold",
                          isActive ? "text-emerald-200" : "text-foreground"
                        )}
                      >
                        {topic.label}
                      </p>
                      <p className="mt-1 text-xs md:text-[13px] text-text-secondary">
                        {topic.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Constraints / preferences */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">
            2. ข้อจำกัดและเงื่อนไขของคุณ
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Budget */}
            <Card className="border border-white/10 bg-black/30 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  งบประมาณโดยรวม
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-text-secondary">
                  เลือกระดับการลงทุนคร่าว ๆ ที่คุณคิดว่าน่าจะทำได้
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setBudget("low")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      budget === "low"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    งบน้อย / เน้นมาตรการไม่ใช้เงินมาก
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudget("medium")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      budget === "medium"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    งบปานกลาง / ทำได้ถ้ามีเหตุผลรองรับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudget("high")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      budget === "high"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    พร้อมลงทุนสูง ถ้าลดคาร์บอนได้คุ้มค่า
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Effort */}
            <Card className="border border-white/10 bg-black/30 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-sky-300" />
                  ความยาก / การยอมรับการเปลี่ยนแปลง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-text-secondary">
                  ให้ AI รู้ว่ามหาวิทยาลัยพร้อมเปลี่ยนแปลงมากแค่ไหน
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEffort("easy")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      effort === "easy"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    อยากได้มาตรการที่ทำได้ง่าย ไม่กระทบชีวิตประจำวันมาก
                  </button>
                  <button
                    type="button"
                    onClick={() => setEffort("normal")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      effort === "normal"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    ยอมเปลี่ยนบางอย่าง ถ้าช่วยลดคาร์บอนได้ชัดเจน
                  </button>
                  <button
                    type="button"
                    onClick={() => setEffort("hard")}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs md:text-sm transition-all",
                      effort === "hard"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/15 bg-black/30 hover:bg-white/5"
                    )}
                  >
                    พร้อมเปลี่ยนเยอะ ถ้าเป็นแผนใหญ่ที่ช่วยลดคาร์บอนระยะยาว
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Time & style */}
            <Card className="border border-white/10 bg-black/30 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-300" />
                  ระยะเวลาที่อยากเห็นผล & รูปแบบคำแนะนำ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">
                    อยากให้เห็นผลในช่วงเวลา
                  </Label>
                  <Select
                    value={timeFrame}
                    onValueChange={(v) => setTimeFrame(v as TimeFrame)}
                  >
                    <SelectTrigger className="h-9 bg-black/40 border-white/25 text-xs md:text-sm">
                      <SelectValue placeholder="เลือกช่วงเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">ประมาณ 1 เดือน</SelectItem>
                      <SelectItem value="3m">ประมาณ 3 เดือน</SelectItem>
                      <SelectItem value="6m">6 เดือนขึ้นไป / แผนระยะยาว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">
                    รูปแบบคำแนะนำที่อยากได้
                  </Label>
                  <Select
                    value={style}
                    onValueChange={(v) => setStyle(v as AdviceStyle)}
                  >
                    <SelectTrigger className="h-9 bg-black/40 border-white/25 text-xs md:text-sm">
                      <SelectValue placeholder="เลือกรูปแบบ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">สรุปสั้น ๆ กระชับ เข้าใจง่าย</SelectItem>
                      <SelectItem value="step">
                        เป็นลิสต์ทีละข้อ พร้อมลำดับความสำคัญ
                      </SelectItem>
                      <SelectItem value="plan">
                        เป็นเหมือนแผนงาน / Roadmap ระยะสั้น–ยาว
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Extra context */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold">
              3. ข้อมูลเสริมที่อยากเล่าให้ AI รู้
            </h2>
            <p className="text-xs text-text-secondary">
              ไม่ต้องเขียนยาวมาก แค่เล่าภาพรวม / ปัญหาหลัก ๆ ก็พอ
            </p>
          </div>

          <Card className="border border-white/10 bg-black/30 rounded-3xl">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Label className="text-sm md:text-base font-medium">
                    เล่าบริบทเพิ่มเติม (ถ้ามี)
                  </Label>
                  <p className="text-xs text-text-secondary">
                    เช่น อาคารหลักใช้แอร์เก่า, มีรถบัสรับส่ง, มีแผนติดโซลาร์รูฟอยู่แล้ว,
                    หรือนโยบายที่ต้องปฏิบัติตาม
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Switch
                    checked={useLatestSummary}
                    onCheckedChange={setUseLatestSummary}
                    id="useLatestSummary"
                  />
                  <Label
                    htmlFor="useLatestSummary"
                    className="cursor-pointer"
                  >
                    ให้ AI อ้างอิง{" "}
                    <span className="font-semibold text-emerald-300">
                      ข้อมูลสรุปคาร์บอนล่าสุด
                    </span>{" "}
                    ด้วย
                  </Label>
                </div>
              </div>

              <Textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                rows={5}
                className="bg-black/40 border-white/20 text-sm resize-y"
                placeholder="ตัวอย่าง: อาคารเรียนหลักเปิดแอร์ทั้งวัน, มีรถตู้/รถบัสรับส่งนักศึกษาประมาณวันละกี่เที่ยว, ปัจจุบันมีโครงการรีไซเคิลอะไรอยู่แล้วบ้าง ฯลฯ"
              />
            </CardContent>
          </Card>
        </section>

        {/* Submit */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          <p className="text-xs md:text-sm text-text-secondary">
            เมื่อกดขอคำแนะนำ ระบบจะส่งข้อมูลเหล่านี้ให้ AI เพื่อสร้างคำแนะนำที่เหมาะสม
            แล้วพาไปยังหน้า{" "}
            <span className="font-semibold text-emerald-300">
              สรุปคำแนะนำจาก AI
            </span>
          </p>

          <Button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/40"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? "กำลังไปยังหน้าสรุปคำแนะนำ..." : "ขอคำแนะนำจาก AI"}
          </Button>
        </section>
      </form>

      <div className="h-4" />
    </main>
  )
}































// src/app/user/get-advice/page.tsx
// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { toast } from "sonner"
// import { Minus, Plus, Sparkles } from "lucide-react"

// type ScopeId = 1 | 2 | 3

// type CategoryRow = {
//   id: number
//   scopeId: ScopeId | null
//   categoryCode: string | null
//   priority: number
//   quantity: number
//   enabled: boolean
//   note: string
// }

// const SCOPE_OPTIONS: { id: ScopeId; label: string }[] = [
//   { id: 1, label: "Scope 1" },
//   { id: 2, label: "Scope 2" },
//   { id: 3, label: "Scope 3" },
// ]

// // TODO: ภายหลังดึงจากฐานข้อมูลจริง
// const DUMMY_CATEGORY_OPTIONS = [
//   { code: "none", label: "(ไม่เลือก)" },
//   { code: "ev_car", label: "รถยนต์ไฟฟ้า (EV)" },
//   { code: "solar_roof", label: "โซลาร์รูฟท็อป" },
//   { code: "ac_inverter", label: "เครื่องปรับอากาศอินเวอร์เตอร์" },
//   { code: "lighting_led", label: "หลอดไฟ LED" },
// ]

// export default function GetAdvicePage() {
//   const [budget, setBudget] = useState<string>("500000.00")
//   const [categoryCount, setCategoryCount] = useState<number>(2)

//   const [rows, setRows] = useState<CategoryRow[]>(() =>
//     Array.from({ length: 4 }).map((_, idx) => ({
//       id: idx + 1,
//       scopeId: (idx === 0 ? 1 : idx === 1 ? 2 : null) as ScopeId | null,
//       categoryCode: "none",
//       priority: idx + 1,
//       quantity: 1,
//       enabled: true,
//       note: "",
//     })),
//   )

//   const visibleRows = rows.slice(0, categoryCount)

//   function handleChangeRow(
//     id: number,
//     patch: Partial<CategoryRow>,
//   ) {
//     setRows((prev) =>
//       prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
//     )
//   }

//   function handleChangeCategoryCount(delta: number) {
//     setCategoryCount((prev) => {
//       let next = prev + delta
//       if (next < 1) next = 1
//       if (next > 4) next = 4
//       return next
//     })
//   }

//   function handleSubmit() {
//     const payload = {
//       budget: Number(budget) || 0,
//       items: visibleRows
//         .filter((r) => r.enabled)
//         .map((r) => ({
//           scopeId: r.scopeId,
//           categoryCode: r.categoryCode,
//           priority: r.priority,
//           quantity: r.quantity,
//           note: r.note.trim() || undefined,
//         })),
//     }

//     console.log("AI request payload (demo):", payload)
//     toast.success("เตรียมข้อมูลสำหรับส่งให้ AI แล้ว (ตอนนี้ยังไม่เชื่อมต่อจริง)")

//     // ภายหลัง: ส่ง payload ไป API แล้ว redirect ไปหน้า /user/get-advice/summary
//   }

//   return (
//     <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10 space-y-10 text-foreground">
//       {/* Header */}
//       <header className="space-y-3">
//         <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
//           <Sparkles className="w-4 h-4" />
//           <span>รับคำแนะนำตามงบประมาณจากระบบ AI</span>
//         </div>

//         <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
//           ระบบแนะนำสินค้า / มาตรการลดคาร์บอนตามงบประมาณ
//         </h1>

//         <p className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
//           กรอกงบประมาณรวม และระบุหมวดสินค้าที่อยากให้ระบบช่วยแนะนำ
//           จากนั้นระบบ AI จะคำนวณชุดสินค้าหรือมาตรการที่เหมาะสม
//           เพื่อช่วยลดคาร์บอนฟุตพรินท์ภายในงบที่กำหนด
//         </p>
//       </header>

//       {/* Budget + จำนวนหมวดสินค้า */}
//       <section className="space-y-4">
//         <Card className="border border-white/10 bg-black/30 rounded-3xl">
//           <CardContent className="p-4 md:p-6 space-y-6">
//             <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] md:items-end">
//               {/* งบประมาณรวม */}
//               <div className="space-y-2">
//                 <Label className="text-sm uppercase tracking-wide text-foreground">
//                   งบประมาณรวมทั้งหมด (บาท)
//                 </Label>
//                 <Input
//                   type="number"
//                   min={0}
//                   step={1000}
//                   value={budget}
//                   onChange={(e) => setBudget(e.target.value)}
//                   className="bg-black/40 border border-white/25 text-lg md:text-xl font-semibold"
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   ใส่เป็นงบรวมที่มีสำหรับการจัดซื้อหรือดำเนินมาตรการทั้งหมด
//                 </p>
//               </div>

//               {/* จำนวนหมวดสินค้าที่อยากได้คำแนะนำ */}
//               <div className="space-y-2">
//                 <Label className="text-sm uppercase tracking-wide text-foreground">
//                   จำนวนหมวดสินค้าที่ต้องการคำแนะนำ
//                 </Label>

//                 <div className="flex items-center gap-3">
//                   <div className="inline-flex items-center rounded-2xl border border-white/20 bg-black/40 px-3 py-2 gap-2">
//                     <Button
//                       type="button"
//                       size="icon"
//                       variant="outline"
//                       className="h-8 w-8 border-white/30 bg-black/40 hover:bg-black/70"
//                       onClick={() => handleChangeCategoryCount(-1)}
//                     >
//                       <Minus className="w-4 h-4" />
//                     </Button>
//                     <span className="min-w-[2rem] text-center text-lg font-semibold">
//                       {categoryCount}
//                     </span>
//                     <Button
//                       type="button"
//                       size="icon"
//                       variant="outline"
//                       className="h-8 w-8 border-white/30 bg-black/40 hover:bg-black/70"
//                       onClick={() => handleChangeCategoryCount(1)}
//                     >
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </div>

//                   <p className="text-xs text-muted-foreground">
//                     สูงสุด 4 หมวดในหนึ่งคำขอคำแนะนำ
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </section>

//       {/* หมวดสินค้าแต่ละอัน */}
//       <section className="space-y-4">
//         <div className="flex items-end justify-between gap-3">
//           <h2 className="text-xl md:text-2xl font-semibold text-foreground">
//             ตั้งค่าหมวดสินค้าที่ต้องการให้ระบบแนะนำ
//           </h2>
//           <p className="text-xs text-muted-foreground hidden md:block">
//             ระบบจะใช้ Scope, หมวดสินค้า, ค่าความสำคัญ และจำนวนที่ต้องการ
//             เพื่อสร้างคำขอไปยัง AI
//           </p>
//         </div>

//         <div className="space-y-4">
//           {visibleRows.map((row, index) => (
//             <Card
//               key={row.id}
//               className="border border-white/10 bg-black/30 rounded-3xl"
//             >
//               <CardHeader className="pb-3">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//                   <CardTitle className="text-base md:text-lg flex items-center gap-2">
//                     <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
//                       {index + 1}
//                     </span>
//                     <span>หมวดสินค้าที่ {index + 1}</span>
//                   </CardTitle>

//                   <div className="flex items-center gap-2 text-xs">
//                     <span className="text-muted-foreground">ใช้ในการคำนวณคำแนะนำ</span>
//                     <Switch
//                       checked={row.enabled}
//                       onCheckedChange={(v) =>
//                         handleChangeRow(row.id, { enabled: v })
//                       }
//                     />
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4">
//                 {/* แถวหลัก: Scope / หมวดสินค้า / priority / qty */}
//                 <div className="grid gap-3 md:gap-4 md:grid-cols-4">
//                   {/* Scope */}
//                   <div className="space-y-2">
//                     <Label className="text-xs uppercase tracking-wide text-foreground">
//                       Scope
//                     </Label>
//                     <Select
//                       value={row.scopeId ? String(row.scopeId) : ""}
//                       onValueChange={(v) =>
//                         handleChangeRow(row.id, {
//                           scopeId: (Number(v) as ScopeId) || null,
//                         })
//                       }
//                     >
//                       <SelectTrigger className="w-full bg-black/40 border border-white/25">
//                         <SelectValue placeholder="ยังไม่เลือก" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {SCOPE_OPTIONS.map((s) => (
//                           <SelectItem key={s.id} value={String(s.id)}>
//                             {s.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* หมวดสินค้า */}
//                   <div className="space-y-2 md:col-span-2">
//                     <Label className="text-xs uppercase tracking-wide text-foreground">
//                       หมวดสินค้า
//                     </Label>
//                     <Select
//                       value={row.categoryCode ?? "none"}
//                       onValueChange={(v) =>
//                         handleChangeRow(row.id, {
//                           categoryCode: v,
//                         })
//                       }
//                     >
//                       <SelectTrigger className="w-full bg-black/40 border border-white/25">
//                         <SelectValue placeholder="(ไม่เลือก)" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {DUMMY_CATEGORY_OPTIONS.map((c) => (
//                           <SelectItem key={c.code} value={c.code}>
//                             {c.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* priority */}
//                   <div className="space-y-2">
//                     <Label className="text-xs uppercase tracking-wide text-foreground">
//                       ค่าความสำคัญ (priority)
//                     </Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       max={10}
//                       value={row.priority}
//                       onChange={(e) =>
//                         handleChangeRow(row.id, {
//                           priority: Number(e.target.value) || 0,
//                         })
//                       }
//                       className="bg-black/40 border border-white/25"
//                     />
//                     <p className="text-[10px] text-muted-foreground">
//                       1 = สำคัญที่สุด, ตัวเลขมากขึ้น = รองลงมา
//                     </p>
//                   </div>
//                 </div>

//                 {/* จำนวนที่ต้องการ + note */}
//                 <div className="grid gap-3 md:gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
//                   <div className="space-y-2">
//                     <Label className="text-xs uppercase tracking-wide text-foreground">
//                       จำนวนที่ต้องการ (qty)
//                     </Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       value={row.quantity}
//                       onChange={(e) =>
//                         handleChangeRow(row.id, {
//                           quantity: Number(e.target.value) || 0,
//                         })
//                       }
//                       className="bg-black/40 border border-white/25"
//                     />
//                     <p className="text-[10px] text-muted-foreground">
//                       เช่น จำนวนชิ้น, จำนวนชุด หรือจำนวนอุปกรณ์
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-xs uppercase tracking-wide text-foreground">
//                       หมายเหตุ / เงื่อนไขเพิ่มเติม (ไม่บังคับ)
//                     </Label>
//                     <Textarea
//                       rows={2}
//                       value={row.note}
//                       onChange={(e) =>
//                         handleChangeRow(row.id, { note: e.target.value })
//                       }
//                       className="bg-black/40 border border-white/25 resize-none"
//                       placeholder="เช่น ต้องติดตั้งในอาคารเรียน, ใช้ได้กับงบกองทุนสิ่งแวดล้อม ฯลฯ"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* ปุ่มส่งคำขอไป AI */}
//       <section className="pt-4 border-t border-white/10">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
//             เมื่อกำหนดงบประมาณและหมวดสินค้าที่ต้องการแล้ว
//             กดปุ่มด้านขวาเพื่อสร้างคำขอคำแนะนำ ระบบจะนำข้อมูลไปใช้กับโมเดล AI
//             (ส่วนนี้ยังไม่เชื่อมต่อจริง สามารถใช้เป็น mock payload ได้ก่อน)
//           </p>

//           <Button
//             size="lg"
//             className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/40"
//             onClick={handleSubmit}
//           >
//             <Sparkles className="w-4 h-4" />
//             สร้างคำขอ + ส่งให้ AI (demo)
//           </Button>
//         </div>
//       </section>
//     </main>
//   )
// }