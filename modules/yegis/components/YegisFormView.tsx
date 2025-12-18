"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface YegisFormViewProps {
  form: any;
}

export default function YegisFormView({ form }: YegisFormViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-900 dark:text-white">
            YEGİS Formu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Form No: {form.form_number}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/yegis">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <Link href={`/yegis/${form.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Müşteri Adı</p>
              <p className="font-medium">{form.customer_name}</p>
            </div>
            {form.customer_tax_id && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vergi No</p>
                <p className="font-medium">{form.customer_tax_id}</p>
              </div>
            )}
            {form.customer_tax_office && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vergi Dairesi</p>
                <p className="font-medium">{form.customer_tax_office}</p>
              </div>
            )}
            {form.customer_phone && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="font-medium">{form.customer_phone}</p>
              </div>
            )}
            {form.customer_address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Adres</p>
                <p className="font-medium">{form.customer_address}</p>
              </div>
            )}
            {(form.customer_city || form.customer_district) && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">İl / İlçe</p>
                <p className="font-medium">
                  {form.customer_city}
                  {form.customer_district && ` / ${form.customer_district}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tesis Bilgileri */}
      {form.facility_name && (
        <Card>
          <CardHeader>
            <CardTitle>Tesis Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tesis Adı</p>
                <p className="font-medium">{form.facility_name}</p>
              </div>
              {form.facility_phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tesis Telefonu</p>
                  <p className="font-medium">{form.facility_phone}</p>
                </div>
              )}
              {form.facility_address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tesis Adresi</p>
                  <p className="font-medium">{form.facility_address}</p>
                </div>
              )}
              {(form.facility_city || form.facility_district) && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tesis İl / İlçe</p>
                  <p className="font-medium">
                    {form.facility_city}
                    {form.facility_district && ` / ${form.facility_district}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trafo/OG İşletme Bilgileri */}
      {form.transformer_power && (
        <Card>
          <CardHeader>
            <CardTitle>Trafo/OG İşletme Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trafo Gücü</p>
                <p className="font-medium">{form.transformer_power}</p>
              </div>
              {form.transformer_brand && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Marka</p>
                  <p className="font-medium">{form.transformer_brand}</p>
                </div>
              )}
              {form.transformer_model && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                  <p className="font-medium">{form.transformer_model}</p>
                </div>
              )}
              {form.transformer_serial_number && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Seri No</p>
                  <p className="font-medium">{form.transformer_serial_number}</p>
                </div>
              )}
              {form.transformer_manufacturing_year && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">İmalat Yılı</p>
                  <p className="font-medium">{form.transformer_manufacturing_year}</p>
                </div>
              )}
              {form.transformer_installation_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tesis Tarihi</p>
                  <p className="font-medium">
                    {format(new Date(form.transformer_installation_date), "dd MMMM yyyy", { locale: tr })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kontrol Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Kontrol Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kontrol Tarihi</p>
              <p className="font-medium">
                {format(new Date(form.control_date), "dd MMMM yyyy", { locale: tr })}
              </p>
            </div>
            {form.control_type && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kontrol Tipi</p>
                <p className="font-medium">{form.control_type}</p>
              </div>
            )}
            {form.next_control_date && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sonraki Kontrol Tarihi</p>
                <p className="font-medium">
                  {format(new Date(form.next_control_date), "dd MMMM yyyy", { locale: tr })}
                </p>
              </div>
            )}
            {form.control_interval_months && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kontrol Aralığı</p>
                <p className="font-medium">{form.control_interval_months} Ay</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulgular ve Öneriler */}
      {(form.findings || form.recommendations || form.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Bulgular ve Öneriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {form.findings && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Bulgular</p>
                  <p className="whitespace-pre-wrap">{form.findings}</p>
                </div>
              )}
              {form.recommendations && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Öneriler</p>
                  <p className="whitespace-pre-wrap">{form.recommendations}</p>
                </div>
              )}
              {form.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notlar</p>
                  <p className="whitespace-pre-wrap">{form.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* İmzalar */}
      {(form.technician_signature || form.customer_signature) && (
        <Card>
          <CardHeader>
            <CardTitle>İmzalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {form.technician_signature && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Teknisyen İmzası</p>
                  {form.technician_name && (
                    <p className="text-sm font-medium mb-2">{form.technician_name}</p>
                  )}
                  {form.technician_title && (
                    <p className="text-xs text-gray-500 mb-2">{form.technician_title}</p>
                  )}
                  {form.technician_license_number && (
                    <p className="text-xs text-gray-500 mb-2">Sertifika/Ruhsat No: {form.technician_license_number}</p>
                  )}
                  <img
                    src={form.technician_signature}
                    alt="Teknisyen İmzası"
                    className="border rounded-lg p-2 bg-white mt-2"
                  />
                </div>
              )}
              {form.customer_signature && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Müşteri İmzası</p>
                  {form.customer_representative_name && (
                    <p className="text-sm font-medium mb-2">{form.customer_representative_name}</p>
                  )}
                  {form.customer_representative_title && (
                    <p className="text-xs text-gray-500 mb-2">{form.customer_representative_title}</p>
                  )}
                  <img
                    src={form.customer_signature}
                    alt="Müşteri İmzası"
                    className="border rounded-lg p-2 bg-white mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

