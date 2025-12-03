"use client";

import { useState, useMemo } from "react";
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
import { Edit, Trash2, ChevronLeft, ChevronRight, Search, Download, Upload, Printer, Filter, ArrowUpDown } from "lucide-react";
import { deleteUser } from "../actions/users";
import { useRouter } from "next/navigation";
import { exportToCSV } from "@/lib/utils/export";
import * as XLSX from "xlsx";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentUserId: string;
}

export default function UsersTable({
  users,
  currentPage,
  totalPages,
  totalCount,
  currentUserId,
}: UsersTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteUser(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(lowerSearch) ||
          (user.full_name?.toLowerCase().includes(lowerSearch) ?? false) ||
          (user.phone?.toLowerCase().includes(lowerSearch) ?? false)
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sort
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortColumn as keyof User];
        let bVal: any = b[sortColumn as keyof User];

        if (sortColumn === "created_at") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || "";
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, search, roleFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = filteredAndSortedUsers.map((user) => ({
      "Ad Soyad": user.full_name || "",
      "E-posta": user.email,
      "Telefon": user.phone || "",
      "Rol": user.role === "admin" ? "Admin" : "Kullanıcı",
      "Kayıt Tarihi": new Date(user.created_at).toLocaleDateString("tr-TR"),
    }));
    exportToCSV(exportData, `kullanicilar_${new Date().toISOString().split("T")[0]}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        alert(`${jsonData.length} kayıt bulundu. İçe aktarma özelliği yakında eklenecek.`);
      } catch (error) {
        alert("Dosya okunamadı. Lütfen geçerli bir Excel/CSV dosyası seçin.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePrint = () => {
    const printContents = document.getElementById("users-table")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kullanıcılar - Yazdır</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Kullanıcılar Listesi</h1>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Ad, e-posta veya telefon ile ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            title="Rol filtresi"
          >
            <option value="">Tüm Roller</option>
            <option value="yonetici">Yönetici</option>
            <option value="ofis_sefi">Ofis Şefi</option>
            <option value="ofis_personeli">Ofis Personeli</option>
            <option value="saha_sefi">Saha Şefi</option>
            <option value="saha_personeli">Saha Personeli</option>
            <option value="depo_sorunlusu">Depo Sorunlusu</option>
            <option value="muhasebe_personeli">Muhasebe Personeli</option>
            <option value="admin">Admin</option>
            <option value="user">Kullanıcı</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                İçe Aktar
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table id="users-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("full_name")}
                >
                  Ad Soyad
                  {sortColumn === "full_name" && (
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("email")}
                >
                  E-posta
                  {sortColumn === "email" && (
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("role")}
                >
                  Rol
                  {sortColumn === "role" && (
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort("created_at")}
                >
                  Kayıt Tarihi
                  {sortColumn === "created_at" && (
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                  Kullanıcı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "-"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Kullanıcı"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {user.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleting === user.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Toplam {totalCount} kayıt {filteredAndSortedUsers.length !== users.length && `(${filteredAndSortedUsers.length} filtrelenmiş)`}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Link
              href={`/admin/users?page=${currentPage - 1}`}
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
              href={`/admin/users?page=${currentPage + 1}`}
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
  );
}
