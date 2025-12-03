"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Warehouse {
  id: string;
  name: string;
}

interface StockFilterProps {
  warehouses: Warehouse[];
}

export default function StockFilter({ warehouses }: StockFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get("warehouse") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("warehouse", e.target.value);
    } else {
      params.delete("warehouse");
    }
    params.delete("page"); // Filtre değişince ilk sayfaya dön
    router.push(`/depo/stock?${params.toString()}`);
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
      <Label htmlFor="warehouse_filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Depo Filtresi:
      </Label>
      <Select
        id="warehouse_filter"
        value={warehouseId}
        onChange={handleChange}
        className="mt-2"
      >
        <option value="">Tüm Depolar</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </Select>
    </div>
  );
}

