// "use client"
// import { ThemeProvider } from "next-themes"
// import { Toaster } from "sonner"

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
//       {children}
//       <Toaster richColors position="top-right" />
//     </ThemeProvider>
//   )
// }

// src/components/layout/providers.tsx
"use client"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      // ถ้ายังมี mismatch ให้ปลดคอมเมนต์บรรทัดล่าง
      // forcedTheme="dark"
    >
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
