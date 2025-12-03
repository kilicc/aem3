import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WorkOrderForm from "@/modules/is-emri/components/WorkOrderForm";

export default async function EditWorkOrderPage({
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: workOrder, error: workOrderError } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", workOrderId)
    .single();

  if (workOrderError || !workOrder) {
    console.error("İş emri getirme hatası:", workOrderError);
    notFound();
  }

  // Tek hizmeti getir (Arıza Bakım ve Malzeme Sipariş Fişi)
  const [customersResult, servicesResult, usersResult] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("services").select("id, name").eq("is_active", true).eq("name", "Arıza Bakım ve Malzeme Sipariş Fişi").limit(1),
    supabase.from("profiles").select("id, full_name, email").eq("role", "user").order("full_name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            İş Emri Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            İş emri bilgilerini güncelleyin
          </p>
        </div>

        <WorkOrderForm
          workOrder={workOrder}
          customers={customersResult.data || []}
          services={servicesResult.data || []}
          users={usersResult.data || []}
        />
      </div>
    </AppLayout>
  );
}
