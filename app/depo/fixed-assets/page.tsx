import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import FixedAssetsTable from "@/modules/depo/components/FixedAssetsTable";

export const revalidate = 30;

export default async function FixedAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }> | { page?: string; search?: string; status?: string };
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
  const status = resolvedParams.status || "";
  const perPage = 10;

  let query = supabase
    .from("fixed_assets")
    .select(
      `
      *,
      warehouse:warehouses!fixed_assets_warehouse_id_fkey(id, name),
      assigned_to_profile:profiles!fixed_assets_assigned_to_fkey(id, full_name, email),
      created_by_profile:profiles!fixed_assets_created_by_fkey(id, full_name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,asset_code.ilike.%${search}%,category.ilike.%${search}%,serial_number.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: fixedAssets, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  // İlişkileri düzelt
  const fixedAssetsFixed = (fixedAssets || []).map((asset: any) => ({
    ...asset,
    warehouse: Array.isArray(asset.warehouse) ? asset.warehouse[0] : asset.warehouse,
    assigned_to_profile: Array.isArray(asset.assigned_to_profile) ? asset.assigned_to_profile[0] : asset.assigned_to_profile,
    created_by_profile: Array.isArray(asset.created_by_profile) ? asset.created_by_profile[0] : asset.created_by_profile,
  }));

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Demirbaşlar
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Şirket demirbaşları listesi ve yönetimi
            </p>
          </div>
          <Link href="/depo/fixed-assets/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Demirbaş</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        <FixedAssetsTable
          fixedAssets={fixedAssetsFixed}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          search={search}
          status={status}
        />
      </div>
    </AppLayout>
  );
}

