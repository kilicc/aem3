import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WorkOrderDetail from "@/modules/is-emri/components/WorkOrderDetail";

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Next.js 16'da params async olabilir
  const resolvedParams = await Promise.resolve(params);
  const workOrderId = resolvedParams.id;

  if (!workOrderId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // İş emri detaylarını getir
  const { data: workOrder, error: workOrderError } = await supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(id, name, phone, email, address, latitude, longitude),
      customer_device:customer_devices!work_orders_customer_device_id_fkey(id, device_type, device_name, serial_number),
      service:services!work_orders_service_id_fkey(id, name, service_form_template),
      created_by_profile:profiles!work_orders_created_by_fkey(id, full_name, email)
    `
    )
    .eq("id", workOrderId)
    .single();

  // Hata kontrolü
  if (workOrderError || !workOrder) {
    console.error("İş emri getirme hatası:", workOrderError);
    notFound();
  }

  // Rol kontrolü - kullanıcılar sadece kendilerine atanan iş emirlerini görebilir
  if (
    profile?.role === "user" &&
    workOrder.assigned_to &&
    Array.isArray(workOrder.assigned_to) &&
    !workOrder.assigned_to.includes(user.id)
  ) {
    redirect("/is-emri");
  }

  // Çalışanları getir
  const { data: assignedUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", workOrder.assigned_to || []);

  // Malzemeleri getir
  const { data: materials } = await supabase
    .from("work_order_materials")
    .select(
      `
      *,
      product:products!work_order_materials_product_id_fkey(id, name, unit:units!products_unit_id_fkey(name, symbol)),
      warehouse:warehouses!work_order_materials_warehouse_id_fkey(id, name)
    `
    )
    .eq("work_order_id", workOrderId);

  // Services ilişkisini düzelt
  const workOrderFixed = {
    ...workOrder,
    customer: Array.isArray(workOrder.customer)
      ? workOrder.customer[0]
      : workOrder.customer,
    customer_device: Array.isArray(workOrder.customer_device)
      ? workOrder.customer_device[0]
      : workOrder.customer_device,
    service: Array.isArray(workOrder.service)
      ? workOrder.service[0]
      : workOrder.service,
    created_by_profile: Array.isArray(workOrder.created_by_profile)
      ? workOrder.created_by_profile[0]
      : workOrder.created_by_profile,
  };

  // RLS kontrolü - eğer workOrder null döndüyse notFound
  if (!workOrderFixed) {
    notFound();
  }

  // Materials ilişkilerini düzelt
  const materialsFixed = (materials || []).map((m: any) => ({
    ...m,
    product: Array.isArray(m.product) ? m.product[0] : m.product,
    warehouse: Array.isArray(m.warehouse) ? m.warehouse[0] : m.warehouse,
  }));

  return (
    <AppLayout>
      <WorkOrderDetail
        workOrder={workOrderFixed}
        assignedUsers={assignedUsers || []}
        materials={materialsFixed}
        currentUserId={user.id}
        userRole={profile?.role || "user"}
      />
    </AppLayout>
  );
}
