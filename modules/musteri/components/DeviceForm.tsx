"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDevice, updateDevice } from "../actions/devices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeviceFormProps {
  customerId: string;
  device?: {
    id: string;
    device_type: string;
    device_name: string;
    serial_number: string | null;
    model: string | null;
    installation_date: string | null;
    last_service_date: string | null;
    notes: string | null;
  };
}

const deviceTypes = [
  "Trafo",
  "Pano",
  "UPS",
  "Jeneratör",
  "Kondansatör",
  "Motor",
  "Diğer",
];

export default function DeviceForm({ customerId, device }: DeviceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("customer_id", customerId);

    const result = device
      ? await updateDevice(device.id, formData)
      : await createDevice(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/musteri/${customerId}`);
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{device ? "Cihaz Düzenle" : "Yeni Cihaz Oluştur"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="device_type">Cihaz Tipi *</Label>
              <Select
                id="device_type"
                name="device_type"
                required
                defaultValue={device?.device_type || ""}
              >
                <option value="">Cihaz tipi seçin</option>
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="device_name">Cihaz Adı *</Label>
              <Input
                id="device_name"
                name="device_name"
                required
                defaultValue={device?.device_name || ""}
              />
            </div>

            <div>
              <Label htmlFor="serial_number">Seri No</Label>
              <Input
                id="serial_number"
                name="serial_number"
                defaultValue={device?.serial_number || ""}
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                defaultValue={device?.model || ""}
              />
            </div>

            <div>
              <Label htmlFor="installation_date">Kurulum Tarihi</Label>
              <Input
                id="installation_date"
                name="installation_date"
                type="date"
                defaultValue={
                  device?.installation_date
                    ? new Date(device.installation_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="last_service_date">Son Servis Tarihi</Label>
              <Input
                id="last_service_date"
                name="last_service_date"
                type="date"
                defaultValue={
                  device?.last_service_date
                    ? new Date(device.last_service_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={device?.notes || ""}
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
