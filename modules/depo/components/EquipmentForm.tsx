"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEquipment, updateEquipment } from "../actions/equipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Warehouse {
  id: string;
  name: string;
}

interface EquipmentFormProps {
  equipment?: {
    id: string;
    name: string;
    equipment_code: string | null;
    category: string;
    brand: string | null;
    model: string | null;
    size: string | null;
    color: string | null;
    warehouse_id: string;
    quantity: number;
    min_stock_level: number;
    unit_price: number | null;
    purchase_date: string | null;
    notes: string | null;
  };
  warehouses: Warehouse[];
}

export default function EquipmentForm({
  equipment,
  warehouses,
}: EquipmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = equipment
      ? await updateEquipment(equipment.id, formData)
      : await createEquipment(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/equipment");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {equipment ? "Ekipman Düzenle" : "Yeni Ekipman Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Ekipman Adı *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={equipment?.name || ""}
              />
            </div>

            <div>
              <Label htmlFor="equipment_code">Ekipman Kodu</Label>
              <Input
                id="equipment_code"
                name="equipment_code"
                defaultValue={equipment?.equipment_code || ""}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select
                id="category"
                name="category"
                required
                defaultValue={equipment?.category || ""}
              >
                <option value="">Kategori seçin</option>
                <option value="yelek">Yelek</option>
                <option value="çeket">Çeket</option>
                <option value="iş_ayakkabısı">İş Ayakkabısı</option>
                <option value="baret">Baret</option>
                <option value="eldiven">Eldiven</option>
                <option value="gözlük">Gözlük</option>
                <option value="maske">Maske</option>
                <option value="diğer">Diğer</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="warehouse_id">Depo *</Label>
              <Select
                id="warehouse_id"
                name="warehouse_id"
                required
                defaultValue={equipment?.warehouse_id || ""}
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
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={equipment?.brand || ""}
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                defaultValue={equipment?.model || ""}
              />
            </div>

            <div>
              <Label htmlFor="size">Beden/Boyut</Label>
              <Input
                id="size"
                name="size"
                placeholder="Örn: S, M, L, XL, 42, 43"
                defaultValue={equipment?.size || ""}
              />
            </div>

            <div>
              <Label htmlFor="color">Renk</Label>
              <Input
                id="color"
                name="color"
                defaultValue={equipment?.color || ""}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Stok Miktarı *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                defaultValue={equipment?.quantity || "0"}
              />
            </div>

            <div>
              <Label htmlFor="min_stock_level">Minimum Stok Seviyesi</Label>
              <Input
                id="min_stock_level"
                name="min_stock_level"
                type="number"
                min="0"
                defaultValue={equipment?.min_stock_level || "0"}
              />
            </div>

            <div>
              <Label htmlFor="unit_price">Birim Fiyat</Label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={equipment?.unit_price || ""}
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Satın Alma Tarihi</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={equipment?.purchase_date || ""}
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
              defaultValue={equipment?.notes || ""}
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

