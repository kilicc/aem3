"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "../actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserFormProps {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
  };
}

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = user
      ? await updateUser(user.id, formData)
      : await createUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/users");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {user ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue=""
                />
              </div>

              <div>
                <Label htmlFor="password">Şifre *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {user && (
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                E-posta adresi değiştirilemez
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={user?.full_name || ""}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user?.phone || ""}
              />
            </div>

            <div>
              <Label htmlFor="role">Rol *</Label>
              <Select
                id="role"
                name="role"
                required
                defaultValue={user?.role || "user"}
              >
                <option value="user">Kullanıcı</option>
                <option value="yonetici">Yönetici</option>
                <option value="ofis_sefi">Ofis Şefi</option>
                <option value="ofis_personeli">Ofis Personeli</option>
                <option value="saha_sefi">Saha Şefi</option>
                <option value="saha_personeli">Saha Personeli</option>
                <option value="depo_sorunlusu">Depo Sorunlusu</option>
                <option value="muhasebe_personeli">Muhasebe Personeli</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            {user && (
              <div>
                <Label htmlFor="password">Yeni Şifre (Opsiyonel)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                />
              </div>
            )}
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
