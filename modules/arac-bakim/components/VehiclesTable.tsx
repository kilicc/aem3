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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Search } from "lucide-react";
import { deleteVehicle } from "../actions/vehicles";
import { useRouter } from "next/navigation";

interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number | null;
  fuel_type: string | null;
  next_maintenance_date: string | null;
  status: string;
  mileage: number;
  created_at: string;
}

interface VehiclesTableProps {
  vehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  status?: string;
}

export default function VehiclesTable({
  vehicles,
  currentPage,
  totalPages,
  totalCount,
  search: initialSearch = "",
  status: initialStatus = "",
}: VehiclesTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aracı silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeleting(id);
    const result = await deleteVehicle(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  const getMaintenanceStatus = (nextMaintenanceDate: string | null) => {
    if (!nextMaintenanceDate) return { text: "-", variant: "secondary" as const };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(nextMaintenanceDate);
    maintenanceDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} gün geçti`, variant: "destructive" as const };
    } else if (diffDays === 0) {
      return { text: "Bugün", variant: "destructive" as const };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} gün kaldı`, variant: "destructive" as const };
    } else if (diffDays <= 30) {
      return { text: `${diffDays} gün kaldı`, variant: "default" as const };
    } else {
      return { text: `${diffDays} gün kaldı`, variant: "secondary" as const };
    }
  };

  const getStatusBadge = (vehicleStatus: string) => {
    switch (vehicleStatus) {
      case "active":
        return <Badge variant="default">Aktif</Badge>;
      case "maintenance":
        return <Badge variant="secondary">Bakımda</Badge>;
      case "inactive":
        return <Badge variant="outline">Pasif</Badge>;
      default:
        return <Badge variant="outline">{vehicleStatus}</Badge>;
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/arac-bakim?${params.toString()}`);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (newStatus) {
      params.set("status", newStatus);
    }
    params.set("page", "1");
    router.push(`/arac-bakim?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Plaka, marka veya model ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <select
          className="h-11 sm:h-9 rounded-md border border-input bg-background px-3 py-2 sm:py-1 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          title="Durum filtresi"
        >
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="maintenance">Bakımda</option>
          <option value="inactive">Pasif</option>
        </select>
        <Button type="submit" className="w-full sm:w-auto">Ara</Button>
      </form>

      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plaka</TableHead>
              <TableHead>Marka/Model</TableHead>
              <TableHead>Yıl</TableHead>
              <TableHead>Yakıt</TableHead>
              <TableHead>Kilometre</TableHead>
              <TableHead>Sonraki Bakım</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                  Araç bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => {
                const maintenanceStatus = getMaintenanceStatus(vehicle.next_maintenance_date);
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                    <TableCell>
                      {vehicle.brand} {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.year || "-"}</TableCell>
                    <TableCell>
                      {vehicle.fuel_type 
                        ? vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {vehicle.mileage.toLocaleString("tr-TR")} km
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vehicle.next_maintenance_date && (
                          <>
                            {new Date(vehicle.next_maintenance_date).toLocaleDateString("tr-TR")}
                            {maintenanceStatus.variant === "destructive" && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                          </>
                        )}
                        {!vehicle.next_maintenance_date && "-"}
                      </div>
                      {vehicle.next_maintenance_date && (
                        <div className="mt-1">
                          <Badge variant={maintenanceStatus.variant} className="text-xs">
                            {maintenanceStatus.text}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/arac-bakim/${vehicle.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deleting === vehicle.id}
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
              href={`/arac-bakim?page=${currentPage - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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
              href={`/arac-bakim?page=${currentPage + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
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

