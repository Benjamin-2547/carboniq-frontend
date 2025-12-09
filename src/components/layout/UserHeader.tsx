// src/components/layout/UserHeader.tsx
import Link from "next/link";

export default function UserHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-muted/60 bg-green-gradient shadow-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">

        {/* --- โลโก้ด้านซ้าย --- */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
          </Link>
        </div>

        {/* --- เมนูตรงกลาง (Fix Center แบบ Absolute) --- */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 text-[15px] text-gray-400 font-medium">
          <Link
            href="/user/calculate"
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#2A3626] transition-colors"
          >
            คำนวณ
          </Link>

          <Link
            href="/user/get-advice"
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#2A3626] transition-colors"
          >
            รับคำแนะนำ
          </Link>

          <Link
            href="/user/general-advice"
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#2A3626] transition-colors"
          >
            คำแนะนำทั่วไป
          </Link>
        </nav>

        {/* --- ปุ่มด้านขวา --- */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <form action="/api/auth" method="post">
            <button className="px-3 py-1.5 rounded-md text-gray-400 font-medium hover:text-white hover:bg-[#2A3626] transition-colors">
              Logout
            </button>
          </form>
          <Link
            href="/user/profile"
            className="px-3 py-1.5 rounded-md bg-gray-200 text-black font-medium hover:bg-white transition-colors"
          >
            Profile
          </Link>
        </div>

      </div>
    </header>
  );
}
