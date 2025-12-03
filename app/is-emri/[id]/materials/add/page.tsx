import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import MaterialForm from "@/modules/is-emri/components/MaterialForm";

export default async function AddMaterialPage({
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
    .select("id, order_number, status")
    .eq("id", workOrderId)
    .single();

  if (workOrderError || !workOrder) {
    console.error("İş emri getirme hatası:", workOrderError);
    notFound();
  }

  if (workOrder.status === "completed") {
    redirect(`/is-emri/${workOrderId}`);
  }

  const [warehousesResult, productsResult] = await Promise.all([
    supabase.from("warehouses").select("id, name").order("name"),
    supabase.from("products").select("id, name").order("name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Malzeme Ekle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {workOrder.order_number} için malzeme ekleyin
          </p>
        </div>

        <MaterialForm
          workOrderId={workOrderId}
          warehouses={warehousesResult.data || []}
          products={productsResult.data || []}
        />
      </div>
    </AppLayout>
  );
}
