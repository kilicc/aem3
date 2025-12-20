import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import FixedAssetForm from "@/modules/depo/components/FixedAssetForm";

export default async function EditFixedAssetPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const supabase = await createClient();
  const resolvedParams = await Promise.resolve(params);
  const fixedAssetId = resolvedParams.id;

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

  // Demirbaşı getir
  const { data: fixedAsset, error } = await supabase
    .from("fixed_assets")
    .select("*")
    .eq("id", fixedAssetId)
    .single();

  if (error || !fixedAsset) {
    notFound();
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
            Demirbaş Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Demirbaş bilgilerini güncelleyin
          </p>
        </div>

        <FixedAssetForm
          fixedAsset={fixedAsset}
          warehouses={warehousesResult.data || []}
          users={usersResult.data || []}
        />
      </div>
    </AppLayout>
  );
}

