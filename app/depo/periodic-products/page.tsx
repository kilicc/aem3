import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import PeriodicProductsTable from "@/modules/depo/components/PeriodicProductsTable";

export const revalidate = 30;

export default async function PeriodicProductsPage({
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

  // Dağıtımları getir (takip bilgileriyle birlikte)
  let query = supabase
    .from("periodic_product_distributions")
    .select(
      `
      *,
      equipment:equipment!periodic_product_distributions_equipment_id_fkey(id, name, category),
      employee:profiles!periodic_product_distributions_employee_id_fkey(id, full_name, email),
      distributed_by_profile:profiles!periodic_product_distributions_distributed_by_fkey(id, full_name),
      tracking:periodic_product_tracking!periodic_product_tracking_distribution_id_fkey(id, status, days_until_renewal, next_renewal_date)
    `,
      { count: "exact" }
    )
    .order("distribution_date", { ascending: false });

  if (search) {
    query = query.or(`equipment.name.ilike.%${search}%,employee.full_name.ilike.%${search}%`);
  }

  const { data: distributions, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  // İlişkileri düzelt
  const distributionsFixed = (distributions || []).map((dist: any) => {
    const equipment = Array.isArray(dist.equipment) ? dist.equipment[0] : dist.equipment;
    const employee = Array.isArray(dist.employee) ? dist.employee[0] : dist.employee;
    const distributedBy = Array.isArray(dist.distributed_by_profile) ? dist.distributed_by_profile[0] : dist.distributed_by_profile;
    const tracking = Array.isArray(dist.tracking) ? dist.tracking[0] : dist.tracking;

    // Status'u tracking'den al veya hesapla
    let finalStatus = "active";
    if (tracking) {
      finalStatus = tracking.status;
    } else if (dist.next_renewal_date) {
      const daysUntil = Math.floor((new Date(dist.next_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) {
        finalStatus = "overdue";
      } else if (daysUntil <= 30) {
        finalStatus = "due_soon";
      }
    }

    return {
      ...dist,
      equipment,
      employee,
      distributed_by_profile: distributedBy,
      tracking: tracking || null,
      status: finalStatus,
    };
  });

  // Status filtresi varsa uygula
  let filteredDistributions = distributionsFixed;
  if (status) {
    filteredDistributions = distributionsFixed.filter((dist: any) => dist.status === status);
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Periyodik Ürün Dağıtımları
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Çalışanlara verilen periyodik ürünlerin takibi ve bildirimler
            </p>
          </div>
          <Link href="/depo/periodic-products/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Dağıtım</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        <PeriodicProductsTable
          distributions={filteredDistributions}
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

