"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPeriodicDistribution, updatePeriodicDistribution } from "../actions/periodic-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface PeriodicProductFormProps {
  distribution?: {
    id: string;
    equipment_id: string;
    employee_id: string;
    distribution_date: string;
    quantity: number;
    period_months: number;
    notes: string | null;
  };
  equipment: Equipment[];
  employees: Employee[];
}

export default function PeriodicProductForm({
  distribution,
  equipment,
  employees,
}: PeriodicProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    distribution?.equipment_id || ""
  );

  const selectedEquipment = equipment.find((eq) => eq.id === selectedEquipmentId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = distribution
      ? await updatePeriodicDistribution(distribution.id, formData)
      : await createPeriodicDistribution(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/periodic-products");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {distribution ? "Periyodik Ürün Dağıtımı Düzenle" : "Yeni Periyodik Ürün Dağıtımı"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment_id">Ekipman *</Label>
              <Select
                id="equipment_id"
                name="equipment_id"
                required
                value={selectedEquipmentId}
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
              >
                <option value="">Ekipman seçin</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} {eq.category ? `(${eq.category})` : ""} - Stok: {eq.quantity}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="employee_id">Çalışan *</Label>
              <Select
                id="employee_id"
                name="employee_id"
                required
                defaultValue={distribution?.employee_id || ""}
              >
                <option value="">Çalışan seçin</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="distribution_date">Dağıtım Tarihi *</Label>
              <Input
                id="distribution_date"
                name="distribution_date"
                type="date"
                required
                defaultValue={
                  distribution?.distribution_date
                    ? new Date(distribution.distribution_date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
              />
            </div>

            <div>
              <Label htmlFor="quantity">Miktar *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                defaultValue={distribution?.quantity || "1"}
                max={selectedEquipment?.quantity || undefined}
              />
              {selectedEquipment && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mevcut stok: {selectedEquipment.quantity}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="period_months">Periyot (Ay) *</Label>
              <Input
                id="period_months"
                name="period_months"
                type="number"
                min="1"
                required
                defaultValue={distribution?.period_months || "12"}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Yenileme periyodu (örn: 12 ay)
              </p>
            </div>

            {distribution && (
              <div>
                <Label>Yenileme Tarihi</Label>
                <Input
                  type="text"
                  disabled
                  value={
                    distribution
                      ? (() => {
                          const distDate = new Date(distribution.distribution_date);
                          distDate.setMonth(distDate.getMonth() + distribution.period_months);
                          return distDate.toLocaleDateString("tr-TR");
                        })()
                      : ""
                  }
                  className="bg-gray-50 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Otomatik hesaplanır
                </p>
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
              defaultValue={distribution?.notes || ""}
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

