"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVehicle, updateVehicle } from "../actions/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VehicleFormProps {
  vehicle?: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
    chassis_number: string | null;
    engine_number: string | null;
    fuel_type: string | null;
    license_plate_date: string | null;
    license_expiry_date: string | null;
    insurance_company: string | null;
    insurance_policy_number: string | null;
    insurance_expiry_date: string | null;
    kasko_company: string | null;
    kasko_policy_number: string | null;
    kasko_start_date: string | null;
    kasko_expiry_date: string | null;
    kasko_premium: number | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    maintenance_interval_days: number;
    mileage: number;
    last_maintenance_mileage: number;
    maintenance_interval_km: number;
    status: string;
    notes: string | null;
  };
}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = vehicle
      ? await updateVehicle(vehicle.id, formData)
      : await createVehicle(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/arac-bakim");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {vehicle ? "Araç Düzenle" : "Yeni Araç Ekle"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="plate_number">Plaka Numarası *</Label>
              <Input
                id="plate_number"
                name="plate_number"
                required
                defaultValue={vehicle?.plate_number || ""}
                placeholder="34 ABC 123"
              />
            </div>

            <div>
              <Label htmlFor="brand">Marka *</Label>
              <Input
                id="brand"
                name="brand"
                required
                defaultValue={vehicle?.brand || ""}
                placeholder="Ford, Mercedes, vb."
              />
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                required
                defaultValue={vehicle?.model || ""}
                placeholder="Transit, Sprinter, vb."
              />
            </div>

            <div>
              <Label htmlFor="year">Üretim Yılı</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                defaultValue={vehicle?.year || ""}
              />
            </div>

            <div>
              <Label htmlFor="color">Renk</Label>
              <Input
                id="color"
                name="color"
                defaultValue={vehicle?.color || ""}
              />
            </div>

            <div>
              <Label htmlFor="fuel_type">Yakıt Tipi</Label>
              <Select
                id="fuel_type"
                name="fuel_type"
                defaultValue={vehicle?.fuel_type || ""}
              >
                <option value="">Seçin</option>
                <option value="benzin">Benzin</option>
                <option value="dizel">Dizel</option>
                <option value="elektrik">Elektrik</option>
                <option value="hibrit">Hibrit</option>
                <option value="lpg">LPG</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="chassis_number">Şasi Numarası</Label>
              <Input
                id="chassis_number"
                name="chassis_number"
                defaultValue={vehicle?.chassis_number || ""}
              />
            </div>

            <div>
              <Label htmlFor="engine_number">Motor Numarası</Label>
              <Input
                id="engine_number"
                name="engine_number"
                defaultValue={vehicle?.engine_number || ""}
              />
            </div>

            <div>
              <Label htmlFor="license_plate_date">Ruhsat Tarihi</Label>
              <Input
                id="license_plate_date"
                name="license_plate_date"
                type="date"
                defaultValue={
                  vehicle?.license_plate_date
                    ? new Date(vehicle.license_plate_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="license_expiry_date">Ruhsat Son Geçerlilik Tarihi</Label>
              <Input
                id="license_expiry_date"
                name="license_expiry_date"
                type="date"
                defaultValue={
                  vehicle?.license_expiry_date
                    ? new Date(vehicle.license_expiry_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="insurance_company">Sigorta Şirketi</Label>
              <Input
                id="insurance_company"
                name="insurance_company"
                defaultValue={vehicle?.insurance_company || ""}
              />
            </div>

            <div>
              <Label htmlFor="insurance_policy_number">Sigorta Poliçe Numarası</Label>
              <Input
                id="insurance_policy_number"
                name="insurance_policy_number"
                defaultValue={vehicle?.insurance_policy_number || ""}
              />
            </div>

            <div>
              <Label htmlFor="insurance_expiry_date">Sigorta Bitiş Tarihi</Label>
              <Input
                id="insurance_expiry_date"
                name="insurance_expiry_date"
                type="date"
                defaultValue={
                  vehicle?.insurance_expiry_date
                    ? new Date(vehicle.insurance_expiry_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Kasko Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="kasko_company">Kasko Şirketi</Label>
              <Input
                id="kasko_company"
                name="kasko_company"
                defaultValue={vehicle?.kasko_company || ""}
                placeholder="Kasko şirketi adı"
              />
            </div>

            <div>
              <Label htmlFor="kasko_policy_number">Kasko Poliçe Numarası</Label>
              <Input
                id="kasko_policy_number"
                name="kasko_policy_number"
                defaultValue={vehicle?.kasko_policy_number || ""}
                placeholder="Kasko poliçe numarası"
              />
            </div>

            <div>
              <Label htmlFor="kasko_start_date">Kasko Başlangıç Tarihi</Label>
              <Input
                id="kasko_start_date"
                name="kasko_start_date"
                type="date"
                defaultValue={
                  vehicle?.kasko_start_date
                    ? new Date(vehicle.kasko_start_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="kasko_expiry_date">Kasko Bitiş Tarihi</Label>
              <Input
                id="kasko_expiry_date"
                name="kasko_expiry_date"
                type="date"
                defaultValue={
                  vehicle?.kasko_expiry_date
                    ? new Date(vehicle.kasko_expiry_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="kasko_premium">Kasko Prim Tutarı (₺)</Label>
              <Input
                id="kasko_premium"
                name="kasko_premium"
                type="number"
                step="0.01"
                min="0"
                defaultValue={vehicle?.kasko_premium || ""}
                placeholder="0.00"
              />
            </div>
          </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="mileage">Kilometre</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                min="0"
                defaultValue={vehicle?.mileage || "0"}
              />
            </div>

            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                id="status"
                name="status"
                defaultValue={vehicle?.status || "active"}
              >
                <option value="active">Aktif</option>
                <option value="maintenance">Bakımda</option>
                <option value="inactive">Pasif</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="last_maintenance_date">Son Bakım Tarihi</Label>
              <Input
                id="last_maintenance_date"
                name="last_maintenance_date"
                type="date"
                defaultValue={
                  vehicle?.last_maintenance_date
                    ? new Date(vehicle.last_maintenance_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="next_maintenance_date">Sonraki Bakım Tarihi</Label>
              <Input
                id="next_maintenance_date"
                name="next_maintenance_date"
                type="date"
                defaultValue={
                  vehicle?.next_maintenance_date
                    ? new Date(vehicle.next_maintenance_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="maintenance_interval_days">Bakım Aralığı (Gün)</Label>
              <Input
                id="maintenance_interval_days"
                name="maintenance_interval_days"
                type="number"
                min="1"
                defaultValue={vehicle?.maintenance_interval_days || "90"}
              />
            </div>

            <div>
              <Label htmlFor="maintenance_interval_km">Bakım Aralığı (KM)</Label>
              <Input
                id="maintenance_interval_km"
                name="maintenance_interval_km"
                type="number"
                min="1"
                defaultValue={vehicle?.maintenance_interval_km || "10000"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Araç hakkında notlar..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={vehicle?.notes || ""}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

