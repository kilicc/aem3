"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder, updateWorkOrder } from "../actions/work-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

interface WorkOrderFormProps {
  workOrder?: {
    id: string;
    customer_id: string;
    customer_device_id: string | null;
    service_id: string;
    assigned_to: string[];
    priority: string;
    status: string;
    scheduled_date: string | null;
  };
  customers: Customer[];
  services: Service[];
  users: User[];
}

export default function WorkOrderForm({
  workOrder,
  customers,
  services,
  users,
}: WorkOrderFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    workOrder?.customer_id || ""
  );
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    workOrder?.customer_device_id || ""
  );
  // Tek hizmeti otomatik seç (Arıza Bakım ve Malzeme Sipariş Fişi)
  const [selectedServiceId, setSelectedServiceId] = useState(
    workOrder?.service_id || services[0]?.id || ""
  );
  const [showNewDeviceForm, setShowNewDeviceForm] = useState(false);

  // İlk yüklemede tek hizmeti seç
  useEffect(() => {
    if (!workOrder && services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, workOrder, selectedServiceId]);

  // Müşteri seçildiğinde cihazları getir
  useEffect(() => {
    if (selectedCustomerId) {
      supabase
        .from("customer_devices")
        .select("id, device_type, device_name, serial_number")
        .eq("customer_id", selectedCustomerId)
        .then(({ data }) => {
          setDevices(data || []);
        });
    } else {
      setDevices([]);
    }
    setSelectedDeviceId("");
    setShowNewDeviceForm(false);
  }, [selectedCustomerId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = workOrder
      ? await updateWorkOrder(workOrder.id, formData)
      : await createWorkOrder(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/is-emri");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {workOrder ? "İş Emri Düzenle" : "Yeni İş Emri Oluştur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="customer_id">Müşteri *</Label>
              <Select
                id="customer_id"
                name="customer_id"
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="customer_device_id">Cihaz (Opsiyonel)</Label>
                {selectedCustomerId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewDeviceForm(!showNewDeviceForm)}
                  >
                    {showNewDeviceForm ? "İptal" : "+ Yeni Cihaz"}
                  </Button>
                )}
              </div>
              {showNewDeviceForm ? (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <input type="hidden" name="customer_id_for_device" value={selectedCustomerId} />
                  <div>
                    <Label htmlFor="new_device_type">Cihaz Tipi *</Label>
                    <Select
                      id="new_device_type"
                      name="new_device_type"
                      required
                    >
                      <option value="">Cihaz tipi seçin</option>
                      <option value="Trafo">Trafo</option>
                      <option value="Pano">Pano</option>
                      <option value="UPS">UPS</option>
                      <option value="Jeneratör">Jeneratör</option>
                      <option value="Kondansatör">Kondansatör</option>
                      <option value="Motor">Motor</option>
                      <option value="Diğer">Diğer</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new_device_name">Cihaz Adı *</Label>
                    <Input
                      id="new_device_name"
                      name="new_device_name"
                      required
                      placeholder="Örn: Trafo 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_serial_number">Seri No</Label>
                    <Input
                      id="new_serial_number"
                      name="new_serial_number"
                      placeholder="Opsiyonel"
                    />
                  </div>
                </div>
              ) : (
                <Select
                  id="customer_device_id"
                  name="customer_device_id"
                  disabled={!selectedCustomerId}
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  <option value="">Cihaz seçin</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.device_type} - {device.device_name}
                      {device.serial_number && ` (${device.serial_number})`}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Hizmet otomatik seçili (tek hizmet: Arıza Bakım ve Malzeme Sipariş Fişi) */}
            <input type="hidden" name="service_id" value={selectedServiceId} />
            {services.length > 0 && (
              <div>
                <Label>Hizmet</Label>
                <Input
                  value={services.find(s => s.id === selectedServiceId)?.name || "Arıza Bakım ve Malzeme Sipariş Fişi"}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            )}

            <div>
              <Label htmlFor="priority">Öncelik *</Label>
              <Select
                id="priority"
                name="priority"
                required
                defaultValue={workOrder?.priority || "normal"}
              >
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </Select>
            </div>

            {workOrder && (
              <div>
                <Label htmlFor="status">Durum *</Label>
                <Select
                  id="status"
                  name="status"
                  required
                  defaultValue={workOrder.status}
                >
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="scheduled_date">Planlanan Tarih</Label>
              <Input
                id="scheduled_date"
                name="scheduled_date"
                type="date"
                defaultValue={
                  workOrder?.scheduled_date
                    ? new Date(workOrder.scheduled_date).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div>
              <Label htmlFor="scheduled_time">Planlanan Saat</Label>
              <Input
                id="scheduled_time"
                name="scheduled_time"
                type="time"
                defaultValue={
                  workOrder?.scheduled_date
                    ? new Date(workOrder.scheduled_date).toTimeString().slice(0, 5)
                    : ""
                }
              />
            </div>
          </div>

          <div>
            <Label>Çalışanlar (Çoklu seçim) *</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <input
                    type="checkbox"
                    name="assigned_to"
                    value={user.id}
                    defaultChecked={workOrder?.assigned_to?.includes(user.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {user.full_name || user.email}
                  </span>
                </label>
              ))}
            </div>
            {users.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Sistemde kullanıcı bulunmamaktadır.
              </p>
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
