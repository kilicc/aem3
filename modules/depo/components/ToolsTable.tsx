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
import { deleteTool } from "../actions/tools";
import { useRouter } from "next/navigation";

interface Tool {
  id: string;
  name: string;
  description: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  created_at: string;
}

interface ToolsTableProps {
  tools: Tool[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
}

export default function ToolsTable({
  tools,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
}: ToolsTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu araç-gereci silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteTool(id);
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
    router.push(`/depo/tools?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Araç-gereç adı, açıklama veya seri no ile ara..."
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
              <TableHead>Araç-Gereç Adı</TableHead>
              <TableHead>Seri No</TableHead>
              <TableHead>Alış Tarihi</TableHead>
              <TableHead>Alış Fiyatı</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                  Araç-gereç bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>{tool.serial_number || "-"}</TableCell>
                  <TableCell>
                    {tool.purchase_date
                      ? new Date(tool.purchase_date).toLocaleDateString("tr-TR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {tool.purchase_price
                      ? new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(tool.purchase_price)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/depo/tools/${tool.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tool.id)}
                        disabled={deleting === tool.id}
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
              href={`/depo/tools?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
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
              href={`/depo/tools?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
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
