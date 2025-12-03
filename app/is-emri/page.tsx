import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import WorkOrdersTable from "@/modules/is-emri/components/WorkOrdersTable";

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }> | { page?: string; status?: string; search?: string };
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
    .order("created_at", { ascending: false });
  
  // started_at'ı da dahil et

  // Rol bazlı filtreleme
  if (profile?.role === "user") {
    query = query.contains("assigned_to", [user.id]);
  }

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
              İş Emirleri
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              İş emri listesi ve yönetimi
            </p>
          </div>
          <div className="flex gap-2">
            {profile?.role === "admin" && (
              <Link href="/is-emri/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni İş Emri
                </Button>
              </Link>
            )}
            <Link href="/is-emri/calendar">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Takvim
              </Button>
            </Link>
          </div>
        </div>

        {/* Durum Filtreleri */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/is-emri">
            <Button variant={!status ? "default" : "outline"} size="sm">
              Tümü
            </Button>
          </Link>
          <Link href="/is-emri?status=pending">
            <Button variant={status === "pending" ? "default" : "outline"} size="sm">
              Beklemede
            </Button>
          </Link>
          <Link href="/is-emri?status=in_progress">
            <Button variant={status === "in_progress" ? "default" : "outline"} size="sm">
              İşlemde
            </Button>
          </Link>
          <Link href="/is-emri?status=completed">
            <Button variant={status === "completed" ? "default" : "outline"} size="sm">
              Tamamlandı
            </Button>
          </Link>
        </div>

        <WorkOrdersTable
          workOrders={workOrdersFixed}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          role={profile?.role || "user"}
          search={search}
          status={status}
        />
      </div>
    </AppLayout>
  );
}
