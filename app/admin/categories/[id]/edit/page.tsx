import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import CategoryForm from "@/modules/depo/components/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const categoryId = resolvedParams.id;

  if (!categoryId) {
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

  const { data: category, error: categoryError } = await supabase
    .from("product_categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Kategori Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kategori bilgilerini güncelleyin
          </p>
        </div>

        <CategoryForm category={category} />
      </div>
    </AppLayout>
  );
}
