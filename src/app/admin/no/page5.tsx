// // src/app/user/get-advice/page.tsx
// "use client"

// import { useEffect, useMemo, useState } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"

// import { Button } from "@/components/ui/button"
// import { Sparkles } from "lucide-react"
// import { Wallet } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { toast } from "sonner"
// import { Leaf } from "lucide-react"

// type ProductCategory = {
//   category_id: number
//   display_name_th: string | null
//   code: string | null
//   is_active: boolean | null
// }

// type BudgetItem = {
//   categoryId: number | null
//   priority: number
//   qty: number
// }

// const createEmptyItem = (): BudgetItem => ({
//   categoryId: null,
//   priority: 1,
//   qty: 1,
// })

// export default function GetAdvicePage() {
//   const router = useRouter()
//   const supabase = createClient()

//   const [loadingData, setLoadingData] = useState(true)
//   const [saving, setSaving] = useState(false)

//   const [totalBudget, setTotalBudget] = useState<string>("500000.00")
//   const [itemCount, setItemCount] = useState<number>(1)

//   const [categories, setCategories] = useState<ProductCategory[]>([])

//   const [items, setItems] = useState<BudgetItem[]>(() =>
//     [createEmptyItem()],
//   )

//   // ดึงหมวดสินค้า ตอนโหลดหน้า
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         setLoadingData(true)

//         const { data: catRows, error: catErr } = await supabase
//           .from("product_category")
//           .select("category_id, display_name_th, code, is_active")
//           .eq("is_active", true)
//           .order("category_id", { ascending: true })

//         if (catErr) throw catErr

//         setCategories(catRows || [])
//       } catch (err) {
//         console.error(err)
//         toast.error("โหลดข้อมูลหมวดสินค้าไม่สำเร็จ")
//       } finally {
//         setLoadingData(false)
//       }
//     }

//     loadInitialData()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const visibleItems = useMemo(
//     () => items.slice(0, itemCount),
//     [items, itemCount],
//   )

//   const addItem = () => {
//     setItems((prev) => [...prev, createEmptyItem()])
//     setItemCount((c) => c + 1)
//   }

//   const removeItem = () => {
//     setItemCount((c) => (c > 1 ? c - 1 : c))
//   }

//   const handleChangeItem = (
//     index: number,
//     field: keyof BudgetItem,
//     value: string,
//   ) => {
//     setItems((prev) => {
//       const next = [...prev]
//       const item = { ...next[index] }

//       if (field === "categoryId") {
//         item[field] = value === "" ? null : Number(value)
//       } else if (field === "priority" || field === "qty") {
//         const num = Number(value)
//         item[field] = Number.isNaN(num) ? 0 : num
//       }

//       next[index] = item
//       return next
//     })
//   }

//   const handleSubmit = async () => {
//     try {
//       setSaving(true)

//       const budget = Number(totalBudget)
//       if (!budget || budget <= 0) {
//         toast.error("กรุณากรอกงบรวมให้ถูกต้อง (ต้องมากกว่า 0)")
//         return
//       }

//       const validItems = visibleItems.filter(
//         (it) =>
//           it.categoryId &&
//           it.priority > 0 &&
//           it.qty >= 1,
//       )

//       if (validItems.length === 0) {
//         toast.error("กรุณากรอกหมวดสินค้า, priority และจำนวน อย่างน้อย 1 รายการ")
//         return
//       }

//       const {
//         data: { user },
//         error: userErr,
//       } = await supabase.auth.getUser()
//       if (userErr) throw userErr
//       if (!user) {
//         toast.error("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่อีกครั้ง")
//         return
//       }

//       // 1) insert recommendation_request
//       const { data: reqRows, error: reqErr } = await supabase
//         .from("recommendation_request")
//         .insert({
//           user_id: user.id,
//           total_budget: budget,
//         })
//         .select("request_id")
//         .single()

//       if (reqErr) throw reqErr
//       const requestId = reqRows.request_id as number

//       // 2) insert recommendation_request_item
//       const payload = validItems.map((it) => ({
//         request_id: requestId,
//         category_id: it.categoryId,
//         priority: it.priority,
//         requested_qty: it.qty,
//       }))

//       const { error: itemErr } = await supabase
//         .from("recommendation_request_item")
//         .insert(payload)

//       if (itemErr) throw itemErr

//       toast.success("บันทึกคำขอคำแนะนำเรียบร้อย")
//       router.push(`/user/get-advice/summary?request_id=${requestId}`)
//     } catch (err) {
//       console.error(err)
//       toast.error("เกิดข้อผิดพลาดระหว่างบันทึกคำขอคำแนะนำ")
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 text-foreground space-y-8">
//       {/* หัวข้อหน้า */}
//       <section className="space-y-3">
//         <div className="flex flex-wrap items-start justify-between gap-3">
//           <div className="space-y-2">
//             <h1 className="text-3xl md:text-4xl font-semibold">
//               ระบบแนะนำสินค้า
//             </h1>
//             <p className="max-w-3xl text-sm md:text-base text-muted-foreground">
//               กรอกงบประมาณรวม กำหนดหมวดสินค้าเเละเลือกลำดับความสำคัญ
//               เพื่อนำไปให้ AI ประมวลผลและเลือกชุดสินค้าที่ปล่อยคาร์บอนน้อยที่สุดตามงบประมาณที่กรอกไว้
//             </p>
//           </div>
//           <div className="flex flex-col items-end gap-2">
//             {/* <div className="inline-flex items-center rounded-full bg-emerald-600/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
//               <Leaf className="mr-1 h-3 w-3" />
//               รับคำแนะนำจาก AI
//             </div> */}
//             <Button
//               size="sm"
//               className="px-3 py-4 text-sm font-semibold bg-emerald-500 hover:bg-emerald-500/90 text-black rounded-lg shadow-xl"
//               onClick={handleSubmit}
//               disabled={saving || loadingData}
//             >
//               <Sparkles className="w-4 h-4" />
//               {saving ? "กำลังบันทึกคำขอ..." : "รับคำแนะนำจาก AI"}
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* งบประมาณรวม + จำนวนหมวด */}
//       <Card className="bg-black/30 border border-white/10 shadow-lg">
//         <CardHeader className="space-y-0">
//           <div className="flex items-center gap-2">
//             <Wallet className="h-5 w-5 text-emerald-400" />
//             <CardTitle className="text-base md:text-2xl m-0">
//               งบประมาณรวม
//             </CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
//             {/* งบรวม */}
//             <div className="space-y-2">
//               <Label htmlFor="totalBudget">งบประมาณรวมทั้งหมด (บาท)</Label>
//               <Input
//                 id="totalBudget"
//                 type="number"
//                 min={0}
//                 step="0.01"
//                 value={totalBudget}
//                 onChange={(e) => setTotalBudget(e.target.value)}
//                 className="mt-2 bg-black/40 border-white/20"
//               />
//               {/* <p className="text-xs text-text-secondary">
//                 ใส่เป็นงบรวมที่ต้องการใช้สำหรับมาตรการหรือสินค้าที่จะให้ระบบช่วยแนะนำ
//               </p> */}
//             </div>

//             {/* จำนวนหมวด */}
//             <div className="space-y-2">
//               <Label>จำนวนหมวดสินค้าที่ต้องการรับคำแนะนำ</Label>
//               <div className="flex items-center gap-3">
//                 <div className="inline-flex items-center rounded-lg bg-black/40 border border-white/20 px-2 py-1 mt-2">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-lg"
//                     onClick={removeItem}
//                   >
//                     –
//                   </Button>
//                   <div className="mx-2 min-w-[3rem] text-center font-semibold">
//                     {itemCount}
//                   </div>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-lg"
//                     onClick={addItem}
//                   >
//                     +
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* รายการหมวดสินค้าแต่ละแถว */}
//       <section className="space-y-4">
//         {visibleItems.map((item, index) => {
//           return (
//             <Card
//               key={index}
//               className="bg-black/30 border border-white/12 shadow-md"
//             >
//               <CardHeader className="flex flex-row items-center justify-between gap-3">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300">
//                     {index + 1}
//                   </div>
//                   <CardTitle className="text-base md:text-2xl">
//                     หมวดสินค้าที่ {index + 1}
//                   </CardTitle>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid gap-4 md:grid-cols-3">
//                   {/* หมวดสินค้า */}
//                   <div className="space-y-2">
//                     <Label>หมวดสินค้า</Label>
//                     <Select
//                       value={item.categoryId ? String(item.categoryId) : ""}
//                       onValueChange={(val) =>
//                         handleChangeItem(index, "categoryId", val)
//                       }
//                       disabled={loadingData}
//                     >
//                       <SelectTrigger className="mt-2 bg-black/40 border-white/20">
//                         <SelectValue placeholder="(ไม่เลือก)" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.map((cat) => (
//                           <SelectItem
//                             key={cat.category_id}
//                             value={String(cat.category_id)}
//                           >
//                             {cat.display_name_th ?? `หมวด ${cat.category_id}`}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Priority */}
//                   <div className="space-y-2">
//                     <Label>ค่าความสำคัญ (1 = สำคัญที่สุด)</Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       value={item.priority}
//                       onChange={(e) =>
//                         handleChangeItem(index, "priority", e.target.value)
//                       }
//                       className="mt-2 bg-black/40 border-white/20"
//                     />
//                     {/* <p className="text-xs text-text-secondary">
//                       1 = สำคัญที่สุด
//                     </p> */}
//                   </div>

//                   {/* Qty */}
//                   <div className="space-y-2">
//                     <Label>จำนวนที่ต้องการ</Label>
//                     <Input
//                       type="number"
//                       min={1}
//                       value={item.qty}
//                       onChange={(e) =>
//                         handleChangeItem(index, "qty", e.target.value)
//                       }
//                       className="mt-2 bg-black/40 border-white/20"
//                     />
//                     {/* <p className="text-xs text-text-secondary">
//                       ใช้จำนวนชิ้น / หน่วย ที่ต้องการลงทุนในหมวดนี้
//                     </p> */}
//                   </div>
//                 </div>

//               </CardContent>
//             </Card>
//           )
//         })}
//       </section>

//       {/* ปุ่ม submit */}
//       <section className=" space-y-3"></section>
//     </main>
//   )
// }
