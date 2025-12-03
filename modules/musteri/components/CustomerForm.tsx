"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer } from "../actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerFormProps {
  customer?: {
    id: string;
    name: string;
    tax_id: string | null;
    tax_office: string | null;
    email: string | null;
    phone: string;
    address: string;
    city: string | null;
    district: string | null;
    postal_code: string | null;
    notes: string | null;
  };
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = customer
      ? await updateCustomer(customer.id, formData)
      : await createCustomer(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/musteri");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {customer ? "Müşteri Düzenle" : "Yeni Müşteri Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Müşteri Adı *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={customer?.name || ""}
              />
            </div>

            <div>
              <Label htmlFor="tax_id">Vergi No</Label>
              <Input
                id="tax_id"
                name="tax_id"
                defaultValue={customer?.tax_id || ""}
              />
            </div>

            <div>
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                name="tax_office"
                defaultValue={customer?.tax_office || ""}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={customer?.phone || ""}
              />
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email || ""}
              />
            </div>

            <div>
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                name="city"
                defaultValue={customer?.city || ""}
              />
            </div>

            <div>
              <Label htmlFor="district">İlçe</Label>
              <Input
                id="district"
                name="district"
                defaultValue={customer?.district || ""}
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Posta Kodu</Label>
              <Input
                id="postal_code"
                name="postal_code"
                defaultValue={customer?.postal_code || ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adres *</Label>
            <textarea
              id="address"
              name="address"
              rows={3}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={customer?.address || ""}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={customer?.notes || ""}
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
