import { NextResponse } from "next/server"
import { runAndSaveToDatabase } from "@/lib/ai/ecoAlgorithm"

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      userId: string
      totalBudget: number
      requirements: {
        categoryId: number      // ✅ FK ไปที่ product_category.category_id
        categoryCode: string    // ✅ category_code เช่น "light_bulb"
        qty: number
        priority: number
      }[]
    }

    const { userId, totalBudget, requirements } = body

    if (!userId || !Array.isArray(requirements) || requirements.length === 0) {
      return NextResponse.json(
        { error: "invalid payload: userId/requirements" },
        { status: 400 },
      )
    }

    if (typeof totalBudget !== "number" || Number.isNaN(totalBudget) || totalBudget <= 0) {
      return NextResponse.json(
        { error: "invalid payload: totalBudget must be > 0" },
        { status: 400 },
      )
    }

    // ✅ ส่ง requirements แบบเต็ม (มีทั้ง id + code) เข้า runAndSaveToDatabase
    const result = await runAndSaveToDatabase(
      userId,
      totalBudget,
      requirements,
    )

    if (!result.success || !result.requestId) {
      return NextResponse.json(
        { error: result.error ?? "AI failed" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      requestId: result.requestId,
      results: result.results,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "server error" },
      { status: 500 },
    )
  }
}
