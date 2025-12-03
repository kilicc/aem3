"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService } from "../actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ServiceFormProps {
  service?: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    service_form_template: any;
    is_active: boolean;
  };
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateJson, setTemplateJson] = useState(
    service?.service_form_template
      ? JSON.stringify(service.service_form_template, null, 2)
      : ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (templateJson.trim()) {
      formData.append("service_form_template", templateJson);
    }

    const result = service
      ? await updateService(service.id, formData)
      : await createService(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/services");
      router.refresh();
    }
  };

  const defaultTemplate = {
    fields: [
      { type: "text", label: "Cihaz Markası", name: "device_brand", required: false },
      { type: "text", label: "Cihaz Modeli", name: "device_model", required: false },
      { type: "text", label: "Seri No", name: "serial_number", required: false },
      { type: "textarea", label: "Yapılan İşlemler", name: "work_done", required: true },
      { type: "text", label: "Kullanılan Malzemeler", name: "materials_used", required: false },
      { type: "date", label: "Servis Tarihi", name: "service_date", required: true },
      { type: "text", label: "Servis Teknisyeni", name: "technician", required: false },
    ],
  };

  const handleUseDefaultTemplate = () => {
    setTemplateJson(JSON.stringify(defaultTemplate, null, 2));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {service ? "Hizmet Düzenle" : "Yeni Hizmet Oluştur"}
        </CardTitle>
        <CardDescription>
          Hizmet bilgilerini ve teknik servis formu şablonunu tanımlayın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Hizmet Adı *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={service?.name || ""}
              />
            </div>

            <div>
              <Label htmlFor="price">Fiyat</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={service?.price?.toString() || ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              aria-label="Açıklama"
              placeholder="Hizmet açıklaması"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={service?.description || ""}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="service_form_template">
                Teknik Servis Formu Şablonu (JSON)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseDefaultTemplate}
              >
                Varsayılan Şablonu Kullan
              </Button>
            </div>
            <textarea
              id="service_form_template"
              rows={15}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={templateJson}
              onChange={(e) => setTemplateJson(e.target.value)}
              placeholder='{"fields": [{"type": "text", "label": "Alan Adı", "name": "field_name", "required": true}]}'
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bu şablon, iş emri oluşturulurken kullanılacak teknik servis formunun
              yapısını belirler. JSON formatında olmalıdır.
            </p>
          </div>

          {service && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                value="true"
                aria-label="Aktif"
                defaultChecked={service.is_active}
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
