import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const employeeId = resolvedParams.id;

  if (!employeeId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select(
      `
      *,
      user:profiles!employees_user_id_fkey(id, full_name, email)
    `
    )
    .eq("id", employeeId)
    .single();

  if (employeeError || !employee) {
    notFound();
  }

  const employeeFixed = {
    ...employee,
    user: Array.isArray(employee.user) ? employee.user[0] : employee.user || null,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
              {employeeFixed.first_name} {employeeFixed.last_name}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Çalışan özlük dosyası detayları
            </p>
          </div>
          <Link href={`/calisanlar/${employeeId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Kişisel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Personel No:
                </span>
                <p className="text-sm">{employeeFixed.employee_number || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  T.C. Kimlik No:
                </span>
                <p className="text-sm">{employeeFixed.tc_identity_number || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Doğum Tarihi:
                </span>
                <p className="text-sm">
                  {employeeFixed.birth_date
                    ? new Date(employeeFixed.birth_date).toLocaleDateString("tr-TR")
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Doğum Yeri:
                </span>
                <p className="text-sm">{employeeFixed.birth_place || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cinsiyet:
                </span>
                <p className="text-sm">
                  {employeeFixed.gender === "erkek"
                    ? "Erkek"
                    : employeeFixed.gender === "kadın"
                    ? "Kadın"
                    : employeeFixed.gender === "belirtmek_istemiyorum"
                    ? "Belirtmek İstemiyorum"
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Medeni Durum:
                </span>
                <p className="text-sm">
                  {employeeFixed.marital_status
                    ? employeeFixed.marital_status.charAt(0).toUpperCase() +
                      employeeFixed.marital_status.slice(1)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Kan Grubu:
                </span>
                <p className="text-sm">{employeeFixed.blood_type || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Telefon:
                </span>
                <p className="text-sm">{employeeFixed.phone || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  E-posta:
                </span>
                <p className="text-sm">{employeeFixed.email || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Adres:
                </span>
                <p className="text-sm">{employeeFixed.address || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Şehir / İlçe:
                </span>
                <p className="text-sm">
                  {employeeFixed.city || "-"}
                  {employeeFixed.district ? ` / ${employeeFixed.district}` : ""}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Posta Kodu:
                </span>
                <p className="text-sm">{employeeFixed.postal_code || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Kullanıcı:
                </span>
                <p className="text-sm">
                  {employeeFixed.user
                    ? `${employeeFixed.user.full_name || employeeFixed.user.email} (${employeeFixed.user.email})`
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* İş Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>İş Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  İşe Başlama:
                </span>
                <p className="text-sm">
                  {employeeFixed.hire_date
                    ? new Date(employeeFixed.hire_date).toLocaleDateString("tr-TR")
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  İşten Ayrılma:
                </span>
                <p className="text-sm">
                  {employeeFixed.termination_date
                    ? new Date(employeeFixed.termination_date).toLocaleDateString("tr-TR")
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Departman:
                </span>
                <p className="text-sm">{employeeFixed.department || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pozisyon:
                </span>
                <p className="text-sm">{employeeFixed.position || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Maaş:
                </span>
                <p className="text-sm">
                  {employeeFixed.salary
                    ? new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(employeeFixed.salary)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Durum:
                </span>
                <p className="text-sm">
                  <Badge variant={employeeFixed.is_active ? "default" : "secondary"}>
                    {employeeFixed.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Diğer Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Diğer Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Banka:
                </span>
                <p className="text-sm">{employeeFixed.bank_name || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hesap No:
                </span>
                <p className="text-sm">{employeeFixed.bank_account_number || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  IBAN:
                </span>
                <p className="text-sm">{employeeFixed.iban || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ehliyet No:
                </span>
                <p className="text-sm">{employeeFixed.driving_license_number || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ehliyet Sınıfı:
                </span>
                <p className="text-sm">{employeeFixed.driving_license_class || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Eğitim:
                </span>
                <p className="text-sm">
                  {employeeFixed.education_level
                    ? employeeFixed.education_level
                        .split("_")
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : "-"}
                  {employeeFixed.school_name ? ` - ${employeeFixed.school_name}` : ""}
                  {employeeFixed.graduation_year ? ` (${employeeFixed.graduation_year})` : ""}
                </p>
              </div>
              {employeeFixed.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Notlar:
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{employeeFixed.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acil Durum İletişim */}
          <Card>
            <CardHeader>
              <CardTitle>Acil Durum İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ad Soyad:
                </span>
                <p className="text-sm">{employeeFixed.emergency_contact_name || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Telefon:
                </span>
                <p className="text-sm">{employeeFixed.emergency_contact_phone || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Yakınlık:
                </span>
                <p className="text-sm">{employeeFixed.emergency_contact_relation || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

