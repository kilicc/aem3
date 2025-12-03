import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import VehicleForm from "@/modules/arac-bakim/components/VehicleForm";

export default async function NewVehiclePage() {
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Yeni Araç Ekle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Yeni bir araç kaydı oluşturun
          </p>
        </div>

        <VehicleForm />
      </div>
    </AppLayout>
  );
}

