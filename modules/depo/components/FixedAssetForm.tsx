"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFixedAsset, updateFixedAsset } from "../actions/fixed-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Warehouse {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface FixedAssetFormProps {
  fixedAsset?: {
    id: string;
    name: string;
    asset_code: string | null;
    category: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    location: string | null;
    warehouse_id: string | null;
    status: string;
    notes: string | null;
    assigned_to: string | null;
    assigned_at: string | null;
  };
  warehouses: Warehouse[];
  users: User[];
}

export default function FixedAssetForm({
  fixedAsset,
  warehouses,
  users,
}: FixedAssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = fixedAsset
      ? await updateFixedAsset(fixedAsset.id, formData)
      : await createFixedAsset(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/fixed-assets");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {fixedAsset ? "Demirbaş Düzenle" : "Yeni Demirbaş Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Demirbaş Adı *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={fixedAsset?.name || ""}
              />
            </div>

            <div>
              <Label htmlFor="asset_code">Demirbaş Kodu</Label>
              <Input
                id="asset_code"
                name="asset_code"
                defaultValue={fixedAsset?.asset_code || ""}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                name="category"
                placeholder="Örn: Bilgisayar, Mobilya, Makine"
                defaultValue={fixedAsset?.category || ""}
              />
            </div>

            <div>
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={fixedAsset?.brand || ""}
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                defaultValue={fixedAsset?.model || ""}
              />
            </div>

            <div>
              <Label htmlFor="serial_number">Seri Numarası</Label>
              <Input
                id="serial_number"
                name="serial_number"
                defaultValue={fixedAsset?.serial_number || ""}
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Satın Alma Tarihi</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={fixedAsset?.purchase_date || ""}
              />
            </div>

            <div>
              <Label htmlFor="purchase_price">Satın Alma Fiyatı</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={fixedAsset?.purchase_price || ""}
              />
            </div>

            <div>
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                name="location"
                placeholder="Örn: Ofis, Depo, Sahada"
                defaultValue={fixedAsset?.location || ""}
              />
            </div>

            <div>
              <Label htmlFor="warehouse_id">Depo</Label>
              <Select
                id="warehouse_id"
                name="warehouse_id"
                defaultValue={fixedAsset?.warehouse_id || ""}
              >
                <option value="">Depo seçin</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Durum *</Label>
              <Select
                id="status"
                name="status"
                required
                defaultValue={fixedAsset?.status || "active"}
              >
                <option value="active">Aktif</option>
                <option value="maintenance">Bakımda</option>
                <option value="disposed">Elden Çıkarıldı</option>
                <option value="lost">Kayıp</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned_to">Atanan Kişi</Label>
              <Select
                id="assigned_to"
                name="assigned_to"
                defaultValue={fixedAsset?.assigned_to || ""}
              >
                <option value="">Atama yapılmadı</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </Select>
            </div>

            {fixedAsset?.assigned_to && (
              <div>
                <Label htmlFor="assigned_at">Atanma Tarihi</Label>
                <Input
                  id="assigned_at"
                  name="assigned_at"
                  type="datetime-local"
                  defaultValue={
                    fixedAsset?.assigned_at
                      ? new Date(fixedAsset.assigned_at).toISOString().slice(0, 16)
                      : ""
                  }
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={fixedAsset?.notes || ""}
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

