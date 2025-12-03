import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WorkOrderCalendar from "@/modules/is-emri/components/WorkOrderCalendar";

export default async function WorkOrderCalendarPage() {
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

  let query = supabase
    .from("work_orders")
    .select(
      `
      id,
      order_number,
      scheduled_date,
      status,
      priority,
      customer:customers!work_orders_customer_id_fkey(name),
      service:services!work_orders_service_id_fkey(name)
    `
    )
    .not("scheduled_date", "is", null);

  // Kullanıcılar sadece kendilerine atanan iş emirlerini görebilir
  if (profile?.role === "user") {
    query = query.contains("assigned_to", [user.id]);
  }

  const { data: workOrders } = await query.order("scheduled_date");

  // Services ilişkisini düzelt
  const workOrdersFixed = (workOrders || []).map((wo: any) => ({
    ...wo,
    customer: Array.isArray(wo.customer) ? wo.customer[0] : wo.customer,
    service: Array.isArray(wo.service) ? wo.service[0] : wo.service,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            İş Emri Takvimi
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Planlanan iş emirlerini takvim görünümünde görüntüleyin
          </p>
        </div>

        <WorkOrderCalendar workOrders={workOrdersFixed} />
      </div>
    </AppLayout>
  );
}
