"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTool, updateTool } from "../actions/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolFormProps {
  tool?: {
    id: string;
    name: string;
    description: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
  };
}

export default function ToolForm({ tool }: ToolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = tool
      ? await updateTool(tool.id, formData)
      : await createTool(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/depo/tools");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tool ? "Araç-Gereç Düzenle" : "Yeni Araç-Gereç Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Araç-Gereç Adı *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={tool?.name || ""}
            />
          </div>

          <div>
            <Label htmlFor="serial_number">Seri No</Label>
            <Input
              id="serial_number"
              name="serial_number"
              defaultValue={tool?.serial_number || ""}
            />
          </div>

          <div>
            <Label htmlFor="purchase_date">Alış Tarihi</Label>
            <Input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={
                tool?.purchase_date
                  ? new Date(tool.purchase_date).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          <div>
            <Label htmlFor="purchase_price">Alış Fiyatı</Label>
            <Input
              id="purchase_price"
              name="purchase_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={tool?.purchase_price?.toString() || ""}
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={tool?.description || ""}
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
