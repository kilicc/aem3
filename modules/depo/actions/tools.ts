"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTool(formData: FormData) {
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

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const serialNumber = formData.get("serial_number") as string | null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const purchasePrice = formData.get("purchase_price")
    ? parseFloat(formData.get("purchase_price") as string)
    : null;

  const { data, error } = await supabase
    .from("tools")
    .insert({
      name,
      description,
      serial_number: serialNumber,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/tools");
  return { data };
}

export async function updateTool(id: string, formData: FormData) {
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

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const serialNumber = formData.get("serial_number") as string | null;
  const purchaseDate = formData.get("purchase_date") as string | null;
  const purchasePrice = formData.get("purchase_price")
    ? parseFloat(formData.get("purchase_price") as string)
    : null;

  const { data, error } = await supabase
    .from("tools")
    .update({
      name,
      description,
      serial_number: serialNumber,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/tools");
  revalidatePath(`/depo/tools/${id}`);
  return { data };
}

export async function deleteTool(id: string) {
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

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  // Cascade kontrolü - Zimmet kayıtları var mı?
  const { data: assignments } = await supabase
    .from("tool_assignments")
    .select("id")
    .eq("tool_id", id)
    .limit(1);

  if (assignments && assignments.length > 0) {
    return { error: "Bu araç-gereç zimmetli olduğu için silinemez. Önce zimmet kayıtlarını iade edin" };
  }

  // Stok kayıtlarında kullanılıyor mu?
  const { data: stockRecords } = await supabase
    .from("warehouse_stock")
    .select("id")
    .eq("tool_id", id)
    .limit(1);

  if (stockRecords && stockRecords.length > 0) {
    return { error: "Bu araç-gerecin stok kayıtları bulunduğu için silinemez. Önce stok kayıtlarını silin" };
  }

  const { error } = await supabase.from("tools").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/tools");
  return { success: true };
}

export async function assignTool(formData: FormData) {
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

  // Admin veya depo rolü kontrolü (depo rolü yoksa sadece admin)
  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const toolId = formData.get("tool_id") as string;
  const warehouseId = formData.get("warehouse_id") as string;
  const assignedTo = formData.get("assigned_to") as string;
  let notes = formData.get("notes") as string | null;

  // UUID validasyonu
  if (!toolId || toolId.trim() === "") {
    return { error: "Araç/gereç seçilmedi" };
  }
  if (!warehouseId || warehouseId.trim() === "") {
    return { error: "Depo seçilmedi" };
  }
  if (!assignedTo || assignedTo.trim() === "") {
    return { error: "Kullanıcı seçilmedi" };
  }

  // Atanan kullanıcının user rolünde olduğunu kontrol et
  const { data: assignedUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", assignedTo)
    .single();

  if (assignedUser?.role !== "user") {
    return { error: "Sadece çalışan (user) rolündeki kullanıcılara zimmet yapılabilir" };
  }

  // Boş string'leri null'a çevir
  if (notes === "") notes = null;

  const { data, error } = await supabase
    .from("tool_assignments")
    .insert({
      tool_id: toolId,
      warehouse_id: warehouseId,
      assigned_to: assignedTo,
      assigned_by: user.id,
      notes,
      status: "assigned",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Stoktan düş (eğer stokta varsa)
  await supabase
    .from("warehouse_stock")
    .update({ quantity: 0 })
    .eq("warehouse_id", warehouseId)
    .eq("tool_id", toolId);

  // Araç-gereç zimmetlendiğinde bildirim gönder
  const { notifyToolAssigned } = await import("@/modules/bildirim/actions/notification-service");
  await notifyToolAssigned(toolId, assignedTo, user.id);

  revalidatePath("/depo/tools");
  revalidatePath("/depo/tools/assignments");
  return { data };
}

// Çalışan zimmetten bırakma isteği
export async function requestReturn(assignmentId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const returnNotes = formData.get("return_notes") as string | null;

  // Assignment'ın kullanıcıya ait olduğunu kontrol et
  const { data: assignment } = await supabase
    .from("tool_assignments")
    .select("assigned_to, status")
    .eq("id", assignmentId)
    .single();

  if (!assignment) {
    return { error: "Zimmet kaydı bulunamadı" };
  }

  if (assignment.assigned_to !== user.id) {
    return { error: "Bu zimmet size ait değil" };
  }

  if (assignment.status !== "assigned") {
    return { error: "Bu zimmet zaten iade edilmiş veya iade isteği gönderilmiş" };
  }

  // İade isteği oluştur
  const { data, error } = await supabase
    .from("tool_assignments")
    .update({
      status: "return_requested",
      return_requested_at: new Date().toISOString(),
      return_notes: returnNotes?.trim() || null,
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/my-assignments");
  revalidatePath("/depo/tools/assignments");
  return { data };
}

// Depo onayı - Zimmetten bırakma onayı
export async function approveReturn(assignmentId: string, formData: FormData) {
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

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const approvalNotes = formData.get("approval_notes") as string | null;
  const warehouseId = formData.get("warehouse_id") as string;

  // Assignment'ı getir
  const { data: assignment, error: assignmentError } = await supabase
    .from("tool_assignments")
    .select("tool_id, status")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignment) {
    return { error: "Zimmet kaydı bulunamadı" };
  }

  if (assignment.status !== "return_requested") {
    return { error: "Bu zimmet için iade isteği bulunmuyor" };
  }

  // Onayla ve iade et
  const { data: updatedAssignment, error: updateError } = await supabase
    .from("tool_assignments")
    .update({
      status: "returned",
      returned_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      approval_notes: approvalNotes?.trim() || null,
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message };
  }

  // Stoka geri ekle
  const { data: existingStock } = await supabase
    .from("warehouse_stock")
    .select("*")
    .eq("warehouse_id", warehouseId)
    .eq("tool_id", assignment.tool_id)
    .single();

  if (existingStock) {
    await supabase
      .from("warehouse_stock")
      .update({ quantity: 1 })
      .eq("id", existingStock.id);
  } else {
    await supabase.from("warehouse_stock").insert({
      warehouse_id: warehouseId,
      tool_id: assignment.tool_id,
      quantity: 1,
    });
  }

  revalidatePath("/depo/tools/assignments");
  revalidatePath("/depo/tools/assignments/approvals");
  return { data: updatedAssignment };
}

// Depo reddi - Zimmetten bırakma reddi
export async function rejectReturn(assignmentId: string, formData: FormData) {
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

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const approvalNotes = formData.get("approval_notes") as string | null;

  // Assignment'ı getir
  const { data: assignment } = await supabase
    .from("tool_assignments")
    .select("status")
    .eq("id", assignmentId)
    .single();

  if (!assignment) {
    return { error: "Zimmet kaydı bulunamadı" };
  }

  if (assignment.status !== "return_requested") {
    return { error: "Bu zimmet için iade isteği bulunmuyor" };
  }

  // Reddet
  const { data, error } = await supabase
    .from("tool_assignments")
    .update({
      status: "assigned",
      rejected_at: new Date().toISOString(),
      rejected_by: user.id,
      approval_notes: approvalNotes?.trim() || null,
      return_requested_at: null,
      return_notes: null,
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/depo/tools/assignments");
  revalidatePath("/depo/tools/assignments/approvals");
  revalidatePath("/dashboard/my-assignments");
  return { data };
}

// Eski returnTool fonksiyonu (geriye dönük uyumluluk için)
export async function returnTool(assignmentId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const warehouseId = formData.get("warehouse_id") as string;

  // Assignment'ı güncelle
  const { data: assignment, error: assignmentError } = await supabase
    .from("tool_assignments")
    .update({
      status: "returned",
      returned_at: new Date().toISOString(),
    })
    .eq("id", assignmentId)
    .select()
    .single();

  if (assignmentError) {
    return { error: assignmentError.message };
  }

  // Stoka geri ekle
  const { data: existingStock } = await supabase
    .from("warehouse_stock")
    .select("*")
    .eq("warehouse_id", warehouseId)
    .eq("tool_id", assignment.tool_id)
    .single();

  if (existingStock) {
    await supabase
      .from("warehouse_stock")
      .update({ quantity: 1 })
      .eq("id", existingStock.id);
  } else {
    await supabase.from("warehouse_stock").insert({
      warehouse_id: warehouseId,
      tool_id: assignment.tool_id,
      quantity: 1,
    });
  }

  revalidatePath("/depo/tools");
  revalidatePath("/depo/tools/assignments");
  return { data: assignment };
}
