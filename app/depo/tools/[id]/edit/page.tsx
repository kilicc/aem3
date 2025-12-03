import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ToolForm from "@/modules/depo/components/ToolForm";

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const toolId = resolvedParams.id;

  if (!toolId) {
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

  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("*")
    .eq("id", toolId)
    .single();

  if (toolError || !tool) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Araç-Gereç Düzenle
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Araç-gereç bilgilerini güncelleyin
          </p>
        </div>

        <ToolForm tool={tool} />
      </div>
    </AppLayout>
  );
}
