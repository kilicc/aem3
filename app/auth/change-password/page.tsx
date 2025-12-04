import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ChangePasswordForm from "@/modules/auth/components/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Şifre Değiştir
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Hesabınızın şifresini güvenli bir şekilde değiştirebilirsiniz.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </AppLayout>
  );
}

