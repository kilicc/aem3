"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStock } from "../actions/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface Tool {
  id: string;
  name: string;
}

interface StockFormProps {
  warehouses: Warehouse[];
  products: Product[];
  tools: Tool[];
}

export default function StockForm({
  warehouses,
  products,
  tools,
}: StockFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"product" | "tool">("product");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await updateStock(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/stock");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok Ekle/Güncelle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="warehouse_id">Depo *</Label>
            <Select id="warehouse_id" name="warehouse_id" required>
              <option value="">Depo seçin</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Stok Tipi *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="item_type"
                  value="product"
                  checked={itemType === "product"}
                  onChange={(e) => setItemType(e.target.value as "product" | "tool")}
                />
                Ürün/Malzeme
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="item_type"
                  value="tool"
                  checked={itemType === "tool"}
                  onChange={(e) => setItemType(e.target.value as "product" | "tool")}
                />
                Araç-Gereç
              </label>
            </div>
          </div>

          {itemType === "product" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="product_id">Ürün *</Label>
                <Select id="product_id" name="product_id" required>
                  <option value="">Ürün seçin</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
                <input type="hidden" name="tool_id" value="" />
              </div>
              <div>
                <Label htmlFor="quantity">Miktar *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  defaultValue="0"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="tool_id">Araç-Gereç *</Label>
                <Select id="tool_id" name="tool_id" required>
                  <option value="">Araç-gereç seçin</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </Select>
                <input type="hidden" name="product_id" value="" />
              </div>
              <div>
                <Label htmlFor="quantity">Miktar *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  defaultValue="0"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="min_stock_level">Minimum Stok Seviyesi</Label>
            <Input
              id="min_stock_level"
              name="min_stock_level"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
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
