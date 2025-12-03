import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./Sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Middleware'de zaten auth kontrolü yapılıyor, buraya sadece authenticated user'lar gelir
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware'de zaten kontrol edildiği için buraya gelmezse null dön
  if (!user) {
    return null;
  }

  // Profile'ı güvenli şekilde oku
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Profile yoksa oluşturmaya çalış (hata durumunda default user rolü kullan)
  if (error || !profile) {
    // Profile yoksa oluşturmaya çalış
    if (error?.code === "PGRST116") {
      // Profile bulunamadı, oluştur
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role: "user",
        });

      if (insertError) {
        // Insert hatası varsa default user rolü kullan
        return (
          <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
            <Sidebar role="user" />
            <main className="flex-1 overflow-y-auto bg-transparent w-full lg:w-auto min-h-screen relative z-10 lg:z-auto">
              <div className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</div>
            </main>
          </div>
        );
      }

      // Tekrar oku
      const { data: newProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
          <Sidebar role={(newProfile?.role || "user") as "admin" | "user"} />
          <main className="flex-1 overflow-y-auto bg-transparent w-full lg:w-auto min-h-screen relative z-10 lg:z-auto">
            <div className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</div>
          </main>
        </div>
      );
    } else {
      // Diğer hatalarda default user rolü kullan
      return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
          <Sidebar role="user" />
          <main className="flex-1 overflow-y-auto bg-transparent w-full lg:w-auto min-h-screen relative z-10 lg:z-auto">
            <div className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
      <Sidebar role={profile.role || "user"} />
      <main className="flex-1 overflow-y-auto bg-transparent w-full lg:w-auto min-h-screen relative z-10 lg:z-auto">
        <div className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
