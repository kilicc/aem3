import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, latitude, longitude } = await request.json();

    if (!customerId || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sadece admin'ler güncelleyebilir
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Müşterinin koordinatlarını güncelle (yanlış koordinatları da güncelleyebilmek için)
    const { error } = await supabase
      .from("customers")
      .update({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

