import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import EmployeeForm from "@/modules/calisanlar/components/EmployeeForm";

export default async function NewEmployeePage() {
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

  // Kullanıcıları getir (henüz çalışan kaydı olmayanlar)
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name");

  const { data: employeesWithUsers } = await supabase
    .from("employees")
    .select("user_id")
    .not("user_id", "is", null);

  const assignedUserIds = new Set(
    (employeesWithUsers || []).map((e: any) => e.user_id)
  );

  const availableUsers = (allUsers || []).filter(
    (u) => !assignedUserIds.has(u.id)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Çalışan
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Yeni bir çalışan kaydı oluşturun
          </p>
        </div>

        <EmployeeForm users={availableUsers} />
      </div>
    </AppLayout>
  );
}

