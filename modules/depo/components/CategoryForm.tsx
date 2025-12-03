"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "../actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/categories");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {category ? "Kategori Düzenle" : "Yeni Kategori Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={category?.name || ""}
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              name="description"
              title="Açıklama"
              rows={4}
              aria-label="Açıklama"
              placeholder="Kategori açıklaması"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={category?.description || ""}
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
