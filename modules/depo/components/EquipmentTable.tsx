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
import { Edit, Trash2, ChevronLeft, ChevronRight, Search, AlertTriangle } from "lucide-react";
import { deleteEquipment } from "../actions/equipment";
import { useRouter } from "next/navigation";

interface Equipment {
  id: string;
  name: string;
  equipment_code: string | null;
  category: string;
  brand: string | null;
  model: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  min_stock_level: number;
  unit_price: number | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  maintenance_interval_months: number | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
}

interface EquipmentTableProps {
  equipment: Equipment[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  category?: string;
}

const categoryLabels: Record<string, string> = {
  yelek: "Yelek",
  çeket: "Çeket",
  iş_ayakkabısı: "İş Ayakkabısı",
  baret: "Baret",
  eldiven: "Eldiven",
  gözlük: "Gözlük",
  maske: "Maske",
  diğer: "Diğer",
};

export default function EquipmentTable({
  equipment,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
  category: initialCategory = "",
}: EquipmentTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ekipmanı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteEquipment(id);
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
    if (category) {
      params.set("category", category);
    }
    params.set("page", "1");
    router.push(`/depo/equipment?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ad, kod, kategori veya marka ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-auto"
        >
          <option value="">Tüm Kategoriler</option>
          <option value="yelek">Yelek</option>
          <option value="çeket">Çeket</option>
          <option value="iş_ayakkabısı">İş Ayakkabısı</option>
          <option value="baret">Baret</option>
          <option value="eldiven">Eldiven</option>
          <option value="gözlük">Gözlük</option>
          <option value="maske">Maske</option>
          <option value="diğer">Diğer</option>
        </Select>
        <Button type="submit" className="w-full sm:w-auto">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ekipman Adı</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Son Bakım</TableHead>
                <TableHead>Sonraki Bakım</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Depo</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                    Ekipman bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                equipment.map((item) => {
                  const isLowStock = item.quantity <= item.min_stock_level;
                  const nextMaintenanceDate = item.next_maintenance_date
                    ? new Date(item.next_maintenance_date)
                    : null;
                  const isMaintenanceDue = nextMaintenanceDate && nextMaintenanceDate <= new Date();
                  const isMaintenanceDueSoon =
                    nextMaintenanceDate &&
                    nextMaintenanceDate > new Date() &&
                    nextMaintenanceDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.equipment_code || "-"}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.last_maintenance_date
                          ? new Date(item.last_maintenance_date).toLocaleDateString("tr-TR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.next_maintenance_date ? (
                          <span
                            className={
                              isMaintenanceDue
                                ? "text-red-600 font-semibold"
                                : isMaintenanceDueSoon
                                ? "text-orange-600 font-semibold"
                                : ""
                            }
                          >
                            {new Date(item.next_maintenance_date).toLocaleDateString("tr-TR")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={isLowStock ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                            {item.quantity}
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.warehouse?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/depo/equipment/${item.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
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
                href={`/depo/equipment?page=${currentPage - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
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
                href={`/depo/equipment?page=${currentPage + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
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

