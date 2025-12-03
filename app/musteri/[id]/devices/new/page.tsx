import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import DeviceForm from "@/modules/musteri/components/DeviceForm";

export default async function NewDevicePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Next.js 16'da params async olabilir
  const resolvedParams = await Promise.resolve(params);
  const customerId = resolvedParams.id;

  if (!customerId) {
    redirect("/musteri");
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

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name")
    .eq("id", customerId)
    .single();

  if (customerError || !customer) {
    console.error("Müşteri getirme hatası:", customerError);
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Cihaz
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {customer.name} için yeni bir cihaz ekleyin
          </p>
        </div>

        <DeviceForm customerId={customerId} />
      </div>
    </AppLayout>
  );
}
