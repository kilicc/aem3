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
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { returnTool } from "../actions/tools";
import { useRouter } from "next/navigation";

interface Assignment {
  id: string;
  status: string;
  assigned_at: string;
  returned_at: string | null;
  notes: string | null;
  tool?: {
    id: string;
    name: string;
    serial_number: string | null;
  } | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  assigned_to_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  assigned_by_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

interface ToolAssignmentsTableProps {
  assignments: Assignment[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  status: string;
}

export default function ToolAssignmentsTable({
  assignments,
  currentPage,
  totalPages,
  totalCount,
  status,
}: ToolAssignmentsTableProps) {
  const router = useRouter();
  const [returning, setReturning] = useState<string | null>(null);

  const handleReturn = async (assignment: Assignment) => {
    if (!confirm("Bu araç-gereci iade etmek istediğinizden emin misiniz?")) {
      return;
    }

    setReturning(assignment.id);

    const formData = new FormData();
    formData.append("warehouse_id", assignment.warehouse?.id || "");

    const result = await returnTool(assignment.id, formData);
    setReturning(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Araç-Gereç</TableHead>
              <TableHead>Seri No</TableHead>
              <TableHead>Depo</TableHead>
              <TableHead>Zimmetli Kullanıcı</TableHead>
              <TableHead>Atayan</TableHead>
              <TableHead>Atanma Tarihi</TableHead>
              <TableHead>İade Tarihi</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                  Zimmet kaydı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.tool?.name || "-"}
                  </TableCell>
                  <TableCell>{assignment.tool?.serial_number || "-"}</TableCell>
                  <TableCell>{assignment.warehouse?.name || "-"}</TableCell>
                  <TableCell>
                    {assignment.assigned_to_profile?.full_name ||
                      assignment.assigned_to_profile?.email ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    {assignment.assigned_by_profile?.full_name ||
                      assignment.assigned_by_profile?.email ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assigned_at).toLocaleString("tr-TR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {assignment.returned_at
                      ? new Date(assignment.returned_at).toLocaleDateString("tr-TR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {status === "assigned" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturn(assignment)}
                        disabled={returning === assignment.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        İade Et
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Toplam {totalCount} kayıt
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/depo/tools/assignments?status=${status}&page=${currentPage - 1}`}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            >
              <Button variant="outline" size="sm" disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Önceki
              </Button>
            </Link>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Sayfa {currentPage} / {totalPages}
            </span>
            <Link
              href={`/depo/tools/assignments?status=${status}&page=${currentPage + 1}`}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
                Sonraki
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
