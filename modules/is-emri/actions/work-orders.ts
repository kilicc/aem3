"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWorkOrder(formData: FormData) {
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

  const customerId = formData.get("customer_id") as string;
  let customerDeviceId = formData.get("customer_device_id") as string | null;
  // Boş string'leri null'a çevir
  if (customerDeviceId === "" || customerDeviceId === null) {
    customerDeviceId = null;
  }
  const serviceId = formData.get("service_id") as string;
  const assignedTo = formData.getAll("assigned_to").filter((id): id is string => typeof id === "string" && id.trim() !== "");
  const priority = formData.get("priority") as string;
  const scheduledDate = formData.get("scheduled_date") as string | null;
  const scheduledTime = formData.get("scheduled_time") as string | null;
  
  // Tarih ve saat bilgisini birleştir
  let scheduledDateTime = null;
  if (scheduledDate) {
    if (scheduledTime) {
      scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
    } else {
      scheduledDateTime = scheduledDate;
    }
  }

  // Yeni cihaz oluşturma kontrolü
  const newDeviceType = formData.get("new_device_type") as string | null;
  const newDeviceName = formData.get("new_device_name") as string | null;
  const newSerialNumber = formData.get("new_serial_number") as string | null;
  const customerIdForDevice = formData.get("customer_id_for_device") as string | null;

  if (newDeviceType && newDeviceName) {
    // Yeni cihaz oluşturulurken müşteri ID kontrolü
    // customerIdForDevice varsa onu kullan, yoksa customerId'yi kullan
    const deviceCustomerId = customerIdForDevice || customerId;
    if (!deviceCustomerId || deviceCustomerId.trim() === "") {
      return { error: "Müşteri ID'si geçersiz" };
    }
    // Yeni cihaz oluştur
    const { data: newDevice, error: deviceError } = await supabase
      .from("customer_devices")
      .insert({
        customer_id: deviceCustomerId,
        device_type: newDeviceType,
        device_name: newDeviceName,
        serial_number: newSerialNumber || null,
      })
      .select()
      .single();

    if (deviceError) {
      return { error: `Cihaz oluşturulurken hata: ${deviceError.message}` };
    }

    customerDeviceId = newDevice.id;
  }

  // İş emri numarası oluştur
  const year = new Date().getFullYear();
  const { data: lastOrder } = await supabase
    .from("work_orders")
    .select("order_number")
    .like("order_number", `WO-${year}-%`)
    .order("order_number", { ascending: false })
    .limit(1)
    .single();

  let orderNumber = `WO-${year}-000001`;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.order_number.split("-")[2]);
    orderNumber = `WO-${year}-${String(lastNum + 1).padStart(6, "0")}`;
  }

  // UUID validasyonu
  if (!customerId || customerId.trim() === "") {
    return { error: "Müşteri seçilmedi" };
  }
  if (!serviceId || serviceId.trim() === "") {
    return { error: "Hizmet seçilmedi" };
  }
  if (assignedTo.length === 0) {
    return { error: "En az bir çalışan seçilmelidir" };
  }

  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_device_id: customerDeviceId || null,
      service_id: serviceId,
      assigned_to: assignedTo.length > 0 ? assignedTo : [],
      priority: priority || "normal",
      status: "pending",
      scheduled_date: scheduledDateTime,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/is-emri");
  
  // Yeni bildirim servisi ile bildirim gönder
  const { notifyWorkOrderCreated } = await import("@/modules/bildirim/actions/notification-service");
  await notifyWorkOrderCreated(data.id, user.id);
  
  return { data };
}

export async function updateWorkOrderStatus(
  id: string,
  status: string,
  formData?: FormData
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // İşlemde durumuna geçildiğinde konum bilgisi ve araç bilgileri al
  if (status === "in_progress") {
    updates.started_at = new Date().toISOString();
    if (formData) {
      const latitude = formData.get("latitude") as string | null;
      const longitude = formData.get("longitude") as string | null;
      const locationAddress = formData.get("location_address") as string | null;

      if (latitude && longitude) {
        updates.location_latitude = parseFloat(latitude);
        updates.location_longitude = parseFloat(longitude);
        updates.location_address = locationAddress;
      }

      // Araç bilgileri
      const vehicleId = formData.get("vehicle_id") as string | null;
      const vehicleStartKm = formData.get("vehicle_start_km") as string | null;
      const vehicleAssignedBy = formData.get("vehicle_assigned_by") as string | null;

      if (vehicleId) {
        updates.vehicle_id = vehicleId;
        updates.vehicle_assigned_at = new Date().toISOString();
        if (vehicleAssignedBy) {
          updates.vehicle_assigned_by = vehicleAssignedBy;
        }
        if (vehicleStartKm) {
          updates.vehicle_start_km = parseInt(vehicleStartKm);
        }

        // Vehicle usage log oluştur
        await supabase.from("vehicle_usage_logs").insert({
          vehicle_id: vehicleId,
          work_order_id: id,
          assigned_by: vehicleAssignedBy || user.id,
          start_km: vehicleStartKm ? parseInt(vehicleStartKm) : 0,
          start_time: new Date().toISOString(),
        });
      }
    }
  }

  // Tamamlandı durumuna geçildiğinde
  if (status === "completed") {
    // İş emrinin daha önce başlatılmış olması gerekiyor
    const { data: existingOrder } = await supabase
      .from("work_orders")
      .select("status, started_at, vehicle_id, vehicle_start_km")
      .eq("id", id)
      .single();

    if (existingOrder?.status !== "in_progress" && existingOrder?.status !== "pending") {
      return { error: "İş emri önce 'İşlemde' durumuna alınmalıdır" };
    }

    updates.completed_at = new Date().toISOString();

    // Araç bitiş kilometresi
    if (formData) {
      const vehicleEndKm = formData.get("vehicle_end_km") as string | null;
      if (vehicleEndKm && existingOrder?.vehicle_id) {
        const endKm = parseInt(vehicleEndKm);
        if (endKm >= (existingOrder.vehicle_start_km || 0)) {
          updates.vehicle_end_km = endKm;

          // Vehicle usage log'u güncelle
          await supabase
            .from("vehicle_usage_logs")
            .update({
              end_km: endKm,
              end_time: new Date().toISOString(),
            })
            .eq("work_order_id", id)
            .eq("vehicle_id", existingOrder.vehicle_id);
        }
      }
    }
  }

  // İptal durumuna geçildiğinde
  if (status === "cancelled") {
    const { data: existingOrder } = await supabase
      .from("work_orders")
      .select("status")
      .eq("id", id)
      .single();

    if (existingOrder?.status === "completed") {
      return { error: "Tamamlanmış iş emri iptal edilemez" };
    }
  }

  // Beklemede durumuna geri dönüş kontrolü
  if (status === "pending") {
    const { data: existingOrder } = await supabase
      .from("work_orders")
      .select("status")
      .eq("id", id)
      .single();

    if (existingOrder?.status === "completed") {
      return { error: "Tamamlanmış iş emri 'Beklemede' durumuna alınamaz" };
    }
  }

  // Eski durumu al
  const { data: oldOrder } = await supabase
    .from("work_orders")
    .select("status")
    .eq("id", id)
    .single();

  const oldStatus = oldOrder?.status || "pending";

  const { data, error } = await supabase
    .from("work_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Durum değiştiyse bildirim gönder
  if (oldStatus !== status) {
    const { notifyWorkOrderStatusChanged } = await import("@/modules/bildirim/actions/notification-service");
    await notifyWorkOrderStatusChanged(id, oldStatus, status, user.id);
  }

  revalidatePath("/is-emri");
  revalidatePath(`/is-emri/${id}`);
  return { data };
}

export async function updateWorkOrder(id: string, formData: FormData) {
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

  const customerId = formData.get("customer_id") as string;
  let customerDeviceId = formData.get("customer_device_id") as string | null;
  // Boş string'leri null'a çevir
  if (customerDeviceId === "" || customerDeviceId === null) {
    customerDeviceId = null;
  }
  const serviceId = formData.get("service_id") as string;
  const assignedTo = formData.getAll("assigned_to").filter((id): id is string => typeof id === "string" && id.trim() !== "");
  const priority = formData.get("priority") as string;
  const scheduledDate = formData.get("scheduled_date") as string | null;
  const scheduledTime = formData.get("scheduled_time") as string | null;
  const status = formData.get("status") as string;
  
  // Tarih ve saat bilgisini birleştir
  let scheduledDateTime = null;
  if (scheduledDate) {
    if (scheduledTime) {
      scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
    } else {
      scheduledDateTime = scheduledDate;
    }
  }

  // UUID validasyonu
  if (!customerId || customerId.trim() === "") {
    return { error: "Müşteri seçilmedi" };
  }
  if (!serviceId || serviceId.trim() === "") {
    return { error: "Hizmet seçilmedi" };
  }

  const { data, error } = await supabase
    .from("work_orders")
    .update({
      customer_id: customerId,
      customer_device_id: customerDeviceId || null,
      service_id: serviceId,
      assigned_to: assignedTo.length > 0 ? assignedTo : [],
      priority,
      status,
      scheduled_date: scheduledDateTime,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/is-emri");
  revalidatePath(`/is-emri/${id}`);
  return { data };
}

export async function updateWorkOrderForm(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const serviceFormData = formData.get("service_form_data") as string;
  const workDescription = formData.get("work_description") as string | null;
  const beforePhotos = formData.getAll("before_photos") as string[];
  const afterPhotos = formData.getAll("after_photos") as string[];
  const employeeSignature = formData.get("employee_signature") as string | null;
  const customerSignature = formData.get("customer_signature") as string | null;

  const updates: any = {};

  if (serviceFormData) {
    updates.service_form_data = JSON.parse(serviceFormData);
  }

  if (workDescription !== null) {
    updates.work_description = workDescription;
  }

  if (beforePhotos.length > 0) {
    updates.before_photos = beforePhotos.filter((p) => p);
  }

  if (afterPhotos.length > 0) {
    updates.after_photos = afterPhotos.filter((p) => p);
  }

  if (employeeSignature) {
    updates.employee_signature = employeeSignature;
  }

  if (customerSignature) {
    updates.customer_signature = customerSignature;
  }

  const { data, error } = await supabase
    .from("work_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/is-emri/${id}`);
  return { data };
}

export async function addWorkOrderMaterial(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("product_id") as string | null;
  const warehouseId = formData.get("warehouse_id") as string | null;
  const quantity = parseFloat(formData.get("quantity") as string) || 0;

  // UUID validasyonu
  if (!productId || productId.trim() === "") {
    return { error: "Ürün seçilmedi" };
  }
  if (!warehouseId || warehouseId.trim() === "") {
    return { error: "Depo seçilmedi" };
  }
  if (quantity <= 0) {
    return { error: "Miktar 0'dan büyük olmalıdır" };
  }

  // Ürün bilgilerini getir
  const { data: product } = await supabase
    .from("products")
    .select("unit_price")
    .eq("id", productId)
    .single();

  if (!product) {
    return { error: "Product not found" };
  }

  // Stok kontrolü
  const { data: stock } = await supabase
    .from("warehouse_stock")
    .select("quantity")
    .eq("warehouse_id", warehouseId)
    .eq("product_id", productId)
    .single();

  if (!stock || stock.quantity < quantity) {
    return { error: "Yetersiz stok" };
  }

  // Malzeme ekle
  const { data, error } = await supabase
    .from("work_order_materials")
    .insert({
      work_order_id: id,
      product_id: productId,
      warehouse_id: warehouseId,
      quantity,
      unit_price: product.unit_price,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Stoktan düş
  await supabase
    .from("warehouse_stock")
    .update({
      quantity: stock.quantity - quantity,
    })
    .eq("warehouse_id", warehouseId)
    .eq("product_id", productId);

  // Malzeme eklendiğinde bildirim gönder
  if (productId) {
    const { notifyMaterialRequest } = await import("@/modules/bildirim/actions/notification-service");
    await notifyMaterialRequest(id, productId, quantity, user.id);
  }

  revalidatePath(`/is-emri/${id}`);
  return { data };
}

export async function deleteWorkOrderMaterial(materialId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Malzeme bilgilerini getir
  const { data: material } = await supabase
    .from("work_order_materials")
    .select("work_order_id, product_id, warehouse_id, quantity")
    .eq("id", materialId)
    .single();

  if (!material) {
    return { error: "Material not found" };
  }

  // Malzemeyi sil
  const { error: deleteError } = await supabase
    .from("work_order_materials")
    .delete()
    .eq("id", materialId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Stoka geri ekle
  const { data: stock } = await supabase
    .from("warehouse_stock")
    .select("quantity")
    .eq("warehouse_id", material.warehouse_id)
    .eq("product_id", material.product_id)
    .single();

  if (stock) {
    await supabase
      .from("warehouse_stock")
      .update({
        quantity: stock.quantity + material.quantity,
      })
      .eq("warehouse_id", material.warehouse_id)
      .eq("product_id", material.product_id);
  }

  revalidatePath(`/is-emri/${material.work_order_id}`);
  return { success: true };
}

export async function updateWorkOrderMaterialPrice(
  materialId: string,
  unitPrice: number
) {
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

  if (unitPrice <= 0) {
    return { error: "Birim fiyat 0'dan büyük olmalıdır" };
  }

  // Malzeme bilgilerini getir
  const { data: material } = await supabase
    .from("work_order_materials")
    .select("work_order_id")
    .eq("id", materialId)
    .single();

  if (!material) {
    return { error: "Material not found" };
  }

  // Birim fiyatı güncelle
  const { data, error } = await supabase
    .from("work_order_materials")
    .update({ unit_price: unitPrice })
    .eq("id", materialId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/is-emri/${material.work_order_id}`);
  return { data };
}
