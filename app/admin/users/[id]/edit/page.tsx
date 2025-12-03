import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import UserForm from "@/modules/admin/components/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.id;

  if (!userId) {
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

  const { data: userData, error: userDataError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (userDataError || !userData) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Kullanıcı Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kullanıcı bilgilerini güncelleyin
          </p>
        </div>

        <UserForm user={userData} />
      </div>
    </AppLayout>
  );
}
