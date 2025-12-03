import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import MyAssignmentsTable from "@/modules/depo/components/MyAssignmentsTable";

export default async function MyAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }> | { page?: string; status?: string };
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

  if (profile?.role !== "user") {
    redirect("/dashboard");
  }

  const resolvedParams = await Promise.resolve(searchParams);
  const page = parseInt(resolvedParams.page || "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const status = resolvedParams.status || "assigned";

  // Kullanıcının zimmetlerini getir
  let query = supabase
    .from("tool_assignments")
    .select(
      `
      *,
      tool:tools!tool_assignments_tool_id_fkey(id, name, serial_number),
      warehouse:warehouses!tool_assignments_warehouse_id_fkey(id, name)
    `,
      { count: "exact" }
    )
    .eq("assigned_to", user.id)
    .order("assigned_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: assignments, count } = await query.range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Zimmetlerim
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Size zimmetlenen araç-gereçler
          </p>
        </div>

        <MyAssignmentsTable
          assignments={assignments || []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={count || 0}
          status={status}
        />
      </div>
    </AppLayout>
  );
}

