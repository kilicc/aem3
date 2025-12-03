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
import { deleteProduct } from "../actions/products";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  unit_price: number;
  description: string | null;
  barcode: string | null;
  created_at: string;
  unit?: {
    id: string;
    name: string;
    symbol: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface ProductsTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
}: ProductsTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteProduct(id);
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
    router.push(`/depo/products?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Ürün adı, açıklama veya barkod ile ara..."
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
              <TableHead>Ürün Adı</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Birim</TableHead>
              <TableHead>Birim Fiyat</TableHead>
              <TableHead>Barkod</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                  Ürün bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>
                    {product.unit ? `${product.unit.name} (${product.unit.symbol})` : "-"}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(product.unit_price)}
                  </TableCell>
                  <TableCell>{product.barcode || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/depo/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
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
              href={`/depo/products?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
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
              href={`/depo/products?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
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
