// src/components/layout/PublicHeader.tsx
import Link from "next/link"

export default function PublicHeader() {
  return (
    // <header className="sticky top-0 z-50 border-b border-border-muted/60 bg-[#0B0B0B] backdrop-blur">
    <header className="sticky top-0 z-50 border-b border-border-muted/60 bg-green-gradient shadow-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-2">
        {/* โลโก้ */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
          {/* <span className="text-white font-semibold text-lg tracking-tight">CarbonIQ</span> */}
        </Link>

        {/* Navbar */}
        <nav className="flex items-center gap-4 text-sm text-gray-300">
          <Link href="/public/auth/login"
            className="px-3 py-1.5 rounded-md text-gray-400 font-medium hover:text-white hover:bg-[#2A3626] transition-colors">
            Log in
          </Link>

          <Link href="/public/auth/register"
            className="px-3 py-1.5 rounded-md bg-gray-200 text-black font-medium hover:bg-white transition-colors">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  )
}
