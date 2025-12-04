import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Clock, CheckCircle2, AlertCircle, FileText, Calendar as CalendarIcon, Bell } from "lucide-react";

// WorkCalendar'ı lazy load et
const WorkCalendar = dynamic(() => import("@/components/dashboard/WorkCalendar"), {
  loading: () => <div className="h-64 flex items-center justify-center">Yükleniyor...</div>,
});

// Cache için revalidate süresi (60 saniye)
export const revalidate = 60;

export default async function DashboardPage() {
  // Middleware'de auth kontrolü yapılıyor, buraya sadece user'lar gelir
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware'de kontrol edildiği için buraya gelmezse null dön
  if (!user) {
    return null;
  }

  // Normal user için devam et
  // Kullanıcının iş emirlerini getir - sadece gerekli alanlar
  const { data: workOrders } = await supabase
    .from("work_orders")
    .select(`
      id,
      order_number,
      status,
      created_at,
      customer:customers!work_orders_customer_id_fkey(id, name)
    `)
    .contains("assigned_to", [user.id])
    .order("created_at", { ascending: false });

  // İş takvimi için iş emirlerini düzelt
  const workOrdersForCalendar = (workOrders || []).map((wo: any) => ({
    ...wo,
    customer: Array.isArray(wo.customer) ? wo.customer[0] : wo.customer,
  }));

  const recentWorkOrders = workOrdersForCalendar.slice(0, 5);

  const pendingCount = workOrders?.filter((wo) => wo.status === "pending").length || 0;
  const inProgressCount = workOrders?.filter((wo) => wo.status === "in_progress").length || 0;
  const completedCount = workOrders?.filter((wo) => wo.status === "completed").length || 0;

  // Son bildirimleri getir - sadece gerekli alanlar
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("id, title, message, is_read, sent_at")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(5);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Hoş geldiniz, iş emirlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Beklemede
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {pendingCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Onay bekliyor
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  İşlemde
                </CardTitle>
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {inProgressCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Devam eden işler
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tamamlanan
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {completedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Başarıyla tamamlandı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* İş Takvimi, Son İş Emirleri ve Bildirimler */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <WorkCalendar workOrders={workOrdersForCalendar} />
          </div>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Son İş Emirleri
                </CardTitle>
                <Link href="/dashboard/work-orders">
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkOrders.length > 0 ? (
                  recentWorkOrders.map((wo: any) => (
                    <Link
                      key={wo.id}
                      href={`/is-emri/${wo.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-semibold text-red-600">
                          {wo.order_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            wo.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : wo.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {wo.status === "pending"
                            ? "Beklemede"
                            : wo.status === "in_progress"
                            ? "İşlemde"
                            : "Tamamlandı"}
                        </span>
                      </div>
                      {wo.customer && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {wo.customer.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(wo.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Henüz iş emri bulunmamaktadır.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Bildirimler
                </CardTitle>
                <Link href="/notifications">
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications && recentNotifications.length > 0 ? (
                  recentNotifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(notification.sent_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Henüz bildirim bulunmamaktadır.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
