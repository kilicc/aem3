import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import EquipmentForm from "@/modules/depo/components/EquipmentForm";

export default async function NewEquipmentPage() {
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
            Yeni Ekipman
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Yeni ekipman ekleyin
          </p>
        </div>

        <EquipmentForm warehouses={warehouses || []} />
      </div>
    </AppLayout>
  );
}

