import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ServiceForm from "@/modules/admin/components/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const serviceId = resolvedParams.id;

  if (!serviceId) {
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

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Hizmet Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Hizmet bilgilerini güncelleyin
          </p>
        </div>

        <ServiceForm service={service} />
      </div>
    </AppLayout>
  );
}
