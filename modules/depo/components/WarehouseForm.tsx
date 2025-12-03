"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouse, updateWarehouse } from "../actions/warehouses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

interface WarehouseFormProps {
  warehouse?: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    manager_id: string | null;
    is_active: boolean;
  };
  users: User[];
}

export default function WarehouseForm({ warehouse, users }: WarehouseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = warehouse
      ? await updateWarehouse(warehouse.id, formData)
      : await createWarehouse(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/warehouses");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {warehouse ? "Depo Düzenle" : "Yeni Depo Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Depo Adı *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={warehouse?.name || ""}
            />
          </div>

          <div>
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              name="address"
              defaultValue={warehouse?.address || ""}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={warehouse?.phone || ""}
            />
          </div>

          <div>
            <Label htmlFor="manager_id">Yönetici</Label>
            <Select
              id="manager_id"
              name="manager_id"
              defaultValue={warehouse?.manager_id || ""}
            >
              <option value="">Yönetici seçin</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </Select>
          </div>

          {warehouse && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                value="true"
                defaultChecked={warehouse.is_active}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          )}

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
