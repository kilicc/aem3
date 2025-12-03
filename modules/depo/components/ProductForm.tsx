"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "../actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    category_id: string | null;
    unit_id: string;
    unit_price: number;
    description: string | null;
    barcode: string | null;
  };
  units: Unit[];
  categories: Category[];
}

export default function ProductForm({
  product,
  units,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/products");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product ? "Ürün Düzenle" : "Yeni Ürün Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product?.name || ""}
            />
          </div>

          <div>
            <Label htmlFor="category_id">Kategori</Label>
            <Select
              id="category_id"
              name="category_id"
              defaultValue={product?.category_id || ""}
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="unit_id">Birim *</Label>
            <Select
              id="unit_id"
              name="unit_id"
              required
              defaultValue={product?.unit_id || ""}
            >
              <option value="">Birim seçin</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="unit_price">Birim Fiyat</Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.unit_price || "0"}
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barkod</Label>
            <Input
              id="barcode"
              name="barcode"
              defaultValue={product?.barcode || ""}
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={product?.description || ""}
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
