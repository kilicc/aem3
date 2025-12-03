"use client";

import { useState } from "react";
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
import { ChevronLeft, ChevronRight, AlertTriangle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stock {
  id: string;
  quantity: number;
  min_stock_level: number;
  last_updated_at: string;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  product?: {
    id: string;
    name: string;
    unit?: {
      name: string;
      symbol: string;
    } | null;
  } | null;
  tool?: {
    id: string;
    name: string;
  } | null;
}

interface StockTableProps {
  stock: Stock[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  warehouse?: string;
}

export default function StockTable({
  stock,
  currentPage,
  totalPages,
  totalCount,
  warehouse: initialWarehouse = "",
}: StockTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (initialWarehouse) {
      params.set("warehouse", initialWarehouse);
    }
    params.set("page", "1");
    router.push(`/depo/stock?${params.toString()}`);
  };

  // Client-side filtreleme (depo filtresi zaten backend'de)
  const filteredStock = stock.filter((item) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    const itemName = item.product
      ? item.product.name
      : item.tool
      ? item.tool.name
      : "";
    const warehouseName = item.warehouse?.name || "";
    return (
      itemName.toLowerCase().includes(lowerSearch) ||
      warehouseName.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ürün, araç-gereç veya depo adı ile ara..."
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
              <TableHead>Depo</TableHead>
              <TableHead>Ürün/Araç-Gereç</TableHead>
              <TableHead>Miktar</TableHead>
              <TableHead>Min. Stok</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son Güncelleme</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                  Stok kaydı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredStock.map((item) => {
                const isLowStock = item.quantity <= item.min_stock_level;
                const itemName = item.product
                  ? item.product.name
                  : item.tool
                  ? item.tool.name
                  : "-";
                const unit = item.product?.unit?.symbol || "";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.warehouse?.name || "-"}
                    </TableCell>
                    <TableCell>{itemName}</TableCell>
                    <TableCell>
                      {item.quantity} {unit}
                    </TableCell>
                    <TableCell>
                      {item.min_stock_level} {unit}
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          Düşük Stok
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Normal
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.last_updated_at).toLocaleDateString("tr-TR")}
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
              href={`/depo/stock?page=${currentPage - 1}${initialWarehouse ? `&warehouse=${initialWarehouse}` : ""}`}
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
              href={`/depo/stock?page=${currentPage + 1}${initialWarehouse ? `&warehouse=${initialWarehouse}` : ""}`}
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
