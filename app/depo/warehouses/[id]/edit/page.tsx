import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WarehouseForm from "@/modules/depo/components/WarehouseForm";

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const warehouseId = resolvedParams.id;

  if (!warehouseId) {
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

  const { data: warehouse, error: warehouseError } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", warehouseId)
    .single();

  if (warehouseError || !warehouse) {
    notFound();
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Depo Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Depo bilgilerini güncelleyin
          </p>
        </div>

        <WarehouseForm warehouse={warehouse} users={users || []} />
      </div>
    </AppLayout>
  );
}
