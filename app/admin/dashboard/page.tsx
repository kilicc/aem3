import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminDashboardCharts from "@/components/dashboard/AdminDashboardCharts";
import WorkCalendar from "@/components/dashboard/WorkCalendar";
import CustomerMap from "@/components/maps/CustomerMap";
import { TrendingUp, TrendingDown, Users, Package, ClipboardList, Calendar, AlertCircle, CheckCircle2, Clock, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  // Middleware'de auth ve admin kontrolü yapılıyor, buraya sadece admin'ler gelir
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware'de kontrol edildiği için buraya gelmezse null dön
  if (!user) {
    return null;
  }

  // İstatistikleri getir - hata durumlarını handle et
  let workOrders: any[] = [];
  let customers: any[] = [];
  let warehouses: any[] = [];
  let users: any[] = [];
  let customersWithLocation: any[] = [];

  try {
    const [
      workOrdersResult,
      customersResult,
      warehousesResult,
      usersResult,
      customersWithLocationResult,
    ] = await Promise.all([
      supabase.from("work_orders").select(`
        *,
        customer:customers!work_orders_customer_id_fkey(id, name)
      `).order("created_at", { ascending: false }),
      supabase.from("customers").select("*"),
      supabase.from("warehouses").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("customers").select("id, name, address, city, district, latitude, longitude"),
    ]);

    workOrders = workOrdersResult.data || [];
    customers = customersResult.data || [];
    warehouses = warehousesResult.data || [];
    users = usersResult.data || [];
    // Adres bilgisi olan tüm müşterileri gönder (geocoding için)
    // Koordinat bilgisi olanları da dahil et
    customersWithLocation = (customersWithLocationResult.data || []).filter(
      (c: any) => c.address && c.address.trim() !== ""
    );
  } catch (error) {
    // Hata durumunda boş array'ler kullan
    console.error("Dashboard veri çekme hatası:", error);
  }

  const stats = {
    totalWorkOrders: workOrders.length,
    pendingWorkOrders: workOrders.filter((wo) => wo.status === "pending").length,
    inProgressWorkOrders: workOrders.filter((wo) => wo.status === "in_progress").length,
    completedWorkOrders: workOrders.filter((wo) => wo.status === "completed").length,
    totalCustomers: customers.length,
    totalWarehouses: warehouses.length,
    totalUsers: users.length,
  };

  // Son 7 günün iş emri trendi
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      count: workOrders.filter(
        (wo) => wo.created_at.startsWith(dateStr)
      ).length,
    };
  });

  // İş emri durumları (Pie Chart)
  const workOrderStatusData = [
    { name: "Beklemede", value: stats.pendingWorkOrders, color: "#eab308" },
    { name: "İşlemde", value: stats.inProgressWorkOrders, color: "#3b82f6" },
    { name: "Tamamlandı", value: stats.completedWorkOrders, color: "#22c55e" },
  ];


  // Öncelik dağılımı
  const priorityData = [
    { name: "Düşük", value: workOrders.filter((wo) => wo.priority === "low").length },
    { name: "Normal", value: workOrders.filter((wo) => wo.priority === "normal").length },
    { name: "Yüksek", value: workOrders.filter((wo) => wo.priority === "high").length },
    { name: "Acil", value: workOrders.filter((wo) => wo.priority === "urgent").length },
  ];

  // İş takvimi için iş emirlerini düzelt
  const workOrdersForCalendar = (workOrders || []).map((wo: any) => ({
    ...wo,
    customer: Array.isArray(wo.customer) ? wo.customer[0] : wo.customer,
  }));

  // Son iş emirleri (5 adet)
  const recentWorkOrders = workOrdersForCalendar.slice(0, 5);

  // Son bildirimleri getir
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(5);

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Ana İstatistik Kartları */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Toplam İş Emri
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.totalWorkOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

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
                {stats.pendingWorkOrders}
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
                {stats.inProgressWorkOrders}
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
                {stats.completedWorkOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Başarıyla tamamlandı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* İkinci Seviye İstatistikler */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Müşteriler
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.totalCustomers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aktif müşteriler
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Depolar
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.totalWarehouses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aktif depo sayısı
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
                  <Clock className="h-5 w-5 text-red-600" />
                  Son İş Emirleri
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkOrders.length > 0 ? (
                  recentWorkOrders.map((wo: any) => (
                    <div
                      key={wo.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <a
                          href={`/is-emri/${wo.id}`}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          {wo.order_number}
                        </a>
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
                    </div>
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

        {/* Grafikler */}
        <AdminDashboardCharts
          last7Days={last7Days}
          workOrderStatusData={workOrderStatusData}
          priorityData={priorityData}
        />

        {/* Müşteri Haritası */}
        <CustomerMap
          customers={customersWithLocation}
          workOrders={workOrders}
          height="500px"
        />
      </div>
    </AppLayout>
  );
}