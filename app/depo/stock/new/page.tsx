import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import StockForm from "@/modules/depo/components/StockForm";

export default async function NewStockPage() {
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

  const [warehousesResult, productsResult, toolsResult] = await Promise.all([
    supabase.from("warehouses").select("id, name").order("name"),
    supabase.from("products").select("id, name").order("name"),
    supabase.from("tools").select("id, name").order("name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Stok Ekle/Güncelle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Depo stoku ekleyin veya güncelleyin
          </p>
        </div>

        <StockForm
          warehouses={warehousesResult.data || []}
          products={productsResult.data || []}
          tools={toolsResult.data || []}
        />
      </div>
    </AppLayout>
  );
}
