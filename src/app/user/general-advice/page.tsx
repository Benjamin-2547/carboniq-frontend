//src/app/user/general-advice/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getServerSupabaseRSC } from "@/lib/supabase/server-rsc";

export default async function GeneralAdvicePage() {
  const supabase = await getServerSupabaseRSC();

  // โหลด category (เรียง order_index)
  const { data: categories, error: catErr } = await supabase
    .from("advice_category")
    .select("id, name_th, icon, color_hex, order_index")
    .order("order_index", { ascending: true });

  // โหลด detail
  const { data: details, error: detailErr } = await supabase
    .from("advice_detail")
    .select("id, category_id, detail_th, order_index")
    .order("order_index", { ascending: true });

  if (catErr || detailErr) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-white">
        <p className="text-red-400 text-sm">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>
      </main>
    );
  }

  // ประกอบข้อมูลแบบเดียวกับ adviceSections เดิม
  const sections =
    categories?.map((cat) => ({
      id: cat.id,
      icon: cat.icon || "📌",
      title: cat.name_th || "ไม่มีชื่อหมวด",
      colorHex: cat.color_hex || "#111827",

      body: (details ?? [])
        .filter((d) => d.category_id === cat.id)
        .map((d) => d.detail_th),
    })) || [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-10 text-white">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold">
          คำแนะนำทั่วไปเพื่อลดคาร์บอนฟุตพรินต์
        </h1>

        <p className="text-sm md:text-base text-muted-foreground">
          รวมแนวทางง่าย ๆ ที่ทุกคนสามารถเริ่มทำได้ทันที เพื่อช่วยลดคาร์บอนฟุตพรินต์ในชีวิตประจำวันและภายในมหาวิทยาลัย
        </p>
      </section>

      {/* Accordion */}
      <section className="space-y-4">
        {sections.length === 0 ? (
          <p className="text-sm text-text-secondary">
            ยังไม่มีข้อมูลคำแนะนำในระบบ
          </p>
        ) : (
          sections.map((sec, i) => (
            <details
              key={sec.id}
              className="group rounded-2xl bg-black/20 border border-white/25 px-5 py-4"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sec.icon}</span>
                  <span className="text-base md:text-lg font-semibold">
                    {sec.title}
                  </span>
                </div>

                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full 
                             bg-white/10 text-[10px] font-bold 
                             transition-transform duration-150 group-open:rotate-180"
                >
                  ˅
                </span>
              </summary>

              {/* CONTENT */}
              <div className="mt-4 rounded-xl border border-white/25 bg-black/30">
                {/* header bar with dynamic color */}
                <div
                  className="rounded-t-xl px-4 py-2 text-xs md:text-base font-semibold"
                  style={{
                    backgroundColor: sec.colorHex,
                    color: "#fff",
                  }}
                >
                  คำแนะนำทั่วไป
                </div>

                <div className="px-4 py-3">
                  <ul className="list-disc list-inside space-y-1.5 text-sm md:text-base leading-relaxed text-text-secondary">
                    {sec.body.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl rounded-3xl bg-black/30 border border-white/25 px-8 py-8 text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          อยากได้คำแนะนำที่เฉพาะสำหรับมหาวิทยาลัยคุณมากขึ้นไหม?
        </h2>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/user/calculate"
            className="rounded-lg px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm shadow-lg shadow-black/20
            hover:bg-white/15 hover:shadow-black/30 transition-all"
          >
            คำนวณคาร์บอน
          </Link>

          <Link
            href="/user/get-advice"
            className="rounded-lg px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm shadow-lg shadow-black/20
            hover:bg-white/15 hover:shadow-black/30 transition-all"
          >
            รับคำแนะนำใหม่
          </Link>
        </div>
      </section>
    </main>
  );
}
