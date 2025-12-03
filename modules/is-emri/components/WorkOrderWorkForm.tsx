"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import FileUpload from "@/components/ui/file-upload";
import SignaturePad from "@/components/ui/signature-pad";
import TechnicalServiceForm from "@/components/is-emri/TechnicalServiceForm";
import { PlayCircle } from "lucide-react";
import {
  updateWorkOrderForm,
  updateWorkOrderStatus,
} from "../actions/work-orders";
import { createClient } from "@/lib/supabase/client";

interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  mileage: number;
  status: string;
}

interface WorkOrderWorkFormProps {
  workOrder: any;
  currentUserId: string;
  assignedUsers?: Array<{ id: string; full_name: string }>;
  vehicles?: Vehicle[];
}

export default function WorkOrderWorkForm({
  workOrder,
  currentUserId,
  assignedUsers = [],
  vehicles = [],
}: WorkOrderWorkFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workDescription, setWorkDescription] = useState(
    workOrder.work_description || ""
  );
  const [beforePhotos, setBeforePhotos] = useState<string[]>(
    workOrder.before_photos || []
  );
  const [afterPhotos, setAfterPhotos] = useState<string[]>(
    workOrder.after_photos || []
  );
  const [employeeSignature, setEmployeeSignature] = useState<string | null>(
    workOrder.employee_signature
  );
  const [customerSignature, setCustomerSignature] = useState<string | null>(
    workOrder.customer_signature
  );
  const [customerName, setCustomerName] = useState<string>(
    workOrder.service_form_data?.customer_name || workOrder.customer?.name || ""
  );
  const [showEmployeeSignature, setShowEmployeeSignature] = useState(false);
  const [showCustomerSignature, setShowCustomerSignature] = useState(false);
  const [technicalFormData, setTechnicalFormData] = useState<any>(workOrder.service_form_data || {});
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    workOrder.vehicle_id || ""
  );
  const [vehicleStartKm, setVehicleStartKm] = useState<number | null>(
    workOrder.vehicle_start_km || null
  );
  const [vehicleEndKm, setVehicleEndKm] = useState<number | null>(
    workOrder.vehicle_end_km || null
  );

  // Seçilen aracın mevcut kilometresini al
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle && !vehicleStartKm) {
        setVehicleStartKm(vehicle.mileage);
      }
    }
  }, [selectedVehicleId, vehicles, vehicleStartKm]);

  const handleStartWork = async () => {
    // Araç seçimi kontrolü
    if (!selectedVehicleId) {
      setError("Lütfen işe çıkacağınız aracı seçin.");
      return;
    }

    if (!vehicleStartKm || vehicleStartKm < 0) {
      setError("Lütfen araç başlangıç kilometresini girin.");
      return;
    }

    if (!confirm("İşe başlamak istediğinize emin misiniz? Başlangıç saati ve araç bilgileri kaydedilecektir.")) {
      return;
    }

    setLoading(true);
    setError(null);

    // Başlangıç saatini al (HH:MM formatında)
    const now = new Date();
    const startTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    // Technical form data'yı güncelle
    const updatedFormData = {
      ...technicalFormData,
      start_time: startTime,
    };
    setTechnicalFormData(updatedFormData);

    // Konum bilgisi al
    const formData = new FormData();
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      formData.append("latitude", position.coords.latitude.toString());
      formData.append("longitude", position.coords.longitude.toString());
      formData.append("location_address", "Konum alındı");
    } catch (err) {
      setError("Konum bilgisi alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
      setLoading(false);
      return;
    }

    // Araç bilgilerini ekle
    formData.append("vehicle_id", selectedVehicleId);
    formData.append("vehicle_start_km", vehicleStartKm.toString());
    formData.append("vehicle_assigned_by", currentUserId);

    // Önce form verilerini kaydet (başlangıç saati ile)
    const formDataForSave = new FormData();
    formDataForSave.append("service_form_data", JSON.stringify(updatedFormData));
    await updateWorkOrderForm(workOrder.id, formDataForSave);

    // Sonra durumu güncelle (araç bilgileri ile)
    const result = await updateWorkOrderStatus(workOrder.id, "in_progress", formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // customer_name'i service_form_data içine ekle
    const updatedTechnicalFormData = {
      ...technicalFormData,
      customer_name: customerName,
    };

    const formData = new FormData();
    formData.append("work_description", workDescription);
    formData.append("service_form_data", JSON.stringify(updatedTechnicalFormData));
    beforePhotos.forEach((photo) => {
      formData.append("before_photos", photo);
    });
    afterPhotos.forEach((photo) => {
      formData.append("after_photos", photo);
    });
    if (employeeSignature) {
      formData.append("employee_signature", employeeSignature);
    }
    if (customerSignature) {
      formData.append("customer_signature", customerSignature);
    }

    const result = await updateWorkOrderForm(workOrder.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/is-emri/${workOrder.id}`);
      router.refresh();
    }
  };

  const handleComplete = async () => {
    // Araç bitiş kilometresi kontrolü
    if (selectedVehicleId && (!vehicleEndKm || vehicleEndKm < (vehicleStartKm || 0))) {
      setError("Lütfen geçerli bir bitiş kilometresi girin. Bitiş kilometresi başlangıç kilometresinden küçük olamaz.");
      return;
    }

    if (!confirm("İşi tamamlamak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    setLoading(true);
    setError(null);

    // Bitiş saatini al (HH:MM formatında)
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    // Technical form data'yı güncelle (bitiş saati ve customer_name ile)
    const updatedFormData = {
      ...technicalFormData,
      end_time: endTime,
      customer_name: customerName,
    };
    setTechnicalFormData(updatedFormData);

    // Önce form verilerini kaydet (bitiş saati ile)
    const formData = new FormData();
    formData.append("work_description", workDescription);
    formData.append("service_form_data", JSON.stringify(updatedFormData));
    
    // Araç bitiş kilometresini ekle
    if (selectedVehicleId && vehicleEndKm) {
      formData.append("vehicle_end_km", vehicleEndKm.toString());
    }
    beforePhotos.forEach((photo) => {
      formData.append("before_photos", photo);
    });
    afterPhotos.forEach((photo) => {
      formData.append("after_photos", photo);
    });
    if (employeeSignature) {
      formData.append("employee_signature", employeeSignature);
    }
    if (customerSignature) {
      formData.append("customer_signature", customerSignature);
    }

    await updateWorkOrderForm(workOrder.id, formData);

    // Sonra durumu güncelle (araç bilgileri ile)
    const statusResult = await updateWorkOrderStatus(
      workOrder.id,
      "completed",
      formData
    );

    if (statusResult.error) {
      setError(statusResult.error);
      setLoading(false);
    } else {
      router.push(`/is-emri/${workOrder.id}`);
      router.refresh();
    }
  };


  return (
    <div className="space-y-6 pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            İş Emri Çalışma Formu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {workOrder.order_number} - {workOrder.customer?.name || "-"}
          </p>
        </div>
        <Link href={`/is-emri/${workOrder.id}`}>
          <Button variant="outline">Geri Dön</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Araç Seçimi ve Kilometre Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Araç Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vehicle">İşe Çıkılacak Araç *</Label>
            <Select
              id="vehicle"
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                const vehicle = vehicles.find((v) => v.id === e.target.value);
                if (vehicle) {
                  setVehicleStartKm(vehicle.mileage);
                }
              }}
              disabled={workOrder.status === "completed" || workOrder.status === "cancelled"}
              className="mt-1"
            >
              <option value="">Araç Seçiniz</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate_number} - {vehicle.brand} {vehicle.model} ({vehicle.mileage.toLocaleString("tr-TR")} km)
                </option>
              ))}
            </Select>
          </div>

          {selectedVehicleId && (
            <>
              <div>
                <Label htmlFor="vehicle_start_km">Başlangıç Kilometresi (km) *</Label>
                <Input
                  id="vehicle_start_km"
                  type="number"
                  min="0"
                  value={vehicleStartKm || ""}
                  onChange={(e) => setVehicleStartKm(parseInt(e.target.value) || null)}
                  disabled={workOrder.status === "completed" || workOrder.status === "cancelled" || workOrder.vehicle_start_km}
                  className="mt-1"
                  placeholder="Araç kilometresi"
                />
                {workOrder.vehicle_start_km && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Kaydedilmiş: {workOrder.vehicle_start_km.toLocaleString("tr-TR")} km
                  </p>
                )}
              </div>

              {(workOrder.status === "in_progress" || workOrder.status === "completed") && (
                <div>
                  <Label htmlFor="vehicle_end_km">Bitiş Kilometresi (km) {workOrder.status === "in_progress" ? "*" : ""}</Label>
                  <Input
                    id="vehicle_end_km"
                    type="number"
                    min={vehicleStartKm || 0}
                    value={vehicleEndKm || ""}
                    onChange={(e) => setVehicleEndKm(parseInt(e.target.value) || null)}
                    disabled={workOrder.status === "completed" && !!workOrder.vehicle_end_km}
                    className="mt-1"
                    placeholder="İş bitiş kilometresi"
                  />
                  {workOrder.vehicle_end_km && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Kaydedilmiş: {workOrder.vehicle_end_km.toLocaleString("tr-TR")} km
                      {vehicleStartKm && workOrder.vehicle_end_km && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          (Kullanım: {(workOrder.vehicle_end_km - vehicleStartKm).toLocaleString("tr-TR")} km)
                        </span>
                      )}
                    </p>
                  )}
                  {vehicleStartKm && vehicleEndKm && vehicleEndKm > vehicleStartKm && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Toplam kullanım: {(vehicleEndKm - vehicleStartKm).toLocaleString("tr-TR")} km
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* İşe Başla Butonu (Pending durumunda) */}
      {workOrder.status === "pending" && (
        <Card>
          <CardContent className="p-6">
            <Button onClick={handleStartWork} disabled={loading || !selectedVehicleId || !vehicleStartKm} className="w-full" size="lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              {loading ? "Başlatılıyor..." : "İşe Başla"}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              İşe başladığınızda konumunuz otomatik olarak kaydedilecek, başlangıç saati belirlenecek ve araç bilgileri kaydedilecektir.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teknik Servis Formu */}
      {workOrder.service?.service_form_template && (
        <TechnicalServiceForm
          template={workOrder.service.service_form_template}
          customer={workOrder.customer}
          device={workOrder.customer_device}
          formData={technicalFormData}
          onChange={setTechnicalFormData}
          workOrderNumber={workOrder.order_number}
          assignedUsers={assignedUsers}
        />
      )}

      {/* Yapılan İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle>Yapılan İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder="Yapılan işlemleri detaylı bir şekilde açıklayın..."
          />
        </CardContent>
      </Card>

      {/* Öncesi Fotoğrafları */}
      <Card>
        <CardHeader>
          <CardTitle>Öncesi Fotoğrafları</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            bucket="work-order-photos"
            folder={`${workOrder.id}/before`}
            accept="image/*"
            multiple={true}
            maxSize={5}
            currentFiles={beforePhotos}
            onUploadComplete={(urls) => setBeforePhotos(urls)}
            onError={(err) => setError(err)}
          />
        </CardContent>
      </Card>

      {/* Sonrası Fotoğrafları */}
      <Card>
        <CardHeader>
          <CardTitle>Sonrası Fotoğrafları</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            bucket="work-order-photos"
            folder={`${workOrder.id}/after`}
            accept="image/*"
            multiple={true}
            maxSize={5}
            currentFiles={afterPhotos}
            onUploadComplete={(urls) => setAfterPhotos(urls)}
            onError={(err) => setError(err)}
          />
        </CardContent>
      </Card>


      {/* İmzalar */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Çalışan İmzası */}
        <Card>
          <CardHeader>
            <CardTitle>Çalışan İmzası</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* AEM Kaşesi */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                    AEM AKGÜN ELEKTRİK VE MÜHENDİSLİK LTD. ŞTİ.
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-500">
                    Resmi Kaşe
                  </div>
                </div>
              </div>
              
              {employeeSignature ? (
                <div className="space-y-4">
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white relative">
                    <img
                      src={employeeSignature}
                      alt="Çalışan İmzası"
                      className="w-full h-auto"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmployeeSignature(null);
                      setShowEmployeeSignature(true);
                    }}
                  >
                    Yeniden İmzala
                  </Button>
                </div>
              ) : showEmployeeSignature ? (
                <SignaturePad
                  onSave={(signature) => {
                    setEmployeeSignature(signature);
                    setShowEmployeeSignature(false);
                  }}
                  onCancel={() => setShowEmployeeSignature(false)}
                />
              ) : (
                <Button onClick={() => setShowEmployeeSignature(true)} className="w-full">
                  İmzala
                </Button>
              )}
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
              {/* Müşteri Ad Soyad Alanı */}
              <div>
                <Label htmlFor="customer_name">Müşteri Ad Soyad</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Müşteri adı ve soyadı"
                  className="mt-1"
                />
              </div>

              {/* İmza Alanı */}
              {customerSignature ? (
                <div className="space-y-4">
                  <img
                    src={customerSignature}
                    alt="Müşteri İmzası"
                    className="border rounded-lg p-2 bg-white"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomerSignature(null);
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
                <Button onClick={() => setShowCustomerSignature(true)} className="w-full">
                  İmzala
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kaydet ve Tamamla Butonları */}
      <div className="flex gap-2 mb-0 pb-0 last:mb-0">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button onClick={handleComplete} disabled={loading} variant="default">
          {loading ? "Tamamlanıyor..." : "Kaydet ve Tamamla"}
        </Button>
      </div>
    </div>
  );
}
