import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import StockTable from "@/modules/depo/components/StockTable";
import StockFilter from "@/components/depo/StockFilter";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; warehouse?: string }> | { page?: string; warehouse?: string };
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
  const warehouseId = resolvedParams.warehouse;
  const perPage = 10;

  // Depoları getir
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("warehouse_stock")
    .select(
      `
      *,
      warehouse:warehouses!warehouse_stock_warehouse_id_fkey(id, name),
      product:products!warehouse_stock_product_id_fkey(id, name, unit:units!products_unit_id_fkey(name, symbol)),
      tool:tools!warehouse_stock_tool_id_fkey(id, name)
    `,
      { count: "exact" }
    )
    .order("last_updated_at", { ascending: false });

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  const { data: stock, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Stok Yönetimi
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Depo stokları ve minimum stok seviyeleri
            </p>
          </div>
          <Link href="/depo/stock/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Stok Ekle/Güncelle</span>
              <span className="sm:hidden">Stok Ekle</span>
            </Button>
          </Link>
        </div>

        <StockFilter warehouses={warehouses || []} />

        <StockTable
          stock={stock || []}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          warehouse={warehouseId}
        />
      </div>
    </AppLayout>
  );
}
