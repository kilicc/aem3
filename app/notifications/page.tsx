import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import NotificationsList from "@/modules/bildirim/components/NotificationsList";

// Cache için revalidate süresi (10 saniye - bildirimler daha sık güncellenmeli)
export const revalidate = 10;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; unread?: string }> | { page?: string; unread?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedParams = await Promise.resolve(searchParams);
  const unreadOnly = resolvedParams.unread === "true";

  // Tüm bildirimleri çek (gruplama için)
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false });

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data: allNotifications, count, error } = await query;

  if (error) {
    console.error("Bildirim çekme hatası:", error);
  }

  // Bildirimleri related_type'a göre grupla
  const groupedNotifications = (allNotifications || []).reduce((acc, notification) => {
    const groupKey = notification.related_type || "other";
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(notification);
    return acc;
  }, {} as Record<string, typeof allNotifications>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Bildirimler
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Bildirim geçmişi
          </p>
        </div>

        <NotificationsList
          groupedNotifications={groupedNotifications}
          totalCount={count || 0}
          unreadOnly={unreadOnly}
        />
      </div>
    </AppLayout>
  );
}
