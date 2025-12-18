import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import YegisFormComponent from "@/modules/yegis/components/YegisFormComponent";

export default async function YegisFormEditPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  const { data: form, error } = await supabase
    .from("yegis_forms")
    .select(`
      *,
      customer:customers(id, name, tax_id, tax_office, phone, address, city, district),
      creator:profiles!yegis_forms_created_by_fkey(id, full_name, email)
    `)
    .eq("id", id)
    .single();

  if (error || !form) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            YEGİS Formu Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Form No: {form.form_number}
          </p>
        </div>

        <YegisFormComponent form={form} customer={form.customer} />
      </div>
    </AppLayout>
  );
}

