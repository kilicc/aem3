import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WorkOrderWorkForm from "@/modules/is-emri/components/WorkOrderWorkForm";

export default async function WorkOrderWorkPage({
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

  const { data: workOrder, error: workOrderError } = await supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(id, name, phone, email, address, latitude, longitude, tax_id, tax_office),
      customer_device:customer_devices!work_orders_customer_device_id_fkey(id, device_type, device_name, serial_number),
      service:services!work_orders_service_id_fkey(name, service_form_template),
      vehicle:vehicles!work_orders_vehicle_id_fkey(id, plate_number, brand, model, mileage)
    `
    )
    .eq("id", workOrderId)
    .single();

  if (workOrderError || !workOrder) {
    console.error("İş emri getirme hatası:", workOrderError);
    notFound();
  }

  // Kullanıcı kontrolü
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const canEdit =
    profile?.role === "admin" ||
    (profile?.role === "user" &&
      workOrder.assigned_to &&
      Array.isArray(workOrder.assigned_to) &&
      workOrder.assigned_to.includes(user.id));

  if (!canEdit || workOrder.status === "completed" || workOrder.status === "cancelled") {
    redirect(`/is-emri/${workOrderId}`);
  }

  // İlişkileri düzelt
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
    vehicle: Array.isArray(workOrder.vehicle)
      ? workOrder.vehicle[0]
      : workOrder.vehicle,
  };

  // Assigned users bilgilerini getir
  const assignedUserIds = workOrderFixed.assigned_to || [];
  let assignedUsers: Array<{ id: string; full_name: string }> = [];
  
  if (assignedUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assignedUserIds);
    
    assignedUsers = (profiles || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || "",
    }));
  }

  // Aktif araçları getir (araç seçimi için)
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_number, brand, model, mileage, status")
    .eq("status", "active")
    .order("plate_number", { ascending: true });

  return (
    <AppLayout>
      <div className="-mb-3 sm:-mb-4 md:-mb-6">
        <WorkOrderWorkForm
          workOrder={workOrderFixed}
          currentUserId={user.id}
          assignedUsers={assignedUsers}
          vehicles={vehicles || []}
        />
      </div>
    </AppLayout>
  );
}
