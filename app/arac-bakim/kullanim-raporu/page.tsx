import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Car } from "lucide-react";
import Link from "next/link";

export default async function VehicleUsageReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; vehicle_id?: string }> | { date?: string; vehicle_id?: string };
}) {
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

  // Yönetici, admin, saha şefi, ofis şefi görebilir
  const allowedRoles = ["yonetici", "admin", "saha_sefi", "ofis_sefi"];
  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    redirect("/dashboard");
  }

  const resolvedParams = await Promise.resolve(searchParams);
  const selectedDate = resolvedParams.date || new Date().toISOString().split("T")[0];
  const selectedVehicleId = resolvedParams.vehicle_id || "";

  // Tarih aralığı (seçilen gün)
  const startDate = new Date(selectedDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  // Araç kullanım loglarını getir
  let query = supabase
    .from("vehicle_usage_logs")
    .select(
      `
      *,
      vehicle:vehicles!vehicle_usage_logs_vehicle_id_fkey(id, plate_number, brand, model),
      work_order:work_orders!vehicle_usage_logs_work_order_id_fkey(
        id,
        order_number,
        customer:customers!work_orders_customer_id_fkey(name),
        assigned_to
      ),
      assigned_by_profile:profiles!vehicle_usage_logs_assigned_by_fkey(full_name)
    `
    )
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())
    .order("start_time", { ascending: false });

  if (selectedVehicleId) {
    query = query.eq("vehicle_id", selectedVehicleId);
  }

  const { data: usageLogs } = await query;

  // Tüm araçları getir (filtre için)
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_number, brand, model")
    .eq("status", "active")
    .order("plate_number", { ascending: true });

  // Araç bazında grupla
  interface VehicleGroup {
    vehicle: any;
    logs: any[];
    totalDistance: number;
  }

  const groupedByVehicle = (usageLogs || []).reduce((acc, log: any) => {
    const vehicleId = log.vehicle_id;
    if (!acc[vehicleId]) {
      acc[vehicleId] = {
        vehicle: Array.isArray(log.vehicle) ? log.vehicle[0] : log.vehicle,
        logs: [],
        totalDistance: 0,
      };
    }
    acc[vehicleId].logs.push(log);
    if (log.end_km && log.start_km) {
      acc[vehicleId].totalDistance += log.end_km - log.start_km;
    }
    return acc;
  }, {} as Record<string, VehicleGroup>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              Araç Kullanım Raporu
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Günlük araç kullanım takibi ve raporlama
            </p>
          </div>
          <Link href="/arac-bakim">
            <Button variant="outline">
              <Car className="mr-2 h-4 w-4" />
              Araç Listesi
            </Button>
          </Link>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="date">Tarih</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={selectedDate}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="vehicle_id">Araç (Tümü)</Label>
                <select
                  id="vehicle_id"
                  name="vehicle_id"
                  defaultValue={selectedVehicleId}
                  title="Araç seçimi"
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Tüm Araçlar</option>
                  {vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_number} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full sm:w-auto">
                  Filtrele
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Rapor */}
        {Object.keys(groupedByVehicle).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
              Seçilen tarihte araç kullanımı bulunmamaktadır.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(Object.entries(groupedByVehicle) as [string, VehicleGroup][]).map(([vehicleId, data]) => {
              const vehicle = Array.isArray(data.vehicle) ? data.vehicle[0] : data.vehicle;
              return (
                <Card key={vehicleId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-600" />
                          {vehicle?.plate_number} - {vehicle?.brand} {vehicle?.model}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {data.logs.length} adet kullanım • Toplam: {data.totalDistance.toLocaleString("tr-TR")} km
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-semibold">İş Emri</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Müşteri</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Başlangıç</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Bitiş</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Başlangıç KM</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Bitiş KM</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Mesafe</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Kullanan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.logs.map((log: any) => {
                            const workOrder = Array.isArray(log.work_order)
                              ? log.work_order[0]
                              : log.work_order;
                            const customer = Array.isArray(workOrder?.customer)
                              ? workOrder?.customer[0]
                              : workOrder?.customer;
                            const assignedBy = Array.isArray(log.assigned_by_profile)
                              ? log.assigned_by_profile[0]
                              : log.assigned_by_profile;
                            const distance = log.end_km && log.start_km ? log.end_km - log.start_km : null;

                            return (
                              <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-4 py-2">
                                  {workOrder?.order_number ? (
                                    <Link
                                      href={`/is-emri/${workOrder.id}`}
                                      className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      {workOrder.order_number}
                                    </Link>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-2">{customer?.name || "-"}</td>
                                <td className="px-4 py-2 text-sm">
                                  {new Date(log.start_time).toLocaleTimeString("tr-TR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {log.end_time
                                    ? new Date(log.end_time).toLocaleTimeString("tr-TR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "-"}
                                </td>
                                <td className="px-4 py-2">
                                  {log.start_km?.toLocaleString("tr-TR") || "-"} km
                                </td>
                                <td className="px-4 py-2">
                                  {log.end_km?.toLocaleString("tr-TR") || "-"} km
                                </td>
                                <td className="px-4 py-2">
                                  {distance !== null ? (
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                      {distance.toLocaleString("tr-TR")} km
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {assignedBy?.full_name || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

