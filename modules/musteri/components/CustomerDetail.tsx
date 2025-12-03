"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
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
  created_at: string;
}

interface Device {
  id: string;
  device_type: string;
  device_name: string;
  serial_number: string | null;
  model: string | null;
  installation_date: string | null;
  last_service_date: string | null;
  created_at: string;
}

interface WorkOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  created_at: string;
  services?: {
    name: string;
  } | null;
}

interface CustomerDetailProps {
  customer: Customer;
  devices: Device[];
  workOrders: WorkOrder[];
}

export default function CustomerDetail({
  customer,
  devices,
  workOrders,
}: CustomerDetailProps) {
  return (
    <div className="space-y-6">
      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Vergi No
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {customer.tax_id || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Vergi Dairesi
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {customer.tax_office || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Telefon
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                E-posta
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {customer.email || "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Adres
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">{customer.address}</p>
              {customer.city && (
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {customer.district && `${customer.district}, `}
                  {customer.city}
                  {customer.postal_code && ` ${customer.postal_code}`}
                </p>
              )}
            </div>
            {customer.notes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notlar
                </p>
                <p className="mt-1 text-gray-900 dark:text-white">{customer.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cihazlar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cihazlar</CardTitle>
            <Link href={`/musteri/${customer.id}/devices/new`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Cihaz
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Henüz cihaz eklenmemiş
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cihaz Tipi</TableHead>
                  <TableHead>Cihaz Adı</TableHead>
                  <TableHead>Seri No</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Kurulum Tarihi</TableHead>
                  <TableHead>Son Servis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.device_type}</TableCell>
                    <TableCell className="font-medium">{device.device_name}</TableCell>
                    <TableCell>{device.serial_number || "-"}</TableCell>
                    <TableCell>{device.model || "-"}</TableCell>
                    <TableCell>
                      {device.installation_date
                        ? new Date(device.installation_date).toLocaleDateString("tr-TR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {device.last_service_date
                        ? new Date(device.last_service_date).toLocaleDateString("tr-TR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* İş Emirleri */}
      <Card>
        <CardHeader>
          <CardTitle>Son İş Emirleri</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Henüz iş emri bulunmuyor
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İş Emri No</TableHead>
                  <TableHead>Hizmet</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Öncelik</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/is-emri/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{order.services?.name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Beklemede"
                          : order.status === "in_progress"
                          ? "İşlemde"
                          : order.status === "completed"
                          ? "Tamamlandı"
                          : "İptal"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.priority === "urgent"
                        ? "Acil"
                        : order.priority === "high"
                        ? "Yüksek"
                        : order.priority === "normal"
                        ? "Normal"
                        : "Düşük"}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
