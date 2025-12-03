"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMaintenanceRecord } from "../actions/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface MaintenanceRecordFormProps {
  vehicleId: string;
}

export default function MaintenanceRecordForm({ vehicleId }: MaintenanceRecordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("vehicle_id", vehicleId);

    const result = await addMaintenanceRecord(vehicleId, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setShowForm(false);
      router.refresh();
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Bakım Kaydı Ekle
      </Button>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold">Yeni Bakım Kaydı</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="maintenance_date">Bakım Tarihi *</Label>
            <Input
              id="maintenance_date"
              name="maintenance_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <Label htmlFor="maintenance_type">Bakım Tipi *</Label>
            <Select id="maintenance_type" name="maintenance_type" required>
              <option value="">Seçin</option>
              <option value="Periyodik Bakım">Periyodik Bakım</option>
              <option value="Onarım">Onarım</option>
              <option value="Yedek Parça">Yedek Parça</option>
              <option value="Lastik Değişimi">Lastik Değişimi</option>
              <option value="Yağ Değişimi">Yağ Değişimi</option>
              <option value="Filtre Değişimi">Filtre Değişimi</option>
              <option value="Diğer">Diğer</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="mileage">Kilometre</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="cost">Maliyet (₺)</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="service_provider">Servis Sağlayıcı</Label>
            <Input
              id="service_provider"
              name="service_provider"
            />
          </div>

          <div>
            <Label htmlFor="invoice_number">Fatura Numarası</Label>
            <Input
              id="invoice_number"
              name="invoice_number"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Bakım hakkında açıklama..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            onClick={() => {
              setShowForm(false);
              setError(null);
            }}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}

