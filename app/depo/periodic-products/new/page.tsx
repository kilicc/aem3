import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import PeriodicProductForm from "@/modules/depo/components/PeriodicProductForm";

export default async function NewPeriodicProductPage() {
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

  // Ekipmanları ve çalışanları getir
  const [equipmentResult, employeesResult] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, name, category, quantity")
      .gt("quantity", 0)
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
            Yeni Periyodik Ürün Dağıtımı
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Çalışana periyodik ürün dağıtımı yapın
          </p>
        </div>

        <PeriodicProductForm
          equipment={equipmentResult.data || []}
          employees={employeesResult.data || []}
        />
      </div>
    </AppLayout>
  );
}

