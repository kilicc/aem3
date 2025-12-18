"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createYegisForm, updateYegisForm } from "../actions/yegis-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignaturePad from "@/components/ui/signature-pad";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id: string;
  name: string;
  tax_id?: string | null;
  tax_office?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
}

interface YegisForm {
  id?: string;
  customer_id: string;
  form_number?: string;
  customer_name: string;
  customer_address?: string;
  customer_city?: string;
  customer_district?: string;
  customer_phone?: string;
  customer_tax_id?: string;
  customer_tax_office?: string;
  facility_name?: string;
  facility_address?: string;
  facility_city?: string;
  facility_district?: string;
  facility_phone?: string;
  transformer_power?: string;
  transformer_brand?: string;
  transformer_model?: string;
  transformer_serial_number?: string;
  transformer_manufacturing_year?: number;
  transformer_installation_date?: string;
  control_date: string;
  control_type?: string;
  next_control_date?: string;
  control_interval_months?: number;
  findings?: string;
  recommendations?: string;
  notes?: string;
  technician_signature?: string;
  technician_name?: string;
  technician_title?: string;
  technician_license_number?: string;
  customer_signature?: string;
  customer_representative_name?: string;
  customer_representative_title?: string;
  status?: string;
}

interface YegisFormComponentProps {
  form?: YegisForm;
  customer?: Customer;
}

export default function YegisFormComponent({ form, customer }: YegisFormComponentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Müşteri bilgileri
  const [customerName, setCustomerName] = useState(form?.customer_name || customer?.name || "");
  const [customerAddress, setCustomerAddress] = useState(form?.customer_address || customer?.address || "");
  const [customerCity, setCustomerCity] = useState(form?.customer_city || customer?.city || "");
  const [customerDistrict, setCustomerDistrict] = useState(form?.customer_district || customer?.district || "");
  const [customerPhone, setCustomerPhone] = useState(form?.customer_phone || customer?.phone || "");
  const [customerTaxId, setCustomerTaxId] = useState(form?.customer_tax_id || customer?.tax_id || "");
  const [customerTaxOffice, setCustomerTaxOffice] = useState(form?.customer_tax_office || customer?.tax_office || "");

  // Tesis bilgileri
  const [facilityName, setFacilityName] = useState(form?.facility_name || "");
  const [facilityAddress, setFacilityAddress] = useState(form?.facility_address || "");
  const [facilityCity, setFacilityCity] = useState(form?.facility_city || "");
  const [facilityDistrict, setFacilityDistrict] = useState(form?.facility_district || "");
  const [facilityPhone, setFacilityPhone] = useState(form?.facility_phone || "");

  // Trafo/OG İşletme bilgileri
  const [transformerPower, setTransformerPower] = useState(form?.transformer_power || "");
  const [transformerBrand, setTransformerBrand] = useState(form?.transformer_brand || "");
  const [transformerModel, setTransformerModel] = useState(form?.transformer_model || "");
  const [transformerSerialNumber, setTransformerSerialNumber] = useState(form?.transformer_serial_number || "");
  const [transformerManufacturingYear, setTransformerManufacturingYear] = useState(form?.transformer_manufacturing_year?.toString() || "");
  const [transformerInstallationDate, setTransformerInstallationDate] = useState(form?.transformer_installation_date || "");

  // Kontrol bilgileri
  const [controlDate, setControlDate] = useState(form?.control_date || new Date().toISOString().split("T")[0]);
  const [controlType, setControlType] = useState(form?.control_type || "");
  const [nextControlDate, setNextControlDate] = useState(form?.next_control_date || "");
  const [controlIntervalMonths, setControlIntervalMonths] = useState(form?.control_interval_months?.toString() || "");

  // Bulgular ve öneriler
  const [findings, setFindings] = useState(form?.findings || "");
  const [recommendations, setRecommendations] = useState(form?.recommendations || "");
  const [notes, setNotes] = useState(form?.notes || "");

  // İmzalar
  const [technicianSignature, setTechnicianSignature] = useState(form?.technician_signature || "");
  const [technicianName, setTechnicianName] = useState(form?.technician_name || "");
  const [technicianTitle, setTechnicianTitle] = useState(form?.technician_title || "");
  const [technicianLicenseNumber, setTechnicianLicenseNumber] = useState(form?.technician_license_number || "");
  const [customerSignature, setCustomerSignature] = useState(form?.customer_signature || "");
  const [customerRepresentativeName, setCustomerRepresentativeName] = useState(form?.customer_representative_name || "");
  const [customerRepresentativeTitle, setCustomerRepresentativeTitle] = useState(form?.customer_representative_title || "");

  const [showTechnicianSignature, setShowTechnicianSignature] = useState(false);
  const [showCustomerSignature, setShowCustomerSignature] = useState(false);

  const submitForm = async (status: string = "draft") => {
    setLoading(true);
    setError(null);

    const formElement = document.querySelector("form") as HTMLFormElement;
    if (!formElement) {
      setError("Form bulunamadı");
      setLoading(false);
      return;
    }

    const formData = new FormData(formElement);
    formData.set("status", status);
    formData.set("customer_id", form?.customer_id || customer?.id || "");

    const result = form?.id
      ? await updateYegisForm(form.id, formData)
      : await createYegisForm(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/yegis");
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm("draft");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="customer_name">Müşteri Adı *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_tax_id">Vergi No</Label>
              <Input
                id="customer_tax_id"
                name="customer_tax_id"
                value={customerTaxId}
                onChange={(e) => setCustomerTaxId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_tax_office">Vergi Dairesi</Label>
              <Input
                id="customer_tax_office"
                name="customer_tax_office"
                value={customerTaxOffice}
                onChange={(e) => setCustomerTaxOffice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="customer_address">Adres</Label>
              <Input
                id="customer_address"
                name="customer_address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_city">İl</Label>
              <Input
                id="customer_city"
                name="customer_city"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_district">İlçe</Label>
              <Input
                id="customer_district"
                name="customer_district"
                value={customerDistrict}
                onChange={(e) => setCustomerDistrict(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tesis Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Tesis Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="facility_name">Tesis Adı</Label>
              <Input
                id="facility_name"
                name="facility_name"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="facility_phone">Tesis Telefonu</Label>
              <Input
                id="facility_phone"
                name="facility_phone"
                value={facilityPhone}
                onChange={(e) => setFacilityPhone(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="facility_address">Tesis Adresi</Label>
              <Input
                id="facility_address"
                name="facility_address"
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="facility_city">Tesis İli</Label>
              <Input
                id="facility_city"
                name="facility_city"
                value={facilityCity}
                onChange={(e) => setFacilityCity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="facility_district">Tesis İlçesi</Label>
              <Input
                id="facility_district"
                name="facility_district"
                value={facilityDistrict}
                onChange={(e) => setFacilityDistrict(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trafo/OG İşletme Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Trafo/OG İşletme Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="transformer_power">Trafo Gücü (örn: 400KVA)</Label>
              <Input
                id="transformer_power"
                name="transformer_power"
                value={transformerPower}
                onChange={(e) => setTransformerPower(e.target.value)}
                placeholder="400KVA"
              />
            </div>
            <div>
              <Label htmlFor="transformer_brand">Marka</Label>
              <Input
                id="transformer_brand"
                name="transformer_brand"
                value={transformerBrand}
                onChange={(e) => setTransformerBrand(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transformer_model">Model</Label>
              <Input
                id="transformer_model"
                name="transformer_model"
                value={transformerModel}
                onChange={(e) => setTransformerModel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transformer_serial_number">Seri No</Label>
              <Input
                id="transformer_serial_number"
                name="transformer_serial_number"
                value={transformerSerialNumber}
                onChange={(e) => setTransformerSerialNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transformer_manufacturing_year">İmalat Yılı</Label>
              <Input
                id="transformer_manufacturing_year"
                name="transformer_manufacturing_year"
                type="number"
                value={transformerManufacturingYear}
                onChange={(e) => setTransformerManufacturingYear(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transformer_installation_date">Tesis Tarihi</Label>
              <Input
                id="transformer_installation_date"
                name="transformer_installation_date"
                type="date"
                value={transformerInstallationDate}
                onChange={(e) => setTransformerInstallationDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kontrol Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Kontrol Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="control_date">Kontrol Tarihi *</Label>
              <Input
                id="control_date"
                name="control_date"
                type="date"
                value={controlDate}
                onChange={(e) => setControlDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="control_type">Kontrol Tipi</Label>
              <Input
                id="control_type"
                name="control_type"
                value={controlType}
                onChange={(e) => setControlType(e.target.value)}
                placeholder="Periyodik, İlk, vb."
              />
            </div>
            <div>
              <Label htmlFor="next_control_date">Sonraki Kontrol Tarihi</Label>
              <Input
                id="next_control_date"
                name="next_control_date"
                type="date"
                value={nextControlDate}
                onChange={(e) => setNextControlDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="control_interval_months">Kontrol Aralığı (Ay)</Label>
              <Input
                id="control_interval_months"
                name="control_interval_months"
                type="number"
                value={controlIntervalMonths}
                onChange={(e) => setControlIntervalMonths(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulgular ve Öneriler */}
      <Card>
        <CardHeader>
          <CardTitle>Bulgular ve Öneriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="findings">Bulgular</Label>
              <Textarea
                id="findings"
                name="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="recommendations">Öneriler</Label>
              <Textarea
                id="recommendations"
                name="recommendations"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teknisyen İmzası */}
      <Card>
        <CardHeader>
          <CardTitle>Teknisyen İmzası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="technician_name">Teknisyen Adı</Label>
                <Input
                  id="technician_name"
                  name="technician_name"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="technician_title">Teknisyen Ünvanı</Label>
                <Input
                  id="technician_title"
                  name="technician_title"
                  value={technicianTitle}
                  onChange={(e) => setTechnicianTitle(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="technician_license_number">Sertifika/Ruhsat No</Label>
                <Input
                  id="technician_license_number"
                  name="technician_license_number"
                  value={technicianLicenseNumber}
                  onChange={(e) => setTechnicianLicenseNumber(e.target.value)}
                />
              </div>
            </div>
            {technicianSignature ? (
              <div className="space-y-4">
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <img
                    src={technicianSignature}
                    alt="Teknisyen İmzası"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTechnicianSignature("");
                    setShowTechnicianSignature(true);
                  }}
                >
                  Yeniden İmzala
                </Button>
              </div>
            ) : showTechnicianSignature ? (
              <SignaturePad
                onSave={(signature) => {
                  setTechnicianSignature(signature);
                  setShowTechnicianSignature(false);
                }}
                onCancel={() => setShowTechnicianSignature(false)}
              />
            ) : (
              <Button
                type="button"
                onClick={() => setShowTechnicianSignature(true)}
                className="w-full"
              >
                İmzala
              </Button>
            )}
            <input type="hidden" name="technician_signature" value={technicianSignature} />
          </div>
        </CardContent>
      </Card>

      {/* Müşteri İmzası */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri İmzası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer_representative_name">Müşteri Temsilcisi Adı</Label>
                <Input
                  id="customer_representative_name"
                  name="customer_representative_name"
                  value={customerRepresentativeName}
                  onChange={(e) => setCustomerRepresentativeName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customer_representative_title">Müşteri Temsilcisi Ünvanı</Label>
                <Input
                  id="customer_representative_title"
                  name="customer_representative_title"
                  value={customerRepresentativeTitle}
                  onChange={(e) => setCustomerRepresentativeTitle(e.target.value)}
                />
              </div>
            </div>
            {customerSignature ? (
              <div className="space-y-4">
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <img
                    src={customerSignature}
                    alt="Müşteri İmzası"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCustomerSignature("");
                    setShowCustomerSignature(true);
                  }}
                >
                  Yeniden İmzala
                </Button>
              </div>
            ) : showCustomerSignature ? (
              <SignaturePad
                onSave={(signature) => {
                  setCustomerSignature(signature);
                  setShowCustomerSignature(false);
                }}
                onCancel={() => setShowCustomerSignature(false)}
              />
            ) : (
              <Button
                type="button"
                onClick={() => setShowCustomerSignature(true)}
                className="w-full"
              >
                İmzala
              </Button>
            )}
            <input type="hidden" name="customer_signature" value={customerSignature} />
          </div>
        </CardContent>
      </Card>

      {/* Kaydet Butonları */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
        </Button>
        <Button
          type="button"
          onClick={() => submitForm("completed")}
          disabled={loading}
          variant="default"
        >
          {loading ? "Kaydediliyor..." : "Kaydet ve Tamamla"}
        </Button>
      </div>
    </form>
  );
}

