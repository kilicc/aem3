"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStock(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Depo sorumlusu, yönetici veya admin kontrolü
  const allowedRoles = ["depo_sorunlusu", "yonetici", "admin"];
  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return { error: "Bu işlem için yetkiniz bulunmamaktadır" };
  }

  const warehouseId = formData.get("warehouse_id") as string;
  let productId = formData.get("product_id") as string | null;
  let toolId = formData.get("tool_id") as string | null;
  const quantity = parseFloat(formData.get("quantity") as string) || 0;
  const minStockLevel = parseFloat(formData.get("min_stock_level") as string) || 0;

  // Boş string'leri null'a çevir
  if (productId === "" || productId === null) {
    productId = null;
  }
  if (toolId === "" || toolId === null) {
    toolId = null;
  }

  if (!warehouseId || warehouseId.trim() === "") {
    return { error: "Depo seçilmedi" };
  }
  if (!productId && !toolId) {
    return { error: "Ürün veya araç/gereç seçilmelidir" };
  }

  // Mevcut stok kontrolü
  const { data: existingStock } = await supabase
    .from("warehouse_stock")
    .select("*")
    .eq("warehouse_id", warehouseId)
    .eq(productId ? "product_id" : "tool_id", productId || toolId)
    .single();

  if (existingStock) {
    // Eski miktarı al
    const oldQuantity = existingStock.quantity;
    const quantityDiff = quantity - oldQuantity;

    // Güncelle
    const { data, error } = await supabase
      .from("warehouse_stock")
      .update({
        quantity,
        min_stock_level: minStockLevel,
      })
      .eq("id", existingStock.id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Bildirim gönder
    if (quantityDiff > 0) {
      // Stok girişi
      const { notifyStockIn } = await import("@/modules/bildirim/actions/notification-service");
      if (productId) {
        await notifyStockIn(warehouseId, productId, quantityDiff, user.id);
      }
    } else if (quantityDiff < 0) {
      // Stok çıkışı
      const { notifyStockOut } = await import("@/modules/bildirim/actions/notification-service");
      if (productId) {
        await notifyStockOut(warehouseId, productId, Math.abs(quantityDiff), user.id);
      }
    }

    revalidatePath("/depo/stock");
    return { data };
  } else {
    // Yeni kayıt oluştur
    const { data, error } = await supabase
      .from("warehouse_stock")
      .insert({
        warehouse_id: warehouseId,
        product_id: productId,
        tool_id: toolId,
        quantity,
        min_stock_level: minStockLevel,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Yeni stok girişi bildirimi
    if (productId && quantity > 0) {
      const { notifyStockIn } = await import("@/modules/bildirim/actions/notification-service");
      await notifyStockIn(warehouseId, productId, quantity, user.id);
    }

    revalidatePath("/depo/stock");
    return { data };
  }
}
