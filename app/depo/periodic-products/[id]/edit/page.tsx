import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import PeriodicProductForm from "@/modules/depo/components/PeriodicProductForm";

export default async function EditPeriodicProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const supabase = await createClient();
  const resolvedParams = await Promise.resolve(params);
  const distributionId = resolvedParams.id;

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

  // Dağıtımı getir
  const { data: distribution, error } = await supabase
    .from("periodic_product_distributions")
    .select("*")
    .eq("id", distributionId)
    .single();

  if (error || !distribution) {
    notFound();
  }

  // Ekipmanları ve çalışanları getir
  const [equipmentResult, employeesResult] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, name, category, quantity")
      .order("name"),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "user")
      .order("full_name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Periyodik Ürün Dağıtımı Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Dağıtım bilgilerini güncelleyin
          </p>
        </div>

        <PeriodicProductForm
          distribution={distribution}
          equipment={equipmentResult.data || []}
          employees={employeesResult.data || []}
        />
      </div>
    </AppLayout>
  );
}

