"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  MapPin,
  Package,
  Camera,
  FileSignature,
  Printer,
  FileText,
  Pencil,
  Check,
  X,
  Download,
} from "lucide-react";
import {
  updateWorkOrderStatus,
  updateWorkOrderMaterialPrice,
  updateWorkOrderForm,
} from "../actions/work-orders";
import { createClient } from "@/lib/supabase/client";
import WorkOrderMaterialDelete from "./WorkOrderMaterialDelete";
import AddressMap from "@/components/maps/AddressMap";
import TechnicalServiceForm from "@/components/is-emri/TechnicalServiceForm";
import { exportTechnicalServiceFormToExcel } from "@/lib/utils/export";

interface WorkOrderDetailProps {
  workOrder: any;
  assignedUsers: any[];
  materials: any[];
  currentUserId: string;
  userRole: string;
}

export default function WorkOrderDetail({
  workOrder,
  assignedUsers,
  materials,
  currentUserId,
  userRole,
}: WorkOrderDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [technicalFormData, setTechnicalFormData] = useState<any>(workOrder.service_form_data || {});
  const [savingForm, setSavingForm] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`İş emri durumunu "${newStatus}" olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();

    // İşlemde durumuna geçildiğinde konum bilgisi al
    if (newStatus === "in_progress") {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        formData.append("latitude", position.coords.latitude.toString());
        formData.append("longitude", position.coords.longitude.toString());

        // Adres bilgisi için geocoding yapılabilir (basit versiyon)
        formData.append("location_address", "Konum alındı");
      } catch (err) {
        setError("Konum bilgisi alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
        setLoading(false);
        return;
      }
    }

    const result = await updateWorkOrderStatus(workOrder.id, newStatus, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const canChangeStatus =
    userRole === "admin" ||
    (userRole === "user" && workOrder.assigned_to.includes(currentUserId));

  const handlePriceEdit = (material: any) => {
    setEditingPrice(material.id);
    setNewPrice(material.unit_price);
  };

  const handlePriceSave = async (materialId: string) => {
    if (newPrice <= 0) {
      alert("Birim fiyat 0'dan büyük olmalıdır");
      return;
    }

    setLoading(true);
    const result = await updateWorkOrderMaterialPrice(materialId, newPrice);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      setEditingPrice(null);
      router.refresh();
    }
  };

  const handlePriceCancel = () => {
    setEditingPrice(null);
    setNewPrice(0);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {workOrder.order_number}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            İş emri detayları
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === "admin" && (
            <Link href={`/is-emri/${workOrder.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </Link>
          )}
          {canChangeStatus && workOrder.status === "pending" && (
            <Button
              onClick={() => handleStatusChange("in_progress")}
              disabled={loading}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              İşleme Al
            </Button>
          )}
          {canChangeStatus && workOrder.status === "in_progress" && (
            <Button
              onClick={() => handleStatusChange("completed")}
              disabled={loading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Tamamla
            </Button>
          )}
          {userRole === "admin" && workOrder.status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange("cancelled")}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              İptal Et
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Genel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Durum
              </p>
              <span
                className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  workOrder.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : workOrder.status === "in_progress"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : workOrder.status === "cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {workOrder.status === "pending"
                  ? "Beklemede"
                  : workOrder.status === "in_progress"
                  ? "İşlemde"
                  : workOrder.status === "completed"
                  ? "Tamamlandı"
                  : "İptal"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Öncelik
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {workOrder.priority === "urgent"
                  ? "Acil"
                  : workOrder.priority === "high"
                  ? "Yüksek"
                  : workOrder.priority === "normal"
                  ? "Normal"
                  : "Düşük"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Müşteri
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {workOrder.customer?.name || "-"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {workOrder.customer?.phone || ""}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Hizmet
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {workOrder.service?.name || "-"}
              </p>
            </div>
            {workOrder.customer_device && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cihaz
                </p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {workOrder.customer_device.device_type} -{" "}
                  {workOrder.customer_device.device_name}
                </p>
              </div>
            )}
            {workOrder.location_address && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <MapPin className="inline h-4 w-4" /> Konum
                </p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {workOrder.location_address}
                </p>
                {workOrder.location_latitude && workOrder.location_longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${workOrder.location_latitude},${workOrder.location_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Haritada Görüntüle
                  </a>
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Atanan Çalışanlar
              </p>
              <div className="mt-1 space-y-1">
                {assignedUsers.map((user) => (
                  <p key={user.id} className="text-gray-900 dark:text-white">
                    {user.full_name || user.email}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Oluşturma Tarihi
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(workOrder.created_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {workOrder.status === "completed" && userRole === "admin" && (
        <Card>
          <CardContent className="p-6">
            {/* Excel Export Butonu - Tamamlanan işlerde her zaman göster */}
            {workOrder.status === "completed" && workOrder.service?.service_form_template && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const formData = technicalFormData || workOrder.service_form_data || {};
                    const workOrderNumber = workOrder.order_number || workOrder.id;
                    const filename = `Ariza_Bakim_Malzeme_Siparis_Fisi_${workOrderNumber}`;
                    
                    exportTechnicalServiceFormToExcel(formData, workOrderNumber, filename);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel'e Aktar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teknik Servis Formu - Sadece tamamlanan işlerde ve form doldurulmuşsa göster */}
      {workOrder.status === "completed" &&
        workOrder.service?.service_form_template && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Teknik Servis Formu</CardTitle>
                {userRole === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setSavingForm(true);
                      setError(null);
                      
                      const formData = new FormData();
                      formData.append("service_form_data", JSON.stringify(technicalFormData));
                      
                      const result = await updateWorkOrderForm(workOrder.id, formData);
                      
                      if (result.error) {
                        setError(result.error);
                        setSavingForm(false);
                      } else {
                        setSavingForm(false);
                        router.refresh();
                      }
                    }}
                    disabled={savingForm}
                  >
                    {savingForm ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="printable-form">
                <TechnicalServiceForm
                  template={workOrder.service.service_form_template}
                  customer={workOrder.customer}
                  device={workOrder.customer_device}
                  formData={technicalFormData}
                  onChange={setTechnicalFormData}
                  readOnly={userRole !== "admin"}
                  workOrderNumber={workOrder.order_number}
                  assignedUsers={assignedUsers}
                />
              </div>
            </CardContent>
          </Card>
        )}

      {/* İş Açıklaması */}
      {workOrder.work_description && (
        <Card>
          <CardHeader>
            <CardTitle>Yapılan İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workOrder.work_description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Fotoğraflar */}
      {(workOrder.before_photos?.length > 0 ||
        workOrder.after_photos?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Fotoğraflar</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.before_photos?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Öncesi
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workOrder.before_photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Öncesi ${index + 1}`}
                      className="rounded-lg object-cover w-full h-32"
                    />
                  ))}
                </div>
              </div>
            )}
            {workOrder.after_photos?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Sonrası
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workOrder.after_photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Sonrası ${index + 1}`}
                      className="rounded-lg object-cover w-full h-32"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

          {/* İmzalar */}
      {(workOrder.employee_signature || workOrder.customer_signature) && (
        <Card>
          <CardHeader>
            <CardTitle>İmzalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {workOrder.employee_signature && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Çalışan İmzası
                  </h4>
                  <img
                    src={workOrder.employee_signature}
                    alt="Çalışan İmzası"
                    className="border rounded-lg p-2 bg-white"
                  />
                </div>
              )}
              {workOrder.customer_signature && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Müşteri İmzası
                  </h4>
                  <img
                    src={workOrder.customer_signature}
                    alt="Müşteri İmzası"
                    className="border rounded-lg p-2 bg-white"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Müşteri Konumu Haritası */}
      {workOrder.customer && (workOrder.customer.latitude || workOrder.customer.longitude) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Müşteri Konumu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AddressMap
              address={workOrder.customer.address || ""}
              latitude={workOrder.customer.latitude}
              longitude={workOrder.customer.longitude}
              showDirections={true}
              height="400px"
            />
          </CardContent>
        </Card>
      )}

      {/* Çalışma Formu Butonu */}
      {canChangeStatus &&
        workOrder.status !== "completed" &&
        workOrder.status !== "cancelled" && (
          <Card>
            <CardContent className="p-6">
              <Link href={`/is-emri/${workOrder.id}/work`}>
                <Button className="w-full">
                  {workOrder.status === "pending" ? "İşe Başla ve Formu Doldur" : "Çalışma Formunu Doldur"}
                </Button>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {workOrder.status === "pending" 
                  ? "İşe başlayıp, fotoğraf yükleme, malzeme ekleme, iş açıklaması ve dijital imza için"
                  : "Fotoğraf yükleme, malzeme ekleme, iş açıklaması ve dijital imza için"}
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
