"use client";

import { useState } from "react";
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
import { Select } from "@/components/ui/select";
import { Edit, Trash2, ChevronLeft, ChevronRight, Search, RefreshCw, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { deletePeriodicDistribution, renewPeriodicDistribution } from "../actions/periodic-products";
import { useRouter } from "next/navigation";

interface PeriodicDistribution {
  id: string;
  equipment_id: string;
  employee_id: string;
  distribution_date: string;
  quantity: number;
  period_months: number;
  next_renewal_date: string | null;
  notes: string | null;
  status: string;
  equipment?: {
    id: string;
    name: string;
    category: string;
  } | null;
  employee?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  tracking?: {
    id: string;
    status: string;
    days_until_renewal: number | null;
    next_renewal_date: string;
  } | null;
}

interface PeriodicProductsTableProps {
  distributions: PeriodicDistribution[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  status?: string;
}

const statusLabels: Record<string, string> = {
  active: "Aktif",
  due_soon: "Yakında Yenilenecek",
  overdue: "Süresi Doldu",
  renewed: "Yenilendi",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  due_soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  renewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const statusIcons: Record<string, any> = {
  active: CheckCircle,
  due_soon: Clock,
  overdue: AlertTriangle,
  renewed: RefreshCw,
};

export default function PeriodicProductsTable({
  distributions,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
  status: initialStatus = "",
}: PeriodicProductsTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu dağıtımı silmek istediğinizden emin misiniz? Stok geri eklenecektir.")) {
      return;
    }

    setDeleting(id);
    const result = await deletePeriodicDistribution(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  const handleRenew = async (id: string) => {
    if (!confirm("Bu dağıtımı yenilemek istediğinizden emin misiniz?")) {
      return;
    }

    setRenewing(id);
    const result = await renewPeriodicDistribution(id);
    setRenewing(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/depo/periodic-products?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ekipman veya çalışan adı ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-auto"
        >
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="due_soon">Yakında Yenilenecek</option>
          <option value="overdue">Süresi Doldu</option>
        </Select>
        <Button type="submit" className="w-full sm:w-auto">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ekipman</TableHead>
                <TableHead>Çalışan</TableHead>
                <TableHead>Dağıtım Tarihi</TableHead>
                <TableHead>Yenileme Tarihi</TableHead>
                <TableHead>Periyot</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                    Dağıtım bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                distributions.map((dist) => {
                  const StatusIcon = statusIcons[dist.status] || Clock;
                  const daysUntil = dist.tracking?.days_until_renewal ?? null;
                  
                  return (
                    <TableRow key={dist.id}>
                      <TableCell className="font-medium">
                        {dist.equipment?.name || "-"}
                      </TableCell>
                      <TableCell>{dist.employee?.full_name || "-"}</TableCell>
                      <TableCell>
                        {new Date(dist.distribution_date).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        {dist.next_renewal_date
                          ? new Date(dist.next_renewal_date).toLocaleDateString("tr-TR")
                          : "-"}
                      </TableCell>
                      <TableCell>{dist.period_months} ay</TableCell>
                      <TableCell>{dist.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${
                            dist.status === "overdue" ? "text-red-600" :
                            dist.status === "due_soon" ? "text-yellow-600" :
                            dist.status === "active" ? "text-green-600" :
                            "text-blue-600"
                          }`} />
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[dist.status] || statusColors.active}`}>
                            {statusLabels[dist.status] || dist.status}
                          </span>
                          {daysUntil !== null && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({daysUntil > 0 ? `${daysUntil} gün` : `${Math.abs(daysUntil)} gün geçti`})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(dist.status === "overdue" || dist.status === "due_soon") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRenew(dist.id)}
                              disabled={renewing === dist.id}
                              title="Yenile"
                            >
                              <RefreshCw className={`h-4 w-4 ${renewing === dist.id ? "animate-spin" : ""}`} />
                            </Button>
                          )}
                          <Link href={`/depo/periodic-products/${dist.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dist.id)}
                            disabled={deleting === dist.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
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
                href={`/depo/periodic-products?page=${currentPage - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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
                href={`/depo/periodic-products?page=${currentPage + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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

