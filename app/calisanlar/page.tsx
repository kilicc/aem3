import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import EmployeesTable from "@/modules/calisanlar/components/EmployeesTable";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }> | { page?: string; search?: string };
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
  const search = resolvedParams.search || "";
  const perPage = 10;

  let query = supabase
    .from("employees")
    .select(
      `
      *,
      user:profiles!employees_user_id_fkey(id, full_name, email)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_number.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data: employees, count } = await query.range(
    (page - 1) * perPage,
    page * perPage - 1
  );

  // İlişkileri düzelt
  const employeesFixed = (employees || []).map((emp: any) => ({
    ...emp,
    user: Array.isArray(emp.user) ? emp.user[0] : emp.user || null,
  }));

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Çalışanlar
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Çalışan listesi ve özlük dosyası yönetimi
            </p>
          </div>
          <Link href="/calisanlar/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Çalışan</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        <EmployeesTable
          employees={employeesFixed}
          currentPage={page}
          totalPages={Math.ceil((count || 0) / perPage)}
          totalCount={count || 0}
          search={search}
        />
      </div>
    </AppLayout>
  );
}

