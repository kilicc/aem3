import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ReturnApprovalsTable from "@/modules/depo/components/ReturnApprovalsTable";

export default async function ReturnApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }> | { page?: string };
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
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // İade isteği bekleyen zimmetleri getir
  const { data: assignments, count } = await supabase
    .from("tool_assignments")
    .select(
      `
      *,
      tool:tools!tool_assignments_tool_id_fkey(id, name, serial_number),
      warehouse:warehouses!tool_assignments_warehouse_id_fkey(id, name),
      assigned_to_profile:profiles!tool_assignments_assigned_to_fkey(id, full_name, email)
    `,
      { count: "exact" }
    )
    .eq("status", "return_requested")
    .order("return_requested_at", { ascending: true })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            İade Onayları
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Zimmetten bırakma isteklerini onaylayın veya reddedin
          </p>
        </div>

        <ReturnApprovalsTable
          assignments={assignments || []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
        />
      </div>
    </AppLayout>
  );
}

