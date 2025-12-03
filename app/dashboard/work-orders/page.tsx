import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import WorkOrdersTable from "@/modules/is-emri/components/WorkOrdersTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default async function UserWorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }> | { page?: string; status?: string; search?: string };
}) {
  // Middleware'de zaten auth ve admin kontrolü yapılıyor
  // Buraya sadece user'lar gelir (admin'ler gelmez çünkü middleware redirect eder)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware'de kontrol edildiği için buraya gelmezse null dön
  if (!user) {
    return null;
  }

  const resolvedParams = await Promise.resolve(searchParams);
  const page = parseInt(resolvedParams.page || "1");
  const status = resolvedParams.status;
  const search = resolvedParams.search || "";
  const perPage = 10;

  let query = supabase
    .from("work_orders")
    .select(
      `
      *,
      customer:customers!work_orders_customer_id_fkey(id, name, phone),
      service:services!work_orders_service_id_fkey(id, name)
    `,
      { count: "exact" }
    )
    .contains("assigned_to", [user.id])
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%,customer:customers.name.ilike.%${search}%`);
  }

  const { data: workOrders, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  // Services ilişkisini düzelt
  const workOrdersFixed = (workOrders || []).map((wo: any) => ({
    ...wo,
    customer: Array.isArray(wo.customer) ? wo.customer[0] : wo.customer,
    service: Array.isArray(wo.service) ? wo.service[0] : wo.service,
  }));

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              İş Emirlerim
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Size atanan iş emirleri
            </p>
          </div>
          <Link href="/is-emri/calendar" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Takvim
            </Button>
          </Link>
        </div>

        {/* Durum Filtreleri */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/work-orders" className="flex-1 sm:flex-initial min-w-[80px]">
            <Button variant={!status ? "default" : "outline"} className="w-full sm:w-auto text-xs sm:text-sm">
              Tümü
            </Button>
          </Link>
          <Link href="/dashboard/work-orders?status=pending" className="flex-1 sm:flex-initial min-w-[80px]">
            <Button variant={status === "pending" ? "default" : "outline"} className="w-full sm:w-auto text-xs sm:text-sm">
              Beklemede
            </Button>
          </Link>
          <Link href="/dashboard/work-orders?status=in_progress" className="flex-1 sm:flex-initial min-w-[80px]">
            <Button variant={status === "in_progress" ? "default" : "outline"} className="w-full sm:w-auto text-xs sm:text-sm">
              İşlemde
            </Button>
          </Link>
          <Link href="/dashboard/work-orders?status=completed" className="flex-1 sm:flex-initial min-w-[80px]">
            <Button variant={status === "completed" ? "default" : "outline"} className="w-full sm:w-auto text-xs sm:text-sm">
              Tamamlandı
            </Button>
          </Link>
        </div>

        <WorkOrdersTable
          workOrders={workOrdersFixed}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          role="user"
        />
      </div>
    </AppLayout>
  );
}
