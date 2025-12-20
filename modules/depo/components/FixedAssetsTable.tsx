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
import { Edit, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { deleteFixedAsset } from "../actions/fixed-assets";
import { useRouter } from "next/navigation";

interface FixedAsset {
  id: string;
  name: string;
  asset_code: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  location: string | null;
  status: string;
  assigned_to: string | null;
  assigned_at: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  maintenance_interval_months: number | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  assigned_to_profile?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface FixedAssetsTableProps {
  fixedAssets: FixedAsset[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  status?: string;
}

const statusLabels: Record<string, string> = {
  active: "Aktif",
  maintenance: "Bakımda",
  disposed: "Elden Çıkarıldı",
  lost: "Kayıp",
};

export default function FixedAssetsTable({
  fixedAssets,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
  status: initialStatus = "",
}: FixedAssetsTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu demirbaşı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteFixedAsset(id);
    setDeleting(null);

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
    router.push(`/depo/fixed-assets?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ad, kod, kategori veya seri no ile ara..."
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
          <option value="maintenance">Bakımda</option>
          <option value="disposed">Elden Çıkarıldı</option>
          <option value="lost">Kayıp</option>
        </Select>
        <Button type="submit" className="w-full sm:w-auto">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demirbaş Adı</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Son Bakım</TableHead>
                <TableHead>Sonraki Bakım</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Atanan Kişi</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                    Demirbaş bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                fixedAssets.map((asset) => {
                  const nextMaintenanceDate = asset.next_maintenance_date
                    ? new Date(asset.next_maintenance_date)
                    : null;
                  const isMaintenanceDue = nextMaintenanceDate && nextMaintenanceDate <= new Date();
                  const isMaintenanceDueSoon =
                    nextMaintenanceDate &&
                    nextMaintenanceDate > new Date() &&
                    nextMaintenanceDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.asset_code || "-"}</TableCell>
                      <TableCell>{asset.category || "-"}</TableCell>
                      <TableCell>
                        {asset.last_maintenance_date
                          ? new Date(asset.last_maintenance_date).toLocaleDateString("tr-TR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {asset.next_maintenance_date ? (
                          <span
                            className={
                              isMaintenanceDue
                                ? "text-red-600 font-semibold"
                                : isMaintenanceDueSoon
                                ? "text-orange-600 font-semibold"
                                : ""
                            }
                          >
                            {new Date(asset.next_maintenance_date).toLocaleDateString("tr-TR")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          asset.status === "disposed" ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {statusLabels[asset.status] || asset.status}
                        </span>
                      </TableCell>
                      <TableCell>{asset.assigned_to_profile?.full_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/depo/fixed-assets/${asset.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asset.id)}
                            disabled={deleting === asset.id}
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
                href={`/depo/fixed-assets?page=${currentPage - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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
                href={`/depo/fixed-assets?page=${currentPage + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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

