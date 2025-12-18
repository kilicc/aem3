import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import YegisFormView from "@/modules/yegis/components/YegisFormView";

export default async function YegisFormDetailPage({
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
        <YegisFormView form={form} />
      </div>
    </AppLayout>
  );
}

