"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addWorkOrderMaterial } from "../actions/work-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface MaterialFormProps {
  workOrderId: string;
  warehouses: Warehouse[];
  products: Product[];
}

export default function MaterialForm({
  workOrderId,
  warehouses,
  products,
}: MaterialFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  // Seçilen depo ve ürün için stok kontrolü
  useEffect(() => {
    if (selectedWarehouse && selectedProduct) {
      supabase
        .from("warehouse_stock")
        .select("quantity")
        .eq("warehouse_id", selectedWarehouse)
        .eq("product_id", selectedProduct)
        .single()
        .then(({ data }) => {
          setAvailableStock(data?.quantity || 0);
        });
    } else {
      setAvailableStock(null);
    }
  }, [selectedWarehouse, selectedProduct, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("work_order_id", workOrderId);

    const result = await addWorkOrderMaterial(workOrderId, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/is-emri/${workOrderId}`);
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Malzeme Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="warehouse_id">Depo *</Label>
              <Select
                id="warehouse_id"
                name="warehouse_id"
                required
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
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
              <Label htmlFor="product_id">Ürün *</Label>
              <Select
                id="product_id"
                name="product_id"
                required
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Ürün seçin</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Miktar *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue="1"
              />
              {availableStock !== null && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Mevcut stok: {availableStock}
                </p>
              )}
            </div>
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
              {loading ? "Ekleniyor..." : "Ekle"}
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
