"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Upload, Printer, Search, Filter } from "lucide-react";
import { exportToExcel, printTable } from "@/lib/utils/export";
import { Select } from "@/components/ui/select";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  printable?: boolean;
  tableId?: string;
  onExport?: (data: T[]) => void;
  onImport?: (file: File) => void;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  filterable = false,
  exportable = true,
  importable = false,
  printable = true,
  tableId = "data-table",
  onExport,
  onImport,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerValue = value.toLowerCase();
    const filtered = data.filter((item) =>
      columns.some((col) => {
        const cellValue = item[col.key as keyof T];
        return cellValue?.toString().toLowerCase().includes(lowerValue);
      })
    );
    setFilteredData(filtered);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredData);
    } else {
      exportToExcel(filteredData, "export");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Ara..."
              className="pl-10"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {importable && (
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleImport}
                    className="hidden"
                  />
                </span>
              </Button>
            </label>
          )}
          {printable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => printTable(tableId)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Yazdır
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-x-auto">
        <Table id={tableId}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key.toString()}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-gray-500 dark:text-gray-400"
                >
                  Veri bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key.toString()}>
                      {column.render
                        ? column.render(item)
                        : item[column.key as keyof T]?.toString() || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
