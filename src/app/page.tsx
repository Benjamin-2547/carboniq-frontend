// src/app/page.tsx
export const dynamic = "force-dynamic"
export const revalidate = 0

import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await getServerSupabaseRSC()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false

  // เช็ก role จากตาราง users
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()

    isAdmin = !!userData?.is_admin
  }

  // เส้นทางปุ่มหลักหลังล็อกอิน
  const primaryPath = !user
    ? "/public/auth/login"
    : isAdmin
      ? "/admin/calculate"
      : "/user/calculate"

  const primaryLabel = !user ? "เริ่มคำนวณคาร์บอน" : "ไปหน้าคำนวณ"

  const secondaryPath = "/public/general-advice"

  return (
    <main className="min-h-screen pb-16 text-white space-y-22">
      {/* 1) HERO SECTION */}
      <section
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[90vh] flex items-center justify-center -mt-6"
      >
        {/* 🟢 รูปพื้นหลังเต็มจอ */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/mountain-hero.jpg')",
          }}
        />

        {/* 🔵 Layer มืด เพื่อให้ตัวหนังสือขาวอ่านง่าย */}
        <div className="absolute inset-0 bg-black/30" />

        {/* 🟣 กล่องเนื้อหา — ยังจำกัดความกว้างให้สวย ไม่แผ่เต็มจอ */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-2xl">
            ทำความเข้าใจคาร์บอนของคุณ
          </h1>

          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
            และลดมันอย่างชาญฉลาดด้วยข้อมูลและคำแนะนำจากเรา
          </p>

          <div className="flex justify-center gap-4 mt-8">
            {/* <Link
              href="/public/auth/login"
              className="
          px-7 py-3.5 rounded-xl border border-white/40 bg-primary-green text-black 
          font-semibold 
          shadow-lg shadow-black/50 
          hover:translate-y-0.5 hover:shadow-md 
          active:translate-y-1 active:shadow-sm
          transition-all duration-150
        "
            >
              เริ่มคำนวณคาร์บอน
            </Link> */}

            {/* ปุ่มเรียนรู้เพิ่มเติม – เลื่อนลงไป section ด้านล่าง */}
            <Link
              href="#about"
              className="
          px-7 py-3.5 rounded-xl 
          border border-white/40 
          bg-black/25 
          text-white font-medium
          backdrop-blur-sm
          shadow-lg shadow-black/40
          hover:bg-white/10 
          hover:translate-y-0.5 hover:shadow-md
          active:translate-y-1 active:shadow-sm
          transition-all duration-150
        "
            >
              เรียนรู้เพิ่มเติม
            </Link>

          </div>
        </div>
      </section>

      {/* 2) ชื่อโครงงาน TH / EN */}
      <section id="about" className="scroll-mt-[120px] mx-auto max-w-6xl space-y-6 px-6">
        <h2 className="text-3xl font-semibold text-primary-green/90">
          ชื่อโครงงาน / Project Title
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/20 border border-white/25 p-5 space-y-2">
            <p className="inline-flex items-center px-3 py-1.5 text-xs font-medium tracking-wide uppercase bg-green-500/15 text-green-300 
            border border-green-400/30 rounded-3xl">
              ภาษาไทย
            </p>

            <p className="text-sm md:text-base font-medium leading-relaxed">
              ระบบแนะนำการลดคาร์บอนฟุตพริ้นท์ในมหาวิทยาลัยสงขลานครินทร์
              วิทยาเขตภูเก็ต โดยใช้ปัญญาประดิษฐ์
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 border border-white/25 p-5 space-y-2">
            <p className="inline-flex items-center px-3 py-1.5 text-[10px] font-medium tracking-wide uppercase bg-sky-500/20 text-sky-400 
            border border-green-400/30 rounded-3xl">
              English
            </p>
            <p className="text-sm md:text-base font-medium leading-relaxed">
              Carbon footprint reduction recommendation system using artificial
              intelligence for Prince of Songkla University, Phuket Campus
            </p>
          </div>
        </div>
      </section>

      {/* 3) ที่มาของโครงการ (สรุปย่อ) */}
      <section className="mx-auto max-w-6xl space-y-4 px-6">
        <h2 className="text-3xl font-semibold">ที่มาของโครงการ</h2>
        <p className="text-sm md:text-base leading-relaxed max-w-4xl">
          ปัญหาการเปลี่ยนแปลงสภาพภูมิอากาศและภาวะโลกร้อนเกิดจากการปล่อยก๊าซเรือนกระจก
          จากกิจกรรมของมนุษย์ทั้งการใช้พลังงาน การเดินทาง การผลิตสินค้า
          และการจัดการของเสีย มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต
          จึงต้องการเครื่องมือที่ช่วยประเมินและวางแผนลดคาร์บอนฟุตพริ้นท์ขององค์กร
          โดยอิงแนวคิด Carbon Footprint for Organization (CFO) ครอบคลุม Scope 1–3
        </p>
        <p className="text-sm md:text-base leading-relaxed max-w-4xl">
          ระบบนี้ถูกออกแบบมาเพื่อช่วยให้บุคลากรเห็นภาพรวมการปล่อยคาร์บอนของมหาวิทยาลัย
          และได้รับคำแนะนำที่เหมาะสมกับงบประมาณและข้อจำกัดขององค์กร
          เพื่อสนับสนุนการพัฒนา ม.อ.ภูเก็ต ให้เป็นมหาวิทยาลัยที่เป็นมิตรต่อสิ่งแวดล้อม
          และเดินหน้าสู่ความยั่งยืนอย่างเป็นรูปธรรม
        </p>
      </section>

{/* 4) อธิบายความหมาย Scope 1–3 */}
<section className="mx-auto max-w-6xl space-y-6 px-6 mt-10">
  <h2 className="text-3xl font-semibold">เข้าใจความหมายของแต่ละ Scope</h2>
  <p className="text-sm md:text-base text-text-secondary max-w-3xl">
    มาตรฐาน Carbon Footprint for Organization (CFO) แบ่งการปล่อยก๊าซเรือนกระจกออกเป็น 3 กลุ่ม
    เพื่อให้องค์กรสามารถวิเคราะห์และจัดการการปล่อยคาร์บอนได้อย่างถูกต้องและครอบคลุม
  </p>

  <div className="grid gap-6 md:grid-cols-3">
    {/* SCOPE 1 */}
    <div className="rounded-2xl bg-black/20 border border-white/25 p-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-300 text-xl">
          🏭
        </span>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">
            Scope 1
          </p>
          <h3 className="text-lg font-semibold">การปล่อยโดยตรงขององค์กร</h3>
        </div>
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed">
        การปล่อยก๊าซเรือนกระจกที่เกิดจากกิจกรรมภายในองค์กรโดยตรงและอยู่ภายใต้การควบคุม เช่น:
      </p>

      <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
        <li>การเผาไหม้เชื้อเพลิงในหม้อไอน้ำ เครื่องจักร หรือเครื่องกำเนิดไฟฟ้า</li>
        <li>ยานพาหนะที่องค์กรเป็นเจ้าของหรือควบคุมเอง</li>
        <li>การรั่วไหลของสารทำความเย็นหรือก๊าซจากระบบปรับอากาศและเครื่องจักร</li>
      </ul>
    </div>

    {/* SCOPE 2 */}
    <div className="rounded-2xl bg-black/20 border border-white/25 p-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xl">
          ⚡
        </span>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">
            Scope 2
          </p>
          <h3 className="text-lg font-semibold">การใช้พลังงานทางอ้อม</h3>
        </div>
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed">
        การปล่อยที่เกิดขึ้นทางอ้อมจากการผลิตพลังงานที่องค์กรซื้อมาใช้ เช่น:
      </p>

      <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
        <li>ไฟฟ้าที่ซื้อจากการไฟฟ้า</li>
        <li>พลังงานความร้อน ไอน้ำ หรือการทำความเย็นจากผู้ให้บริการภายนอก</li>
        <li>แม้องค์กรไม่ได้ปล่อยเองโดยตรง แต่ถือเป็นผลจากการใช้พลังงานขององค์กร</li>
      </ul>
    </div>

    {/* SCOPE 3 */}
    <div className="rounded-2xl bg-black/20 border border-white/25 p-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xl">
          🌍
        </span>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">
            Scope 3
          </p>
          <h3 className="text-lg font-semibold">การปล่อยทางอ้อมอื่น ๆ </h3>
        </div>
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed">
        การปล่อยก๊าซเรือนกระจกทางอ้อมที่เกิดขึ้นในห่วงโซ่กิจกรรมที่เกี่ยวข้องกับองค์กร
        แต่ไม่ได้อยู่ภายใต้การควบคุมโดยตรง เช่น:
      </p>

      <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
        <li>การเดินทางมาทำงานของบุคลากรและนักศึกษาด้วยพาหนะส่วนตัวหรือขนส่งสาธารณะ</li>
        <li>การเดินทางไปประชุม/สัมมนานอกสถานที่</li>
        <li>การใช้วัสดุอุปกรณ์และบริการต่าง ๆ การขนส่งวัตถุดิบ ของเสีย และการจัดการขยะ</li>
      </ul>
    </div>
  </div>
</section>



      {/* 4) สองส่วนหลักของระบบ */}
      <section className="mx-auto max-w-6xl space-y-6 px-6">
        <h2 className="text-3xl font-semibold">ระบบนี้แบ่งออกเป็น 2 ส่วนหลัก</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ส่วนที่ 1: คำนวณคาร์บอนฟุตพริ้นท์ */}
          <div className="rounded-2xl bg-card-bg/80 border border border-white/25 p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary-green">
              {/* <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-green/15 text-lg font-bold">
                1
              </span> */}
              <span className="inline-flex items-center justify-center h-9 w-9 text-base rounded-full bg-green-500/20 text-green-300 font-bold">
                1
              </span>
              <h3 className="text-lg font-semibold">
                ระบบคำนวณคาร์บอนฟุตพริ้นท์ (3 Scopes)
              </h3>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              ผู้ใช้เลือก Scope 1, 2 หรือ 3 แล้วเลือกกิจกรรมที่เกี่ยวข้อง
              เช่น การใช้ไฟฟ้า การเดินทาง หรือการจัดซื้อ จากนั้นกรอกปริมาณการใช้งาน
              ระบบจะคำนวณเป็นค่า kgCO₂e โดยใช้ emission factor
              ที่เก็บไว้ในฐานข้อมูลตามมาตรฐาน CFO
            </p>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              ผู้ใช้สามารถรวบรวมข้อมูลกิจกรรมไว้ แล้วเข้ามาคำนวณเพื่อดูภาพรวมการปล่อยคาร์บอนว่ามีปริมาณประมาณเท่าใด
            </p>
          </div>

          {/* ส่วนที่ 2: ระบบแนะนำด้วย AI */}
          <div className="rounded-2xl bg-card-bg/80 border border border-white/25 p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary-green">
              {/* <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-green/15 text-lg font-bold">
                2
              </span> */}
              <span className="inline-flex items-center justify-center h-9 w-9 text-base rounded-full bg-sky-500/20 text-sky-400 font-bold">
                2
              </span>
              <h3 className="text-lg font-semibold">
                ระบบแนะนำการลดคาร์บอนด้วยปัญญาประดิษฐ์
              </h3>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              ผู้ใช้เลือก Scope ที่ต้องการลดและเลือกประเภทสิ่งของที่สนใจ
              ได้ตั้งแต่ 1 รายการขึ้นไป ถ้าเลือกหลายรายการ
              สามารถกำหนดลำดับความสำคัญ (Priority) เพื่อให้ระบบเข้าใจว่า
              สิ่งใดสำคัญกว่ากันเมื่อจัดสรรงบประมาณ
            </p>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              จากงบประมาณที่มี ระบบ AI จะช่วยคำนวณและจัดสัดส่วนงบให้เหมาะสม
              พร้อมแนะนำตัวเลือกที่ช่วยลดคาร์บอนได้คุ้มค่าที่สุด
              เหมาะสำหรับช่วงที่มหาวิทยาลัยมีงบลงทุนด้านสิ่งแวดล้อมหรือจัดซื้ออุปกรณ์ใหม่
            </p>
          </div>
        </div>
      </section>

      {/* 5) รูปแบบการใช้งานจริง */}
      <section className="mx-auto max-w-6xl space-y-4 px-6">
        <h2 className="text-3xl font-semibold">ระบบนี้ถูกออกแบบมาให้ใช้งานแบบไหน?</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-black/20 border border-white/25 p-5 space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-800/30 text-lg">
                🏫
              </span>
              <h3 className="text-lg font-semibold">บริบทการใช้งานในมหาวิทยาลัย</h3>
            </div>
            <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
              <li>ใช้ภายในมหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต</li>
              <li>ผู้ใช้ส่วนใหญ่เป็นบุคลากรหรือผู้รับผิดชอบด้านสิ่งแวดล้อม</li>
              <li>ไม่จำเป็นต้องเข้าใช้งานทุกวัน แต่เน้นความแม่นยำของข้อมูลแต่ละครั้ง</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-black/20 border border-white/25 p-5 space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-lg">
                🧭
              </span>
              <h3 className="text-lg font-semibold">ตัวอย่างการใช้งาน</h3>
            </div>
            <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
              <li>
                รวบรวมข้อมูลการใช้ไฟฟ้า การเดินทาง และกิจกรรมอื่นๆ
                แล้วเข้ามาคำนวณภาพรวมคาร์บอนฟุตพริ้นท์
              </li>
              <li>
                เมื่อมหาวิทยาลัยมีงบประมาณสำหรับจัดซื้อ เช่น หลอดไฟ แอร์
                หรือโซลาร์รูฟ เข้ามาใช้ระบบแนะนำเพื่อดูตัวเลือกที่คุ้มค่าที่สุด
              </li>
              <li>
                เปิดดูหน้าโปรไฟล์เพื่อตรวจสอบประวัติการคำนวณและคำแนะนำที่เคยได้รับ
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6) CTA ท้ายหน้า */}
      <section className="mx-auto max-w-4xl rounded-3xl bg-black/30 border border border-white/25 px-8 py-10 text-center space-y-4">
        <h2 className="text-2xl font-semibold">
          เริ่มจากการลองคำนวณครั้งแรกดูสักรอบ
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl mx-auto">
          คุณอาจพบว่ามหาวิทยาลัยปล่อยคาร์บอนไม่ได้น้อยอย่างที่คิด

        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            href={primaryPath}
            // className="px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 
            // rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
            className="rounded-lg px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm shadow-lg shadow-black/20
            hover:bg-white/15 hover:shadow-black/30 transition-all"

          >
            {!user ? "เริ่มใช้งานระบบ" : "ไปหน้าคำนวณตอนนี้"}
          </Link>
          {!user && (
            <button
              type="button"
              className="text-xs text-text-secondary hover:text-white"
            >
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/public/auth/login" className="underline">
                เข้าสู่ระบบ
              </Link>
            </button>
          )}
        </div>
      </section>
    </main>
  )
}





































// src/app/page.tsx
// import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc";

// import { redirect } from "next/navigation";

// export default async function HomePage() {
//   const supabase = await getServerSupabaseRSC();
//   const { data: { user } } = await supabase.auth.getUser();

//   // ถ้ามี user → ส่งไปหน้า role ที่เหมาะสม
//   if (user) {
//     const { data: userData } = await supabase
//       .from("users")
//       .select("is_admin")
//       .eq("user_id", user.id)
//       .single();

//     if (userData?.is_admin) {
//       //return redirect("/admin/profile");
//     } else {
//       //return redirect("/user/profile");
//     }
//   }

//   // ❗ ไม่มี user → แสดงหน้า Public (Landing)
//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen text-white text-center space-y-4">
//       <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
//       <h1 className="text-3xl font-bold">Welcome to GoGreen Concept 🌱</h1>
//       <p className="text-gray-300">Calculate your carbon footprint and get eco recommendations.</p>
//     </main>
//   );
// }











// // src/app/page.tsx
// export const dynamic = "force-dynamic"
// export const revalidate = 0

// import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc"
// import Link from "next/link"

// export default async function HomePage() {
//   const supabase = await getServerSupabaseRSC()
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   let isAdmin = false

//   // ถ้ามี user → เช็ก role จากตาราง users
//   if (user) {
//     const { data: userData } = await supabase
//       .from("users")
//       .select("is_admin")
//       .eq("user_id", user.id)
//       .single()

//     isAdmin = !!userData?.is_admin
//   }

//   // เส้นทางปุ่มหลักหลังล็อกอิน
//   const primaryPath = !user
//     ? "/public/auth/login"
//     : isAdmin
//       ? "/admin/calculate"
//       : "/user/calculate"

//   const primaryLabel = !user ? "เริ่มคำนวณคาร์บอน" : "ไปเริ่มคำนวณ"

//   const secondaryPath = "/public/general-advice"

//   return (
//     <main className="min-h-screen pb-16 text-white space-y-24">
//       {/* 1) HERO SECTION */}
//       <section
//         className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[90vh] flex items-center justify-center -mt-6"
//       >
//         {/* 🟢 รูปพื้นหลังเต็มจอ */}
//         <div
//           className="absolute inset-0 bg-cover bg-center"
//           style={{
//             backgroundImage: "url('/mountain-hero.jpg')",
//           }}
//         />

//         {/* 🔵 Layer มืด เพื่อให้ตัวหนังสือขาวอ่านง่าย */}
//         <div className="absolute inset-0 bg-black/30" />

//         {/* 🟣 กล่องเนื้อหา — ยังจำกัดความกว้างให้สวย ไม่แผ่เต็มจอ */}
//         <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center text-white">
//           <h1 className="text-4xl md:text-6xl font-bold drop-shadow-2xl">
//             ทำความเข้าใจคาร์บอนของคุณ
//           </h1>

//           <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
//             และลดมันอย่างชาญฉลาดด้วยข้อมูลและคำแนะนำจากเรา
//           </p>

//           <div className="flex justify-center gap-4 mt-8">
//             <Link
//               href="/public/auth/login"
//               className="px-6 py-3 bg-primary-green text-black rounded-lg font-semibold hover:brightness-110"
//             >
//               เริ่มคำนวณคาร์บอน
//             </Link>

//             <Link
//               href="/public/general-advice"
//               className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30"
//             >
//               เรียนรู้เพิ่มเติม
//             </Link>
//           </div>
//         </div>
//       </section>


//       <section className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
//         {/* ด้านซ้าย: ข้อความ + ปุ่ม */}
//         <div className="space-y-6">
//           <p className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-text-secondary">
//             🌍 Carbon-aware • Budget-based Recommendation
//           </p>

//           <h1 className="text-3xl md:text-5xl font-bold leading-tight">
//             เข้าใจคาร์บอนฟุตพรินต์ของคุณ
//             <br />
//             และลดมันอย่างฉลาดด้วยงบประมาณที่มี
//           </h1>

//           <p className="text-text-secondary max-w-xl">
//             ระบบช่วยคำนวณคาร์บอนจากกิจกรรมในชีวิตประจำวันของคุณ
//             แล้วแนะนำสินค้าและวิธีปรับพฤติกรรมที่เหมาะกับงบและลำดับความสำคัญ
//             ทั้งต่อโลกและต่อกระเป๋าตังค์ของคุณ
//           </p>

//           <div className="flex flex-wrap items-center gap-4">
//             <Link
//               href={primaryPath}
//               className="inline-flex items-center justify-center rounded-md bg-primary-green px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110 transition-colors"
//             >
//               {primaryLabel}
//             </Link>

//             <Link
//               href={secondaryPath}
//               className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
//             >
//               ดูคำแนะนำตัวอย่าง
//             </Link>
//           </div>

//           <div className="flex flex-wrap gap-4 text-xs text-text-secondary/80">
//             <span>⚡ ประเมินคาร์บอนอย่างง่าย</span>
//             <span>•</span>
//             <span>📊 ติดตามแนวโน้มรายเดือน</span>
//             <span>•</span>
//             <span>🛒 เลือกสินค้าให้คุ้มค่าที่สุด</span>
//           </div>
//         </div>

//         {/* ด้านขวา: การ์ด mockup + กราฟเล็ก ๆ */}
//         <div className="relative">
//           {/* กล่องหลัก */}
//           <div className="relative mx-auto w-full max-w-md rounded-2xl bg-card-bg/90 border border-border-muted shadow-2xl shadow-black/40 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-xs uppercase tracking-wide text-text-secondary/70">
//                   today&apos;s footprint
//                 </p>
//                 <p className="text-lg font-semibold">Today overview</p>
//               </div>
//               <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-xs text-text-secondary">
//                 Concept demo
//               </span>
//             </div>

//             {/* วงกลมคะแนน */}
//             <div className="flex items-center gap-6 mb-6">
//               <div className="relative h-32 w-32 rounded-full border-4 border-primary-green/70 flex items-center justify-center bg-black/40">
//                 <div className="text-center">
//                   <p className="text-xs text-text-secondary/70">Today</p>
//                   <p className="text-2xl font-bold text-primary-green">34.2</p>
//                   <p className="text-[10px] text-text-secondary/80">kgCO₂e</p>
//                 </div>
//                 {/* วง overlay เล็ก ๆ */}
//                 <div className="absolute -right-3 -bottom-2 rounded-xl bg-[#182314] px-3 py-1 text-[10px] text-secondary-lime border border-border-muted">
//                   -12% จากเฉลี่ยสัปดาห์ก่อน
//                 </div>
//               </div>

//               {/* แผงกราฟแท่ง */}
//               <div className="flex-1 space-y-3">
//                 <p className="text-xs text-text-secondary/80">
//                   แหล่งคาร์บอนหลักวันนี้
//                 </p>
//                 <div className="space-y-2">
//                   {/* transport */}
//                   <div>
//                     <div className="flex justify-between text-[11px] mb-1">
//                       <span>Transport</span>
//                       <span className="text-text-secondary/70">18.5 kg</span>
//                     </div>
//                     <div className="h-2 rounded-full bg-black/40 overflow-hidden">
//                       <div className="h-full w-[70%] bg-primary-green" />
//                     </div>
//                   </div>
//                   {/* home */}
//                   <div>
//                     <div className="flex justify-between text-[11px] mb-1">
//                       <span>Home energy</span>
//                       <span className="text-text-secondary/70">9.3 kg</span>
//                     </div>
//                     <div className="h-2 rounded-full bg-black/40 overflow-hidden">
//                       <div className="h-full w-[45%] bg-accent-blue" />
//                     </div>
//                   </div>
//                   {/* food */}
//                   <div>
//                     <div className="flex justify-between text-[11px] mb-1">
//                       <span>Food</span>
//                       <span className="text-text-secondary/70">6.4 kg</span>
//                     </div>
//                     <div className="h-2 rounded-full bg-black/40 overflow-hidden">
//                       <div className="h-full w-[35%] bg-secondary-lime" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* แถบแนะนำสั้น ๆ */}
//             <div className="mt-4 rounded-xl bg-black/40 border border-border-muted/80 px-4 py-3 flex items-start gap-3">
//               <div className="mt-0.5 text-lg">💡</div>
//               <div>
//                 <p className="text-xs font-semibold mb-1">
//                   คำแนะนำเร็ววันนี้
//                 </p>
//                 <p className="text-[11px] text-text-secondary/90">
//                   ลองเปลี่ยนหลอดไฟเป็น LED และลดการใช้รถส่วนตัว 1–2 ทริป
//                   ต่อสัปดาห์ จะช่วยลดได้ ~5–8 kgCO₂e / เดือน*
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* แสงพื้นหลัง */}
//           <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-radial from-primary-green/25 via-transparent to-transparent blur-3xl opacity-80" />
//         </div>
//       </section>

//       {/* 2) แอปนี้ช่วยอะไรคุณได้บ้าง? */}
//       <section className="mx-auto max-w-6xl space-y-6">
//         <h2 className="text-2xl font-semibold">แอปนี้ช่วยอะไรคุณได้บ้าง?</h2>
//         <p className="text-text-secondary max-w-2xl text-sm">
//           โฟกัสที่สองอย่างหลัก: ทำให้คุณเข้าใจรอยเท้าคาร์บอนของตัวเอง
//           และช่วยเลือกวิธีลดที่ “คุ้มค่าที่สุด” ตามงบประมาณและเป้าหมายของคุณ
//         </p>

//         <div className="grid gap-5 md:grid-cols-3 mt-4">
//           <div className="rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-3">
//             <div className="text-2xl">📏</div>
//             <h3 className="text-base font-semibold">คำนวณคาร์บอนแบบเข้าใจง่าย</h3>
//             <p className="text-xs text-text-secondary">
//               กรอกข้อมูลการใช้รถ ไฟฟ้า น้ำ หรือกิจกรรมหลัก ๆ ในชีวิตประจำวัน
//               ระบบจะแปลงเป็นค่า kgCO₂e ให้โดยอิง emission factor มาตรฐาน
//             </p>
//           </div>

//           <div className="rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-3">
//             <div className="text-2xl">🛒</div>
//             <h3 className="text-base font-semibold">แนะนำสินค้า/วิธีลดที่คุ้มค่า</h3>
//             <p className="text-xs text-text-secondary">
//               ระบุงบประมาณและลำดับความสำคัญ
//               จากนั้นระบบจะจัดอันดับตัวเลือกที่ช่วยลดคาร์บอนได้ดีที่สุด
//               ภายใต้งบที่คุณตั้งไว้
//             </p>
//           </div>

//           <div className="rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-3">
//             <div className="text-2xl">📊</div>
//             <h3 className="text-base font-semibold">ติดตามผลและแนวโน้มรายเดือน</h3>
//             <p className="text-xs text-text-secondary">
//               ดูกราฟแนวโน้มคาร์บอนของคุณในแต่ละเดือน
//               เพื่อเห็นผลลัพธ์ของการเปลี่ยนพฤติกรรมและการลงทุนในสินค้าเขียว
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* 3) ระบบทำงานยังไง? */}
//       <section className="mx-auto max-w-6xl space-y-6">
//         <h2 className="text-2xl font-semibold">ระบบทำงานยังไง?</h2>
//         <p className="text-text-secondary max-w-2xl text-sm">
//           เบื้องหลังคือการรวมข้อมูลกิจกรรมของคุณกับฐานข้อมูลสินค้าและ emission
//           factor แล้วจัดลำดับคำแนะนำให้เหมาะกับคุณที่สุด
//         </p>

//         <div className="mt-4 grid gap-4 md:grid-cols-3">
//           <div className="relative rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-2">
//             <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-green/20 text-xs font-bold text-primary-green">
//               1
//             </span>
//             <h3 className="text-sm font-semibold">กรอกข้อมูลพฤติกรรม</h3>
//             <p className="text-xs text-text-secondary">
//               เลือกกิจกรรม เช่น เดินทาง, ใช้ไฟ, ใช้น้ำ, อาหาร ฯลฯ
//               แล้วกรอกปริมาณการใช้งานในช่วงเวลาที่กำหนด
//             </p>
//           </div>

//           <div className="relative rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-2">
//             <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-green/20 text-xs font-bold text-primary-green">
//               2
//             </span>
//             <h3 className="text-sm font-semibold">ระบบคำนวณคาร์บอนอัตโนมัติ</h3>
//             <p className="text-xs text-text-secondary">
//               ระบบใช้ factor การปล่อยคาร์บอนจากฐานข้อมูล
//               คำนวณเป็นค่า kgCO₂e และบันทึกในประวัติของคุณ
//             </p>
//           </div>

//           <div className="relative rounded-2xl bg-card-bg/80 border border-border-muted p-5 space-y-2">
//             <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-green/20 text-xs font-bold text-primary-green">
//               3
//             </span>
//             <h3 className="text-sm font-semibold">รับคำแนะนำที่เหมาะกับงบประมาณ</h3>
//             <p className="text-xs text-text-secondary">
//               ระบุงบและความสำคัญ ระบบจะเลือกสินค้า/วิธีลดที่เหมาะสมที่สุดให้
//               พร้อมคะแนนและเหตุผลประกอบ
//             </p>
//           </div>
//         </div>

//         <div className="mt-4">
//           <Link
//             href="/public/general-advice"
//             className="inline-flex text-xs text-primary-green hover:underline"
//           >
//             ดูตัวอย่างคำแนะนำทั่วไป →
//           </Link>
//         </div>
//       </section>

//       {/* 4) CTA ท้ายหน้า */}
//       <section className="mx-auto max-w-4xl rounded-3xl bg-black/30 border border-border-muted px-8 py-10 text-center space-y-4">
//         <h2 className="text-2xl font-semibold">
//           เริ่มจากการลองคำนวณครั้งแรกดูสักรอบ
//         </h2>
//         <p className="text-sm text-text-secondary max-w-2xl mx-auto">
//           คุณอาจพบว่าคุณช่วยลดคาร์บอนได้มากกว่าที่คิด
//           และรู้ชัดขึ้นว่าควรลงทุนกับอะไร ก่อน เพื่อให้คุ้มทั้งเงินและคุ้มทั้งโลก
//         </p>

//         <div className="flex flex-col items-center gap-3">
//           <Link
//             href={primaryPath}
//             className="inline-flex items-center justify-center rounded-md bg-primary-green px-6 py-2.5 text-sm font-semibold text-black hover:brightness-110 transition-colors"
//           >
//             {!user ? "เริ่มใช้งานฟรีตอนนี้" : "กลับไปหน้าคำนวณ"}
//           </Link>
//           {!user && (
//             <button
//               type="button"
//               className="text-xs text-text-secondary hover:text-white"
//             >
//               มีบัญชีอยู่แล้ว?{" "}
//               <Link href="/public/auth/login" className="underline">
//                 เข้าสู่ระบบ
//               </Link>
//             </button>
//           )}
//         </div>
//       </section>
//     </main>
//   )
// }


