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
import { Edit, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { deleteService } from "../actions/services";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

interface ServicesTableProps {
  services: Service[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
}

export default function ServicesTable({
  services,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
}: ServicesTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteService(id);
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
    params.set("page", "1");
    router.push(`/admin/services?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Hizmet adı veya açıklama ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hizmet Adı</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                  Hizmet bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {service.description || "-"}
                  </TableCell>
                  <TableCell>
                    {service.price
                      ? new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(service.price)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {service.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/services/${service.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        disabled={deleting === service.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
              href={`/admin/services?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
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
              href={`/admin/services?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
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
