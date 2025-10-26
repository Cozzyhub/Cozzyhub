import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LIST = [
  "Women’s Ethnic Wear (sarees, kurtis, suits)",
  "Men’s Apparel (T-shirts, shirts, casual wear)",
  "Kids’ Clothing & Accessories",
  "Home & Kitchen (Product items, décor, storage)",
  "Beauty & Personal Care",
  "Electronics & Mobile Accessories",
  "Fashion Accessories (handbags, jewellery, footwear)",
  "Daily-Use / General Merchandise (pet supplies, sports & fitness)",
  "Anime",
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional: verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = LIST.map((name) => ({ name, slug: slugify(name) }));
  const { error } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "name" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, count: rows.length });
}
