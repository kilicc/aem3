import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import YegisFormComponent from "@/modules/yegis/components/YegisFormComponent";

export default async function NewYegisFormPage({
  params,
}: {
  params: Promise<{ customerId: string }> | { customerId: string };
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

  const resolvedParams = await Promise.resolve(params);
  const { customerId } = resolvedParams;

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, tax_id, tax_office, phone, address, city, district")
    .eq("id", customerId)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni YEGİS Formu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Müşteri: {customer.name}
          </p>
        </div>

        <YegisFormComponent customer={customer} />
      </div>
    </AppLayout>
  );
}

