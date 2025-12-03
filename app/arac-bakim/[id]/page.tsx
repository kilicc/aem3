import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMaintenanceRecord } from "@/modules/arac-bakim/actions/vehicles";
import MaintenanceRecordForm from "@/modules/arac-bakim/components/MaintenanceRecordForm";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedParams = await Promise.resolve(params);
  const vehicleId = resolvedParams.id;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (!vehicle) {
    notFound();
  }

  // Bakım geçmişini getir
  const { data: maintenanceHistory } = await supabase
    .from("vehicle_maintenance_history")
    .select(
      `
      *,
      performed_by_profile:profiles!vehicle_maintenance_history_performed_by_fkey(full_name)
    `
    )
    .eq("vehicle_id", vehicleId)
    .order("maintenance_date", { ascending: false });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            Araç Detayı - {vehicle.plate_number}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Araç bilgilerini düzenleyin ve bakım geçmişini görüntüleyin
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Araç Bilgileri</CardTitle>
              <Link href={`/arac-bakim/${vehicleId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-gray-500">Plaka Numarası</Label>
                <p className="text-lg font-semibold">{vehicle.plate_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Marka/Model</Label>
                <p className="text-lg">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Üretim Yılı</Label>
                <p>{vehicle.year || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Yakıt Tipi</Label>
                <p>{vehicle.fuel_type ? vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1) : "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Kilometre</Label>
                <p>{vehicle.mileage.toLocaleString("tr-TR")} km</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Durum</Label>
                <p>{vehicle.status === "active" ? "Aktif" : vehicle.status === "maintenance" ? "Bakımda" : "Pasif"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Son Bakım Tarihi</Label>
                <p>{vehicle.last_maintenance_date ? new Date(vehicle.last_maintenance_date).toLocaleDateString("tr-TR") : "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Sonraki Bakım Tarihi</Label>
                <p className={vehicle.next_maintenance_date && new Date(vehicle.next_maintenance_date) <= new Date() ? "text-red-600 font-semibold" : ""}>
                  {vehicle.next_maintenance_date ? new Date(vehicle.next_maintenance_date).toLocaleDateString("tr-TR") : "-"}
                </p>
              </div>
            </div>

            {vehicle.kasko_company && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Kasko Bilgileri</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kasko Şirketi</Label>
                    <p>{vehicle.kasko_company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kasko Poliçe Numarası</Label>
                    <p>{vehicle.kasko_policy_number || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kasko Başlangıç Tarihi</Label>
                    <p>{vehicle.kasko_start_date ? new Date(vehicle.kasko_start_date).toLocaleDateString("tr-TR") : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kasko Bitiş Tarihi</Label>
                    <p className={vehicle.kasko_expiry_date && new Date(vehicle.kasko_expiry_date) <= new Date() ? "text-red-600 font-semibold" : ""}>
                      {vehicle.kasko_expiry_date ? new Date(vehicle.kasko_expiry_date).toLocaleDateString("tr-TR") : "-"}
                    </p>
                  </div>
                  {vehicle.kasko_premium && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kasko Prim Tutarı</Label>
                      <p>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(vehicle.kasko_premium)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {vehicle.notes && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Notlar</Label>
                <p className="mt-1">{vehicle.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bakım Geçmişi</CardTitle>
              <MaintenanceRecordForm vehicleId={vehicleId} />
            </div>
          </CardHeader>
          <CardContent>
            {maintenanceHistory && maintenanceHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Bakım Tipi</TableHead>
                      <TableHead>Kilometre</TableHead>
                      <TableHead>Maliyet</TableHead>
                      <TableHead>Servis</TableHead>
                      <TableHead>Yapan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.maintenance_date).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>{record.maintenance_type}</TableCell>
                        <TableCell>
                          {record.mileage ? `${record.mileage.toLocaleString("tr-TR")} km` : "-"}
                        </TableCell>
                        <TableCell>
                          {record.cost
                            ? new Intl.NumberFormat("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              }).format(record.cost)
                            : "-"}
                        </TableCell>
                        <TableCell>{record.service_provider || "-"}</TableCell>
                        <TableCell>
                          {record.performed_by_profile?.full_name || "-"}
                        </TableCell>
                        <TableCell>
                          <form
                            action={async () => {
                              "use server";
                              await deleteMaintenanceRecord(record.id);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Henüz bakım kaydı bulunmamaktadır
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

