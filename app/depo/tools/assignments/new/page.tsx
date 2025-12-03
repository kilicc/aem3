import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ToolAssignmentForm from "@/modules/depo/components/ToolAssignmentForm";

export default async function NewToolAssignmentPage() {
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

  const [warehousesResult, toolsResult, usersResult] = await Promise.all([
    supabase.from("warehouses").select("id, name").order("name"),
    supabase.from("tools").select("id, name, serial_number").order("name"),
    supabase.from("profiles").select("id, full_name, email").eq("role", "user").order("full_name"),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Zimmet
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Araç-gereç zimmeti oluşturun
          </p>
        </div>

        <ToolAssignmentForm
          warehouses={warehousesResult.data || []}
          tools={toolsResult.data || []}
          users={usersResult.data || []}
        />
      </div>
    </AppLayout>
  );
}
