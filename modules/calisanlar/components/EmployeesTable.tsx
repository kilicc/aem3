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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { deleteEmployee } from "../actions/employees";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface Employee {
  id: string;
  employee_number: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  is_active: boolean;
  user_id: string | null;
  user?: {
    full_name: string | null;
    email: string;
  };
}

interface EmployeesTableProps {
  employees: Employee[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
}

export default function EmployeesTable({
  employees,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
}: EmployeesTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteEmployee(id);
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
    router.push(`/calisanlar?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ad, soyad, personel no, telefon veya e-posta ile ara..."
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
                <TableHead>Personel No</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Departman</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>İşe Başlama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 dark:text-gray-400">
                    Çalışan bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employee_number || "-"}
                    </TableCell>
                    <TableCell>
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.phone || "-"}</TableCell>
                    <TableCell>{employee.email || "-"}</TableCell>
                    <TableCell>{employee.department || "-"}</TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>
                      {employee.hire_date
                        ? new Date(employee.hire_date).toLocaleDateString("tr-TR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? "default" : "secondary"}>
                        {employee.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.user ? (
                        <span className="text-sm">
                          {employee.user.full_name || employee.user.email}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/calisanlar/${employee.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/calisanlar/${employee.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                          disabled={deleting === employee.id}
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-t">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Toplam {totalCount} çalışan, {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Link
              href={`/calisanlar?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
              className="flex-1 sm:flex-initial"
            >
              <Button variant="outline" size="sm" disabled={currentPage === 1} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Önceki</span>
              </Button>
            </Link>
            <Link
              href={`/calisanlar?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
              className="flex-1 sm:flex-initial"
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
  );
}

