import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import CustomerDetail from "@/modules/musteri/components/CustomerDetail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Next.js 16'da params async olabilir
  const resolvedParams = await Promise.resolve(params);
  const customerId = resolvedParams.id;

  if (!customerId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError || !customer) {
    console.error("Müşteri getirme hatası:", customerError);
    notFound();
  }

  if (!customer) {
    notFound();
  }

  // Cihazları getir
  const { data: devices } = await supabase
    .from("customer_devices")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  // İş emirlerini getir
  const { data: workOrdersData } = await supabase
    .from("work_orders")
    .select("id, order_number, status, priority, created_at, service_id, services(name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Services ilişkisini düzelt
  const workOrders = (workOrdersData || []).map((wo: any) => ({
    ...wo,
    services: Array.isArray(wo.services) ? wo.services[0] : wo.services || null,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              {customer.name}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Müşteri detayları ve geçmişi
            </p>
          </div>
          <Link href={`/musteri/${customerId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
        </div>

        <CustomerDetail
          customer={customer}
          devices={devices || []}
          workOrders={workOrders || []}
        />
      </div>
    </AppLayout>
  );
}
