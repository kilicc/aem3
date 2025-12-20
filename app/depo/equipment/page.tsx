import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import EquipmentTable from "@/modules/depo/components/EquipmentTable";

export const revalidate = 30;

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }> | { page?: string; search?: string; category?: string };
}) {
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

  const resolvedParams = await Promise.resolve(searchParams);
  const page = parseInt(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const perPage = 10;

  let query = supabase
    .from("equipment")
    .select(
      `
      *,
      warehouse:warehouses!equipment_warehouse_id_fkey(id, name),
      created_by_profile:profiles!equipment_created_by_fkey(id, full_name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,equipment_code.ilike.%${search}%,category.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data: equipment, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  // İlişkileri düzelt
  const equipmentFixed = (equipment || []).map((item: any) => ({
    ...item,
    warehouse: Array.isArray(item.warehouse) ? item.warehouse[0] : item.warehouse,
    created_by_profile: Array.isArray(item.created_by_profile) ? item.created_by_profile[0] : item.created_by_profile,
  }));

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Ekipmanlar
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Yelek, çeket, iş ayakkabısı, baret gibi periyodik ürünler
            </p>
          </div>
          <Link href="/depo/equipment/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Ekipman</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        <EquipmentTable
          equipment={equipmentFixed}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          search={search}
          category={category}
        />
      </div>
    </AppLayout>
  );
}

