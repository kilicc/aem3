import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import ToolAssignmentsTable from "@/modules/depo/components/ToolAssignmentsTable";

export default async function ToolAssignmentsPage({
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedParams = await Promise.resolve(searchParams);
  const page = parseInt(resolvedParams.page || "1");
  const status = resolvedParams.status || "assigned";
  const perPage = 10;

  let query = supabase
    .from("tool_assignments")
    .select(
      `
      *,
      tool:tools!tool_assignments_tool_id_fkey(id, name, serial_number),
      warehouse:warehouses!tool_assignments_warehouse_id_fkey(id, name),
      assigned_to_profile:profiles!tool_assignments_assigned_to_fkey(id, full_name, email),
      assigned_by_profile:profiles!tool_assignments_assigned_by_fkey(id, full_name, email)
    `,
      { count: "exact" }
    )
    .eq("status", status)
    .order("assigned_at", { ascending: false });

  const { data: assignments, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Araç-Gereç Zimmetleri
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Zimmet atama ve iade işlemleri
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/depo/tools/assignments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Zimmet
              </Button>
            </Link>
            <Link href="/depo/tools/assignments/approvals">
              <Button variant="outline">
                İade Onayları
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/depo/tools/assignments?status=assigned"
            className={status === "assigned" ? "font-semibold" : ""}
          >
            <Button variant={status === "assigned" ? "default" : "outline"}>
              Aktif Zimmetler
            </Button>
          </Link>
          <Link
            href="/depo/tools/assignments?status=returned"
            className={status === "returned" ? "font-semibold" : ""}
          >
            <Button variant={status === "returned" ? "default" : "outline"}>
              İade Edilenler
            </Button>
          </Link>
        </div>

        <ToolAssignmentsTable
          assignments={assignments || []}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          status={status}
        />
      </div>
    </AppLayout>
  );
}
