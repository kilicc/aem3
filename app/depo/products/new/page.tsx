import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ProductForm from "@/modules/depo/components/ProductForm";

export default async function NewProductPage() {
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

  const [unitsResult, categoriesResult] = await Promise.all([
    supabase.from("units").select("id, name, symbol").order("name"),
    supabase.from("product_categories").select("id, name").order("name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Ürün
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Yeni bir ürün/malzeme oluşturun
          </p>
        </div>

        <ProductForm
          units={unitsResult.data || []}
          categories={categoriesResult.data || []}
        />
      </div>
    </AppLayout>
  );
}
