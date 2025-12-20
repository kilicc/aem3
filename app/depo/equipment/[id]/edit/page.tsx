import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import EquipmentForm from "@/modules/depo/components/EquipmentForm";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const supabase = await createClient();
  const resolvedParams = await Promise.resolve(params);
  const equipmentId = resolvedParams.id;

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

  // Ekipmanı getir
  const { data: equipment, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", equipmentId)
    .single();

  if (error || !equipment) {
    notFound();
  }

  // Depoları getir
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id, name")
    .order("name");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Ekipman Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Ekipman bilgilerini güncelleyin
          </p>
        </div>

        <EquipmentForm equipment={equipment} warehouses={warehouses || []} />
      </div>
    </AppLayout>
  );
}

