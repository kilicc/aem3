"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee } from "../actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

interface EmployeeFormProps {
  employee?: {
    id: string;
    user_id: string | null;
    employee_number: string | null;
    first_name: string;
    last_name: string;
    tc_identity_number: string | null;
    birth_date: string | null;
    birth_place: string | null;
    gender: string | null;
    marital_status: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    postal_code: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
    hire_date: string | null;
    termination_date: string | null;
    department: string | null;
    position: string | null;
    salary: number | null;
    bank_name: string | null;
    bank_account_number: string | null;
    iban: string | null;
    blood_type: string | null;
    driving_license_number: string | null;
    driving_license_class: string | null;
    education_level: string | null;
    school_name: string | null;
    graduation_year: number | null;
    notes: string | null;
    is_active: boolean;
  };
  users?: Array<{ id: string; full_name: string | null; email: string }>;
}

export default function EmployeeForm({ employee, users = [] }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(employee?.user_id || "");
  const [gender, setGender] = useState<string>(employee?.gender || "");
  const [maritalStatus, setMaritalStatus] = useState<string>(employee?.marital_status || "");
  const [bloodType, setBloodType] = useState<string>(employee?.blood_type || "");
  const [educationLevel, setEducationLevel] = useState<string>(employee?.education_level || "");
  const [isActive, setIsActive] = useState<boolean>(employee?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("user_id", userId);
    formData.append("gender", gender);
    formData.append("marital_status", maritalStatus);
    formData.append("blood_type", bloodType);
    formData.append("education_level", educationLevel);
    formData.append("is_active", isActive.toString());

    const result = employee
      ? await updateEmployee(employee.id, formData)
      : await createEmployee(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/calisanlar");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {employee ? "Çalışan Düzenle" : "Yeni Çalışan Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kullanıcı Seçimi */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kullanıcı Bilgileri</h3>
            <div>
              <Label htmlFor="user_id">Kullanıcı (Opsiyonel)</Label>
              <Select
                id="user_id"
                name="user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Kullanıcı seçilmedi</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.email})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kişisel Bilgiler</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="employee_number">Personel No</Label>
                <Input
                  id="employee_number"
                  name="employee_number"
                  defaultValue={employee?.employee_number || ""}
                />
              </div>

              <div>
                <Label htmlFor="tc_identity_number">T.C. Kimlik No</Label>
                <Input
                  id="tc_identity_number"
                  name="tc_identity_number"
                  maxLength={11}
                  defaultValue={employee?.tc_identity_number || ""}
                />
              </div>

              <div>
                <Label htmlFor="first_name">Ad *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={employee?.first_name || ""}
                />
              </div>

              <div>
                <Label htmlFor="last_name">Soyad *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  defaultValue={employee?.last_name || ""}
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={employee?.birth_date || ""}
                />
              </div>

              <div>
                <Label htmlFor="birth_place">Doğum Yeri</Label>
                <Input
                  id="birth_place"
                  name="birth_place"
                  defaultValue={employee?.birth_place || ""}
                />
              </div>

              <div>
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Belirtilmemiş</option>
                  <option value="erkek">Erkek</option>
                  <option value="kadın">Kadın</option>
                  <option value="belirtmek_istemiyorum">Belirtmek İstemiyorum</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="marital_status">Medeni Durum</Label>
                <Select
                  id="marital_status"
                  name="marital_status"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                >
                  <option value="">Belirtilmemiş</option>
                  <option value="bekar">Bekar</option>
                  <option value="evli">Evli</option>
                  <option value="boşanmış">Boşanmış</option>
                  <option value="dul">Dul</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="blood_type">Kan Grubu</Label>
                <Select
                  id="blood_type"
                  name="blood_type"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="">Belirtilmemiş</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="0+">0+</option>
                  <option value="0-">0-</option>
                </Select>
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={employee?.phone || ""}
                />
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={employee?.email || ""}
                />
              </div>

              <div>
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={employee?.city || ""}
                />
              </div>

              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  name="district"
                  defaultValue={employee?.district || ""}
                />
              </div>

              <div>
                <Label htmlFor="postal_code">Posta Kodu</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  defaultValue={employee?.postal_code || ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <textarea
                id="address"
                name="address"
                title="Adres"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={employee?.address || ""}
              />
            </div>
          </div>

          {/* Acil Durum İletişim */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Acil Durum İletişim</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="emergency_contact_name">Ad Soyad</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  defaultValue={employee?.emergency_contact_name || ""}
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">Telefon</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  defaultValue={employee?.emergency_contact_phone || ""}
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact_relation">Yakınlık</Label>
                <Input
                  id="emergency_contact_relation"
                  name="emergency_contact_relation"
                  defaultValue={employee?.emergency_contact_relation || ""}
                />
              </div>
            </div>
          </div>

          {/* İş Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İş Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="hire_date">İşe Başlama Tarihi</Label>
                <Input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  defaultValue={employee?.hire_date || ""}
                />
              </div>

              <div>
                <Label htmlFor="termination_date">İşten Ayrılma Tarihi</Label>
                <Input
                  id="termination_date"
                  name="termination_date"
                  type="date"
                  defaultValue={employee?.termination_date || ""}
                />
              </div>

              <div>
                <Label htmlFor="department">Departman</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={employee?.department || ""}
                />
              </div>

              <div>
                <Label htmlFor="position">Pozisyon/Ünvan</Label>
                <Input
                  id="position"
                  name="position"
                  defaultValue={employee?.position || ""}
                />
              </div>

              <div>
                <Label htmlFor="salary">Maaş</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  step="0.01"
                  defaultValue={employee?.salary || ""}
                />
              </div>

              <div>
                <Label htmlFor="is_active">Durum</Label>
                <Select
                  id="is_active"
                  name="is_active"
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Banka Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banka Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="bank_name">Banka Adı</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  defaultValue={employee?.bank_name || ""}
                />
              </div>

              <div>
                <Label htmlFor="bank_account_number">Hesap No</Label>
                <Input
                  id="bank_account_number"
                  name="bank_account_number"
                  defaultValue={employee?.bank_account_number || ""}
                />
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  defaultValue={employee?.iban || ""}
                />
              </div>
            </div>
          </div>

          {/* Ehliyet Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ehliyet Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="driving_license_number">Ehliyet No</Label>
                <Input
                  id="driving_license_number"
                  name="driving_license_number"
                  defaultValue={employee?.driving_license_number || ""}
                />
              </div>

              <div>
                <Label htmlFor="driving_license_class">Ehliyet Sınıfı</Label>
                <Input
                  id="driving_license_class"
                  name="driving_license_class"
                  defaultValue={employee?.driving_license_class || ""}
                />
              </div>
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Eğitim Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="education_level">Eğitim Seviyesi</Label>
                <Select
                  id="education_level"
                  name="education_level"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                >
                  <option value="">Belirtilmemiş</option>
                  <option value="ilkokul">İlkokul</option>
                  <option value="ortaokul">Ortaokul</option>
                  <option value="lise">Lise</option>
                  <option value="üniversite">Üniversite</option>
                  <option value="yüksek_lisans">Yüksek Lisans</option>
                  <option value="doktora">Doktora</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="school_name">Okul Adı</Label>
                <Input
                  id="school_name"
                  name="school_name"
                  defaultValue={employee?.school_name || ""}
                />
              </div>

              <div>
                <Label htmlFor="graduation_year">Mezuniyet Yılı</Label>
                <Input
                  id="graduation_year"
                  name="graduation_year"
                  type="number"
                  min="1900"
                  max="2100"
                  defaultValue={employee?.graduation_year || ""}
                />
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              name="notes"
              title="Notlar"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={employee?.notes || ""}
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

