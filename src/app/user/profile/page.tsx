// export default function ProfilePage() {
//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-bold text-primary-green">Profile</h1>
//       <p className="text-text-secondary">ข้อมูลผู้ใช้ของคุณจะอยู่ที่นี่</p>
//     </div>
//   )
// }



// // src/app/profile/page.tsx
// import { Button } from "@/components/ui/button"

// export default function Page() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-primary-green">Profile</h1>
//       <p className="text-text-secondary">ข้อมูลผู้ใช้ของคุณจะอยู่ที่นี่</p>

//       <div className="flex gap-4">
//         <Button className="bg-primary-green text-bg-dark hover:bg-green-500">
//           แก้ไขโปรไฟล์
//         </Button>
//         <Button variant="outline">ดูประวัติการคำนวณ</Button>
//       </div>
//     </div>
//   )
// }









// import { Button } from "@/components/ui/button"

// export default function Page() {
//   return (
//     <div className="space-y-6 min-h-[100vh]">
//       <h1 className="text-2xl font-bold text-primary-green">Profile</h1>
//       <p className="text-text-secondary">ข้อมูลผู้ใช้ของคุณจะอยู่ที่นี่</p>

//       <div className="flex gap-4">
//         <Button className="bg-black text-white hover:bg-gray-800">
//           Log In
//         </Button>
//         <Button className="bg-[#1A1A1A] text-white border border-[#2D2D2D] shadow-sm hover:bg-[#222222]">
//           Log In
//         </Button>
//         <Button className="bg-gray-100 text-black hover:bg-gray-200">
//           Subscribe
//         </Button>
//         <Button className="bg-primary-green text-bg-dark hover:bg-green-500">
//           แก้ไขโปรไฟล์
//         </Button>
//         <Button variant="outline">ดูประวัติการคำนวณ</Button>
//       </div>
//     </div>
//   )

//   return (
//     <main className="min-h-[200vh] bg-transparent">
//       <div className="p-10 text-white">ลองเลื่อนดูได้เลย 👇</div>
//     </main>
//   )
// }










// src/app/user/profile/page.tsx
export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"

// เตรียม array ไว้เป็นโครง (เดี๋ยวค่อยเปลี่ยนมาใช้ข้อมูลจริงจาก DB)
const YEARS = [2023, 2024, 2025]

const MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
  "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
  "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

export default function UserProfilePage() {
  // ตอนนี้ยังไม่ดึงข้อมูลจริง แค่ทำโครง UI
  // TODO: ดึงข้อมูล user, summary, recommendation จากฐานข้อมูลมาใส่แทนที่ placeholder เหล่านี้

  return (
    <main className="min-h-screen pb-12 space-y-22">
      {/* 1) HEADER ของโปรไฟล์ */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-black/20 border border-border-muted p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            {/* TODO: ใช้ชื่อเล่น + email จริงจาก DB */}
            <h1 className="text-2xl md:text-3xl font-semibold">
              benjamin
            </h1>
            <p className="text-sm text-text-secondary">
              ben@gmail.com
            </p>
            <p className="text-xs text-text-secondary/80">
              Member since: 2025-11-10
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center rounded-full bg-primary-green/10 text-primary-green px-3 py-1 font-medium">
              Role: User
            </span>
            {/* ถ้าอนาคตมี field เพิ่ม เช่น แผนก / faculty ค่อยเพิ่ม pill ตรงนี้ได้ */}
          </div>
        </div>
      </section>

      {/* 2) ประวัติการคำนวณคาร์บอนรายเดือน (Summary History) */}
      <section className="mx-auto max-w-6xl px-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            ประวัติการคำนวณคาร์บอนรายเดือน
          </h2>

          {/* ตัวกรองปี */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">ปี</span>
            <select
              className="h-9 rounded-md border border-border-muted bg-black/30 px-3 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
              defaultValue={2025}
            >
              {YEARS.map((year) => (
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
            {MONTHS.map((month, index) => (
              <article
                key={month}
                className="w-64 rounded-2xl bg-card-bg/80 border border-border-muted p-4 flex-shrink-0"
              >
                <header className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-text-secondary/80">
                      เดือน
                    </p>
                    <p className="text-sm font-semibold">
                      {month} 2025
                    </p>
                  </div>
                  {/* ตรงนี้จะค่อยเปลี่ยนเป็น “เดือนปัจจุบัน / มีข้อมูลล่าสุด” ก็ได้ */}
                  <span className="text-[10px] px-2 py-1 rounded-full bg-black/30 text-text-secondary">
                    Placeholder
                  </span>
                </header>

                {/* TODO: แทนที่ตัวเลขด้วยข้อมูลจริงจาก summary */}
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <p className="flex justify-between">
                    <span>รวมทั้งหมด</span>
                    <span className="font-semibold text-white">0.0 kgCO₂e</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Scope 1</span>
                    <span>0.0 kg</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Scope 2</span>
                    <span>0.0 kg</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Scope 3</span>
                    <span>0.0 kg</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3) ประวัติคำแนะนำที่เคยได้รับ (AI Recommendation History) */}
      <section className="mx-auto max-w-6xl px-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            ประวัติคำแนะนำที่เคยบันทึกไว้
          </h2>

          {/* ตัวกรองเดือน/ปี */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary">ปี</span>
              <select
                className="h-8 rounded-md border border-border-muted bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
                defaultValue={2025}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year} className="bg-[#0F1A13]">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary">เดือน</span>
              <select
                className="h-8 rounded-md border border-border-muted bg-black/30 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-green/60"
                defaultValue=""
              >
                <option value="" className="bg-[#0F1A13]">
                  ทั้งปี
                </option>
                {MONTHS.map((m) => (
                  <option key={m} value={m} className="bg-[#0F1A13]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ตารางประวัติคำแนะนำ */}
        <div className="rounded-2xl bg-black/20 border border-border-muted overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-black/40 text-text-secondary uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-2 text-left">วันที่บันทึก</th>
                  <th className="px-4 py-2 text-left">หัวข้อคำแนะนำ</th>
                  <th className="px-4 py-2 text-left">Scope</th>
                  <th className="px-4 py-2 text-left">งบประมาณ</th>
                  <th className="px-4 py-2 text-left">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {/* TODO: map จากรายการ recommendation ที่ผู้ใช้กด Save/Favorite */}
                <tr>
                  <td
                    className="px-4 py-4 text-center text-text-secondary"
                    colSpan={5}
                  >
                    ยังไม่มีคำแนะนำที่บันทึกไว้ ระบบจะโชว์รายการที่คุณกดบันทึกในอนาคต
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4) ปุ่มลัด (Quick Actions) */}
      <section className="mx-auto max-w-6xl px-6 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          ทำต่อจากหน้านี้
        </h2>
        <p className="text-xs md:text-sm text-text-secondary">
          เลือกสิ่งที่คุณอยากทำ ไม่ว่าจะคำนวณคาร์บอนหรือรับคำแนะนำใหม่
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* คำนวณคาร์บอน */}
          <Link
            href="/user/calculate"
            // className="rounded-2xl bg-card-bg/80 border border-border-muted p-4 flex flex-col gap-2 hover:bg-black/30 transition-colors"
            className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
            transition-all"
          >
            <span className="text-sm font-semibold">คำนวณคาร์บอน</span>
            <p className="text-xs text-text-secondary">
              ไปยังหน้าคำนวณเพื่อกรอกกิจกรรมและดูการปล่อยคาร์บอนของคุณ
            </p>
          </Link>

          {/* รับคำแนะนำใหม่ */}
          <Link
            href="/user/get-advice"
            className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
            transition-all"
          >
            <span className="text-sm font-semibold">รับคำแนะนำใหม่</span>
            <p className="text-xs text-text-secondary">
              เลือก Scope และประเภทสิ่งของ พร้อมตั้งงบประมาณ ระบบ AI จะช่วยจัดสรรให้
            </p>
          </Link>

          {/* ดูสรุปรายเดือน (ไปหน้า summary แยก) */}
          <Link
            href="/"
            className=" rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-black/20 p-4 flex flex-col gap-2 hover:bg-white/15 hover:shadow-black/30
            transition-all"

          >
            <span className="text-sm font-semibold">กลับหน้าหลัก</span>
            <p className="text-xs text-text-secondary">
              เปิดหน้าหลัก เพื่ออ่านรายละเอียดต่างๆของระบบ ว่าทำอะไรได้บ้าง
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
