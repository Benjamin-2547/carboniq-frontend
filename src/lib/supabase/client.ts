// // src/lib/supabase/client.ts
// "use client"
// import { createBrowserClient } from "@supabase/ssr"

// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
// }


// src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

// ใช้ Singleton ป้องกันการสร้าง client ซ้ำหลายรอบบน client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ⭐ จับกรณี Refresh Token fail → ให้ reload อัตโนมัติ
    browserClient.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // เคส refresh token พัง (หลัง deploy)
        if (event === "TOKEN_REFRESHED" && !session) {
          console.warn("🔁 Refresh token invalid → reloading...");
          location.reload();
        }
      }
    );
  }

  return browserClient;
}

