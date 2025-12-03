import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import EmployeeForm from "@/modules/calisanlar/components/EmployeeForm";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const employeeId = resolvedParams.id;

  if (!employeeId) {
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

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .single();

  if (employeeError || !employee) {
    notFound();
  }

  // Tüm kullanıcıları getir (mevcut çalışanın kullanıcısı dahil)
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name");

  // Mevcut çalışanın kullanıcısı hariç, diğer atanmış kullanıcıları filtrele
  const { data: employeesWithUsers } = await supabase
    .from("employees")
    .select("user_id")
    .not("user_id", "is", null)
    .neq("id", employeeId);

  const assignedUserIds = new Set(
    (employeesWithUsers || []).map((e: any) => e.user_id)
  );

  const availableUsers = (allUsers || []).filter(
    (u) => !assignedUserIds.has(u.id) || u.id === employee.user_id
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Çalışan Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Çalışan bilgilerini güncelleyin
          </p>
        </div>

        <EmployeeForm employee={employee} users={availableUsers} />
      </div>
    </AppLayout>
  );
}

