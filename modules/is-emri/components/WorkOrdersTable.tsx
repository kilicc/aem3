"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";

interface WorkOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  scheduled_date: string | null;
  started_at: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  service?: {
    id: string;
    name: string;
  } | null;
}

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  role: string;
  search?: string;
  status?: string;
}

export default function WorkOrdersTable({
  workOrders,
  currentPage,
  totalPages,
  totalCount,
  role,
  search: initialSearch = "",
  status: initialStatus = "",
}: WorkOrdersTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (initialStatus) {
      params.set("status", initialStatus);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
          <Input
            placeholder="İş emri no veya müşteri adı ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button type="submit" className="shrink-0">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İş Emri No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Öncelik</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>İşe Başlama</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                  İş emri bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((order) => {
                // Duruma göre satır rengi
                const getRowClassName = () => {
                  if (order.status === "pending") {
                    return "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 cursor-pointer transition-colors";
                  } else if (order.status === "in_progress") {
                    return "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 cursor-pointer transition-colors";
                  } else if (order.status === "completed") {
                    return "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 cursor-pointer transition-colors";
                  } else if (order.status === "cancelled") {
                    return "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 cursor-pointer transition-colors";
                  }
                  return "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors";
                };

                return (
                  <TableRow 
                    key={order.id} 
                    className={getRowClassName()}
                    onClick={(e) => {
                      // Butona tıklamayı engelle
                      if ((e.target as HTMLElement).closest('button, a')) {
                        return;
                      }
                      window.location.href = `/is-emri/${order.id}`;
                    }}
                  >
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer?.name || "-"}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer?.phone || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.service?.name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.priority === "urgent"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : order.priority === "high"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {order.priority === "urgent"
                          ? "Acil"
                          : order.priority === "high"
                          ? "Yüksek"
                          : order.priority === "normal"
                          ? "Normal"
                          : "Düşük"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.scheduled_date
                        ? new Date(order.scheduled_date).toLocaleDateString("tr-TR")
                        : new Date(order.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      {order.started_at ? (
                        <div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            Başladı
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.started_at).toLocaleString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          Başlamadı
                        </span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link href={`/is-emri/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Toplam {totalCount} kayıt
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Link
              href={`${pathname}?page=${currentPage - 1}${search ? `&search=${search}` : ""}${initialStatus ? `&status=${initialStatus}` : ""}`}
              className={currentPage === 1 ? "pointer-events-none opacity-50 flex-1 sm:flex-initial" : "flex-1 sm:flex-initial"}
            >
              <Button variant="outline" size="sm" disabled={currentPage === 1} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Önceki</span>
              </Button>
            </Link>
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`${pathname}?page=${currentPage + 1}${search ? `&search=${search}` : ""}${initialStatus ? `&status=${initialStatus}` : ""}`}
              className={currentPage === totalPages ? "pointer-events-none opacity-50 flex-1 sm:flex-initial" : "flex-1 sm:flex-initial"}
            >
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} className="w-full sm:w-auto">
                <span className="hidden sm:inline">Sonraki</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
