//src/lib/ai/ecoAlgorithm.ts
import { getServerSupabaseAction } from "@/lib/supabase/server-action"

// ดึง client จากระบบเดิมของโปรเจคคุณ
async function getSupabase() {
  return getServerSupabaseAction()
}

export interface UserRequirement {
  /** category_code จาก product_category เช่น "light_bulb" */
  category: string;
  qty: number;
  priority: number;
}

/**
 * requirement ฉบับเต็มจากหน้าเว็บ (ใช้บันทึก DB + ส่งเข้า algorithm)
 * - categoryId = product_category.category_id
 * - categoryCode = product_category.code
 */
export interface DbRequirement {
  categoryId: number;
  categoryCode: string;
  qty: number;
  priority: number;
}

export interface Product {
  product_id: number;
  product_name: string;
  price_thb: number;
  brand: string | null;
  category_id: number;
  category_code: string;
  category_name: string;
  co2_reduction_kg_per_year: number | null;
  energy_cost_thb_per_year: number | null;
  co2_saving_per_baht: number | null;
}

export interface ScoredProduct extends Product {
  total_price: number;
  total_co2_reduction: number;
  score_env: number;
  score_value: number;
  final_score: number;
}

export interface SelectedOption {
  name: string;
  brand: string;
  product_id: number;
  total_price: number;
  total_co2_reduction: number;
  co2_per_baht: number | null;
  score_env: number;
  score_value: number;
  final_score: number;
}

export interface AllocationResult {
  /** category_code เช่น "light_bulb" */
  category: string;
  status: "Success" | "Failed" | "No Items" | "Not Found";
  avg_deducted?: number;
  options?: SelectedOption[];
}

export interface RecommendationResultRow {
  request_item_id: number;
  product_id: number;
  rank: number;
  rationale: string;
  est_co2_saving: number;
  co2_saving_per_baht: number | null;
}

// ==========================================================================================
// CONSTANTS
// ==========================================================================================

const W_ENV = 0.6; // 60% - ลดคาร์บอนได้เยอะ
const W_VALUE = 0.4; // 40% - คุ้มค่าต่อบาท

const ELEC_PRICE_PER_UNIT = 4.5; // บาท/kWh
const GRID_EMISSION_FACTOR = 0.4999; // kgCO2e/kWh

export const CATEGORY_CODE_MAP: Record<string, string> = {
  air_conditioner: "Air Conditioner",
  fan: "Fan",
  refrigerator: "Refrigerator",
  ev_car: "EV Car",
  electric_bus: "Electric Bus",
  electric_van: "Electric Van",
  monitor: "Monitor",
  light_bulb: "Light Bulb",
  solar_panel: "Solar Panel",
  gas_stove: "Gas Stove",
  food_waste_disposer: "Food Waste Disposer",
  paper: "Paper",
};

// ==========================================================================================
// DATA LOADING
// ==========================================================================================

async function loadAllProducts(): Promise<Product[]> {
  const supabase = await getSupabase()   // ✅ เพิ่มบรรทัดนี้
  const { data: products, error: prodErr } = await supabase
    .from("product")
    .select(
      `
      product_id,
      product_name,
      price_thb,
      brand,
      is_active,
      category_id,
      product_category!inner (
        code,
        display_name_th,
        is_active
      )
    `
    )
    .eq("is_active", true);

  if (prodErr || !products) {
    console.error("Error loading products:", prodErr);
    return [];
  }

  // Transform to flat structure
  return products
    .filter((p: any) => p.product_category?.is_active)
    .map((p: any) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      price_thb: p.price_thb,
      brand: p.brand,
      category_id: p.category_id,
      category_code: p.product_category.code,
      category_name: p.product_category.display_name_th,
      co2_reduction_kg_per_year: null,
      energy_cost_thb_per_year: null,
      co2_saving_per_baht: null,
    }));
}

async function loadSpecsAndMerge(products: Product[]): Promise<Product[]> {
  const supabase = await getSupabase()   // ✅ เพิ่มบรรทัดนี้
  // Load all specs in parallel
  const [
    { data: airData },
    { data: fanData },
    { data: fridgeData },
    { data: evData },
    { data: monitorData },
    { data: bulbData },
    { data: stoveData },
    { data: fwdData },
    { data: busData },
    { data: vanData },
  ] = await Promise.all([
    supabase
      .from("air_conditioner")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("fan")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase.from("refrigerator").select("product_id, energy_use_kwh_per_year"),
    supabase
      .from("ev_car")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("monitor")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("light_bulb")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("gas_stove")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("food_waste_disposer")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("electric_bus")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
    supabase
      .from("electric_van")
      .select(
        "product_id, co2e_reduction_kg_per_year, energy_cost_thb_per_year"
      ),
  ]);

  // Create specs map
  const specsMap: Record<
    number,
    { co2_reduction: number | null; energy_cost: number | null }
  > = {};

  // Air Conditioner
  airData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Fan
  fanData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Refrigerator - calculate from kWh
  fridgeData?.forEach((row: any) => {
    const kwh = row.energy_use_kwh_per_year || 0;
    specsMap[row.product_id] = {
      co2_reduction: kwh * GRID_EMISSION_FACTOR,
      energy_cost: kwh * ELEC_PRICE_PER_UNIT,
    };
  });

  // EV Car
  evData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Monitor
  monitorData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Light Bulb
  bulbData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Gas Stove
  stoveData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Food Waste Disposer
  fwdData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Electric Bus
  busData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Electric Van
  vanData?.forEach((row: any) => {
    specsMap[row.product_id] = {
      co2_reduction: row.co2e_reduction_kg_per_year,
      energy_cost: row.energy_cost_thb_per_year,
    };
  });

  // Merge specs into products
  return products.map((p) => {
    const spec = specsMap[p.product_id];
    const co2_reduction = spec?.co2_reduction ?? 0; // default 0 ถ้าไม่มี metric
    const price = Number(p.price_thb) || 0;
    const co2_per_baht = price > 0 ? co2_reduction / price : 0;

    return {
      ...p,
      co2_reduction_kg_per_year: co2_reduction,
      energy_cost_thb_per_year: spec?.energy_cost ?? null,
      co2_saving_per_baht: co2_per_baht,
    };
  });
}

export async function loadProductsWithMetrics(): Promise<Product[]> {
  console.log("🔄 กำลังโหลดข้อมูลสินค้า...");
  const products = await loadAllProducts();
  console.log(`✅ โหลดสินค้าได้ ${products.length} รายการ`);

  const merged = await loadSpecsAndMerge(products);
  console.log(`✅ สินค้าที่พร้อมใช้ (เติมค่า default ให้หมวดที่ไม่มี metric): ${merged.length} รายการ`);

  return merged;
}

// ==========================================================================================
// SCORING ALGORITHM
// ==========================================================================================

function computeScores(products: ScoredProduct[]): ScoredProduct[] {
  if (products.length === 0) return [];

  const envMax = Math.max(
    ...products.map((p) => p.co2_reduction_kg_per_year || 0)
  );
  const valMax = Math.max(...products.map((p) => p.co2_saving_per_baht || 0));

  return products.map((p) => {
    const scoreEnv =
      envMax > 0 ? (p.co2_reduction_kg_per_year || 0) / envMax : 0;
    const scoreVal = valMax > 0 ? (p.co2_saving_per_baht || 0) / valMax : 0;
    const finalScore = W_ENV * scoreEnv + W_VALUE * scoreVal;

    return {
      ...p,
      score_env: scoreEnv,
      score_value: scoreVal,
      final_score: finalScore,
    };
  });
}

function getMinPricePerCategory(
  products: Product[],
  categoryCode: string
): number {
  const items = products.filter((p) => p.category_code === categoryCode);
  if (items.length === 0) return 0;
  return Math.min(...items.map((p) => p.price_thb));
}

// ==========================================================================================
// MAIN ALGORITHM
// ==========================================================================================

export async function solveBudgetAllocation(
  totalBudget: number,
  userRequirements: UserRequirement[],
  products: Product[]
): Promise<AllocationResult[]> {
  console.log(`\n${"=".repeat(65)}`);
  console.log(`เริ่มต้นคำนวณ: งบประมาณ ${totalBudget.toLocaleString()} บาท`);
  console.log(`${"=".repeat(65)}`);

  const reqsSorted = [...userRequirements].sort(
    (a, b) => a.priority - b.priority
  );

  const results: AllocationResult[] = [];
  let currentBudget = totalBudget;

  for (let i = 0; i < reqsSorted.length; i++) {
    const req = reqsSorted[i];
    const { category, qty, priority } = req;

    const categoryCode = category; // ✅ category = category_code
    const categoryLabel = CATEGORY_CODE_MAP[categoryCode] || categoryCode;

    const hasProducts = products.some(
      (p) => p.category_code === categoryCode
    );
    if (!hasProducts) {
      console.log(
        `\n[Priority ${priority}] หมวด: ${categoryLabel} (${categoryCode}) - ไม่พบสินค้าในหมวดนี้`
      );
      results.push({ category: categoryCode, status: "Not Found" });
      continue;
    }

    console.log(
      `\n[Priority ${priority}] หมวด: ${categoryLabel} (${categoryCode}) (จำนวน: ${qty})`
    );

    // A) กันงบเผื่อหมวดถัดไป
    const remainingReqs = reqsSorted.slice(i + 1);
    let reservedBudget = 0;
    const reserveDetails: string[] = [];

    for (const r of remainingReqs) {
      const rCode = r.category;
      const minPrice = getMinPricePerCategory(products, rCode);
      const amt = minPrice * r.qty;
      reservedBudget += amt;
      const label = CATEGORY_CODE_MAP[rCode] || rCode;
      reserveDetails.push(`${label}(${amt.toLocaleString()})`);
    }

    console.log(
      `   - กันงบเผื่อ: ${reservedBudget.toLocaleString()} บาท [${reserveDetails.length > 0 ? reserveDetails.join(", ") : "None"
      }]`
    );

    // B) งบที่ใช้ได้จริงในรอบนี้
    const maxSpendable = currentBudget - reservedBudget;
    const minPriceCurrent = getMinPricePerCategory(products, categoryCode);
    const requiredForThisCategory = minPriceCurrent * qty;
    // ถ้างบที่ใช้ได้จริงต่ำกว่าราคาต่ำสุด * qty ให้ใช้เพดานขั้นต่ำนี้แทน เพื่อไม่ให้กันงบเผื่อหมวดอื่นจนหมด
    const usableBudget = Math.max(maxSpendable, requiredForThisCategory);
    console.log(
      `   - งบคงเหลือ: ${currentBudget.toLocaleString()} | ใช้ได้จริง: ${maxSpendable.toLocaleString()}`
    );

    if (maxSpendable <= 0) {
      console.log("   !!! งบไม่พอ");
      results.push({ category: categoryCode, status: "Failed" });
      continue;
    }

    // C) เลือกสินค้าในหมวดนี้
    const categoryItems = products
      .filter((p) => p.category_code === categoryCode)
      .map((p) => ({
        ...p,
        total_price: p.price_thb * qty,
        total_co2_reduction: (p.co2_reduction_kg_per_year || 0) * qty,
        score_env: 0,
        score_value: 0,
        final_score: 0,
      })) as ScoredProduct[];

    const validItems = categoryItems
      .map((p) => ({
        ...p,
        price_thb: Number(p.price_thb) || 0,
        total_price: (Number(p.price_thb) || 0) * qty,
      }))
      .filter((p) => p.total_price <= usableBudget);

    if (validItems.length === 0) {
      console.log("   !!! ไม่มีสินค้าในงบประมาณนี้");
      results.push({ category: categoryCode, status: "No Items" });
      continue;
    }

    // D) ให้คะแนน
    const scored = computeScores(validItems);
    scored.sort((a, b) => {
      if (b.final_score !== a.final_score) return b.final_score - a.final_score;
      if ((b.co2_saving_per_baht || 0) !== (a.co2_saving_per_baht || 0))
        return (b.co2_saving_per_baht || 0) - (a.co2_saving_per_baht || 0);
      return a.price_thb - b.price_thb;
    });

    const top3 = scored.slice(0, 3);

    // E) หักงบเฉลี่ยของ top3
    const avgCost =
      top3.reduce((sum, p) => sum + p.total_price, 0) / top3.length;
    currentBudget -= avgCost;

    const selectedList: SelectedOption[] = top3.map((p) => ({
      name: p.product_name,
      brand: p.brand || "",
      product_id: p.product_id,
      total_price: p.total_price,
      total_co2_reduction: p.total_co2_reduction,
      co2_per_baht: p.co2_saving_per_baht,
      score_env: p.score_env * 100,
      score_value: p.score_value * 100,
      final_score: p.final_score * 100,
    }));

    results.push({
      category: categoryCode, // ✅ เก็บเป็น code เพื่อใช้ match กับ request_items
      status: "Success",
      avg_deducted: avgCost,
      options: selectedList,
    });

    console.log(
      `   - เลือกได้ ${top3.length} รายการ | หักงบเฉลี่ยไป ${avgCost.toLocaleString()}`
    );
  }

  return results;
}

// ==========================================================================================
// SAVE TO SUPABASE (Full Flow)
// ==========================================================================================

/**
 * สร้าง recommendation_request ใหม่
 */
export async function createRecommendationRequest(
  userId: string,
  totalBudget: number
): Promise<{ requestId: number | null; error?: string }> {
  const supabase = await getSupabase()   // ✅
  const { data, error } = await supabase
    .from("recommendation_request")
    .insert({
      user_id: userId,
      total_budget: totalBudget,
    })
    .select("request_id")
    .single();

  if (error) {
    console.error("Error creating request:", error);
    return { requestId: null, error: error.message };
  }

  console.log(`✅ สร้าง recommendation_request: request_id=${data.request_id}`);
  return { requestId: data.request_id };
}

/**
 * สร้าง recommendation_request_item สำหรับแต่ละหมวด
 */
export async function createRequestItems(
  requestId: number,
  requirements: DbRequirement[]
): Promise<{
  items: { category: string; requestItemId: number }[]; // category = category_code
  error?: string;
}> {

  const supabase = await getSupabase();

  if (!requirements.length) {
    return { items: [], error: "No requirements" };
  }

  const rowsToInsert = requirements.map((req) => ({
    request_id: requestId,
    category_id: req.categoryId,   // ✅ ใช้ category_id จากหน้าเว็บ
    priority: req.priority,
    requested_qty: req.qty,
  }));

  console.log("🧾 rowsToInsert into recommendation_request_item:", rowsToInsert);

  const { data, error } = await supabase
    .from("recommendation_request_item")
    .insert(rowsToInsert)
    .select("request_item_id, category_id");

  if (error || !data) {
    console.error("Error creating request items:", error);
    return { items: [], error: error?.message || "Insert failed" };
  }

  // สมมติ Supabase คืนแถวตามลำดับที่ insert → map กลับเข้ากับ requirements
  const resultItems = data.map((row, idx) => {
    const r = requirements[idx];
    return {
      category: r.categoryCode,       // ✅ เก็บ code ไว้ใช้ match กับผล algorithm
      requestItemId: row.request_item_id,
    };
  });

  console.log(
    `✅ สร้าง recommendation_request_item: ${resultItems.length} รายการ`
  );
  return { items: resultItems };
}

/**
 * บันทึกผลลัพธ์ลง recommendation_result (หลายแถว)
 */
export async function saveResultsToSupabase(
  requestItemId: number,
  results: AllocationResult[]
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  const supabase = await getSupabase()

  const rowsToInsert: RecommendationResultRow[] = [];

  for (const result of results) {
    if (result.status === "Success" && result.options) {
      result.options.forEach((opt, index) => {
        rowsToInsert.push({
          request_item_id: requestItemId,
          product_id: opt.product_id,
          rank: index + 1,
          rationale: `แนะนำสินค้า ${opt.name} (${opt.brand
            }) - ลด CO₂ ${opt.total_co2_reduction.toFixed(2)} kg/ปี, CO₂/บาท ${opt.co2_per_baht != null
              ? opt.co2_per_baht.toFixed(4)
              : "-"}`,
          est_co2_saving: opt.total_co2_reduction,
          co2_saving_per_baht: opt.co2_per_baht,
        });
      });
    }
  }

  if (rowsToInsert.length === 0) {
    return { success: true, insertedCount: 0 };
  }

  const { error } = await supabase
    .from("recommendation_result")
    .insert(rowsToInsert);

  if (error) {
    console.error("Error saving results:", error);
    return { success: false, insertedCount: 0, error: error.message };
  }

  console.log(`✅ บันทึกผลลัพธ์ ${rowsToInsert.length} แถว`);
  return { success: true, insertedCount: rowsToInsert.length };
}

/**
 * บันทึกผลลัพธ์โดยใช้ request_item_id ที่ถูกต้องสำหรับแต่ละหมวด
 */
export async function saveResultsWithRequestItems(
  requestItems: { category: string; requestItemId: number }[],
  results: AllocationResult[]
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  // ✅ ดึง supabase server-side ของโปรเจคคุณ
  const supabase = await getSupabase()

  const rowsToInsert: RecommendationResultRow[] = [];

  // for (const result of results) {
  //   if (result.status === "Success" && result.options) {
  //     // หา requestItemId ที่ตรงกับ category นี้
  //     const requestItem = requestItems.find(
  //       (ri) => ri.category === result.category
  //     );
  //     if (!requestItem) continue;

  //     result.options.forEach((opt, index) => {
  //       rowsToInsert.push({
  //         request_item_id: requestItem.requestItemId,
  //         product_id: opt.product_id,
  //         rank: index + 1,
  //         rationale: `แนะนำสินค้า ${opt.name} (${
  //           opt.brand
  //         }) - ลด CO₂ ${opt.total_co2_reduction.toFixed(
  //           2
  //         )} kg/ปี, Score ${opt.final_score.toFixed(1)}%`,
  //         est_co2_saving: opt.total_co2_reduction,
  //         co2_saving_per_baht: opt.co2_per_baht,
  //       });
  //     });
  //   }
  // }
  for (const result of results) {
    if (result.status === "Success" && result.options) {
      // หา requestItemId ที่ตรงกับ category นี้
      const requestItem = requestItems.find(
        (ri) => ri.category === result.category
      );
      if (!requestItem) continue;

      result.options.forEach((opt, index) => {
        rowsToInsert.push({
          request_item_id: requestItem.requestItemId,
          product_id: opt.product_id,
          rank: index + 1,
          rationale: `แนะนำสินค้า ${opt.name} (${opt.brand}) - ลด CO₂ ${opt.total_co2_reduction.toFixed(2)} kg/ปี, ลด CO₂ ${opt.co2_per_baht != null
            ? opt.co2_per_baht.toFixed(4)
            : "-"} CO₂/บาท`,
          est_co2_saving: opt.total_co2_reduction,
          co2_saving_per_baht: opt.co2_per_baht,
        });
      });
    }
  }


  if (rowsToInsert.length === 0) {
    return { success: true, insertedCount: 0 };
  }

  const { error } = await supabase
    .from("recommendation_result")
    .insert(rowsToInsert);

  if (error) {
    console.error("Error saving results:", error);
    return { success: false, insertedCount: 0, error: error.message };
  }

  console.log(
    `✅ บันทึกผลลัพธ์ ${rowsToInsert.length} แถว ลง recommendation_result`
  );
  return { success: true, insertedCount: rowsToInsert.length };
}

/**
 * รันทั้งหมดและบันทึกลง Supabase (Full Flow)
 */
export async function runAndSaveToDatabase(
  userId: string,
  totalBudget: number,
  dbRequirements: DbRequirement[]
): Promise<{
  success: boolean;
  requestId?: number;
  results?: AllocationResult[];
  error?: string;
}> {
  try {
    console.log("\n📝 เริ่มบันทึกข้อมูลลง Supabase...");

    if (!dbRequirements.length) {
      return { success: false, error: "ไม่มี requirements จากหน้าเว็บ" };
    }

    // 1. โหลดข้อมูลสินค้า
    const products = await loadProductsWithMetrics();
    if (products.length === 0) {
      return { success: false, error: "ไม่พบข้อมูลสินค้า" };
    }

    // 1.1 ตรวจงบขั้นต่ำที่เป็นไปได้ (ใช้ราคาต่ำสุดของแต่ละหมวด * qty)
    let requiredTotal = 0;
    for (const req of dbRequirements) {
      const minPrice = getMinPricePerCategory(products, req.categoryCode);
      if (!minPrice || minPrice <= 0) {
        return {
          success: false,
          error: `ไม่พบสินค้าสำหรับหมวด ${req.categoryCode}`,
        };
      }
      requiredTotal += minPrice * req.qty;
    }

    if (totalBudget < requiredTotal) {
      return {
        success: false,
        error: `งบขั้นต่ำที่ต้องใช้คือประมาณ ${requiredTotal.toLocaleString()} บาท แต่งบที่กรอกคือ ${totalBudget.toLocaleString()} บาท`,
      };
    }

    // 2. สร้าง recommendation_request
    const { requestId, error: reqErr } = await createRecommendationRequest(
      userId,
      totalBudget
    );
    if (!requestId) {
      return { success: false, error: reqErr || "ไม่สามารถสร้าง request ได้" };
    }

    // 3. สร้าง recommendation_request_item จาก category_id ที่ผู้ใช้เลือก
    const { items: requestItems, error: itemErr } = await createRequestItems(
      requestId,
      dbRequirements
    );
    if (requestItems.length === 0) {
      return {
        success: false,
        requestId,
        error: itemErr || "ไม่สามารถสร้าง request items ได้",
      };
    }

    // 4. เตรียม requirements สำหรับ algorithm (ใช้ category_code)
    const algoRequirements: UserRequirement[] = dbRequirements.map((r) => ({
      category: r.categoryCode,
      qty: r.qty,
      priority: r.priority,
    }));

    // 5. รัน Algorithm
    const results = await solveBudgetAllocation(
      totalBudget,
      algoRequirements,
      products
    );

    // 6. บันทึกผลลัพธ์ลง recommendation_result
    const { success: saveSuccess, error: saveErr } =
      await saveResultsWithRequestItems(requestItems, results);

    if (!saveSuccess) {
      return { success: false, requestId, results, error: saveErr };
    }

    console.log("\n🎉 บันทึกข้อมูลลง Supabase สำเร็จ!");
    return { success: true, requestId, results };
  } catch (err: any) {
    console.error("Error in runAndSaveToDatabase:", err);
    return { success: false, error: err.message };
  }
}
