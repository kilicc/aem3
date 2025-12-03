"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Printer, Search, Filter, ArrowUpDown } from "lucide-react";
import { exportToCSV } from "@/lib/utils/export";
import * as XLSX from "xlsx";

interface TableToolbarProps {
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  printable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onExport?: (data: any[]) => void;
  onImport?: (file: File) => void;
  exportData?: any[];
  exportFilename?: string;
  tableId?: string;
  filters?: Array<{
    key: string;
    label: string;
    type: "select" | "date" | "text";
    options?: Array<{ value: string; label: string }>;
  }>;
  sortColumns?: Array<{ key: string; label: string }>;
}

export default function TableToolbar({
  searchable = true,
  filterable = false,
  sortable = false,
  exportable = true,
  importable = false,
  printable = true,
  searchPlaceholder = "Ara...",
  onSearch,
  onFilter,
  onSort,
  onExport,
  onImport,
  exportData = [],
  exportFilename = "export",
  tableId = "data-table",
  filters = [],
  sortColumns = [],
}: TableToolbarProps) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    if (onSort) {
      onSort(column, newDirection);
    }
  };

  const handleExport = () => {
    if (onExport && exportData.length > 0) {
      onExport(exportData);
    } else if (exportData.length > 0) {
      exportToCSV(exportData, exportFilename);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById(tableId)?.innerHTML;
    if (!printContents) return;

    const originalContents = document.body.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Yazdır</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}

          {filterable && filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          )}

          {sortable && sortColumns.length > 0 && (
            <div className="relative">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={sortColumn}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="">Sırala...</option>
                {sortColumns.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label}
                  </option>
                ))}
              </select>
              {sortColumn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-9 w-9"
                  onClick={() => handleSort(sortColumn)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          )}
          {importable && (
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
          )}
          {printable && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Yazdır
            </Button>
          )}
        </div>
      </div>

      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {filters.map((filter) => (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">
                {filter.label}
              </label>
              {filter.type === "select" && filter.options ? (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">Tümü</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === "date" ? (
                <Input
                  type="date"
                  className="h-9"
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              ) : (
                <Input
                  className="h-9"
                  placeholder={filter.label}
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

