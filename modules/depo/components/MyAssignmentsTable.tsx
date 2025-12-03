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
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { requestReturn } from "../actions/tools";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Assignment {
  id: string;
  status: string;
  assigned_at: string;
  return_requested_at: string | null;
  return_notes: string | null;
  approval_notes: string | null;
  tool?: {
    id: string;
    name: string;
    serial_number: string | null;
  } | null;
  warehouse?: {
    id: string;
    name: string;
  } | null;
}

interface MyAssignmentsTableProps {
  assignments: Assignment[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  status: string;
}

export default function MyAssignmentsTable({
  assignments,
  currentPage,
  totalPages,
  totalCount,
  status,
}: MyAssignmentsTableProps) {
  const router = useRouter();
  const [returning, setReturning] = useState<string | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [returnNotes, setReturnNotes] = useState("");

  const handleReturnRequest = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setReturnNotes("");
    setShowReturnDialog(true);
  };

  const handleSubmitReturn = async () => {
    if (!selectedAssignment) return;

    setReturning(selectedAssignment.id);

    const formData = new FormData();
    formData.append("return_notes", returnNotes);

    const result = await requestReturn(selectedAssignment.id, formData);
    setReturning(null);

    if (result.error) {
      alert(result.error);
    } else {
      setShowReturnDialog(false);
      setSelectedAssignment(null);
      setReturnNotes("");
      router.refresh();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge variant="default">Zimmetli</Badge>;
      case "return_requested":
        return <Badge variant="secondary">İade İsteği Gönderildi</Badge>;
      case "returned":
        return <Badge variant="outline">İade Edildi</Badge>;
      case "rejected":
        return <Badge variant="destructive">İade Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Araç-Gereç</TableHead>
                <TableHead>Seri No</TableHead>
                <TableHead>Depo</TableHead>
                <TableHead>Zimmet Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
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
                      {new Date(assignment.assigned_at).toLocaleString("tr-TR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      {assignment.status === "assigned" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturnRequest(assignment)}
                          disabled={returning === assignment.id}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          İade İsteği
                        </Button>
                      )}
                      {assignment.status === "return_requested" && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <AlertCircle className="h-4 w-4" />
                          Onay bekleniyor
                        </div>
                      )}
                      {assignment.status === "rejected" && assignment.approval_notes && (
                        <div className="text-sm text-red-600">
                          Red nedeni: {assignment.approval_notes}
                        </div>
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
                href={`/dashboard/my-assignments?status=${status}&page=${currentPage - 1}`}
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
                href={`/dashboard/my-assignments?status=${status}&page=${currentPage + 1}`}
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

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zimmetten Bırakma İsteği</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.tool?.name} araç-gereci için iade isteği gönderin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="return_notes">Not (Opsiyonel)</Label>
              <textarea
                id="return_notes"
                name="return_notes"
                rows={4}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="İade nedeni veya açıklama..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReturnDialog(false);
                setSelectedAssignment(null);
                setReturnNotes("");
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={returning === selectedAssignment?.id}
            >
              {returning === selectedAssignment?.id ? "Gönderiliyor..." : "İade İsteği Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

