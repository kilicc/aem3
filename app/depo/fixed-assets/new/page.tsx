import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import FixedAssetForm from "@/modules/depo/components/FixedAssetForm";

export default async function NewFixedAssetPage() {
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

  // Depoları ve kullanıcıları getir
  const [warehousesResult, usersResult] = await Promise.all([
    supabase.from("warehouses").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Demirbaş
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Yeni demirbaş ekleyin
          </p>
        </div>

        <FixedAssetForm
          warehouses={warehousesResult.data || []}
          users={usersResult.data || []}
        />
      </div>
    </AppLayout>
  );
}

