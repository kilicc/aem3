import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import VehiclesTable from "@/modules/arac-bakim/components/VehiclesTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function VehiclesPage({
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
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // Filtreleme
  let query = supabase
    .from("vehicles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Arama (plaka, marka, model)
  if (resolvedParams.search) {
    query = query.or(
      `plate_number.ilike.%${resolvedParams.search}%,brand.ilike.%${resolvedParams.search}%,model.ilike.%${resolvedParams.search}%`
    );
  }

  // Durum filtresi
  if (resolvedParams.status) {
    query = query.eq("status", resolvedParams.status);
  }

  const { data: vehicles, count } = await query.range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Araç Bakım Takip
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Araçları yönetin ve bakım takibini yapın
            </p>
          </div>
          <Link href="/arac-bakim/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Yeni Araç Ekle</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        <VehiclesTable
          vehicles={vehicles || []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
          search={resolvedParams.search}
          status={resolvedParams.status}
        />
      </div>
    </AppLayout>
  );
}

