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
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { approveReturn, rejectReturn } from "../actions/tools";
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

interface Assignment {
  id: string;
  status: string;
  assigned_at: string;
  return_requested_at: string | null;
  return_notes: string | null;
  warehouse_id: string;
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
}

interface ReturnApprovalsTableProps {
  assignments: Assignment[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function ReturnApprovalsTable({
  assignments,
  currentPage,
  totalPages,
  totalCount,
}: ReturnApprovalsTableProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  const handleApprove = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setApprovalNotes("");
    setShowApprovalDialog(true);
  };

  const handleReject = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setApprovalNotes("");
    setShowRejectDialog(true);
  };

  const handleSubmitApprove = async () => {
    if (!selectedAssignment) return;

    setProcessing(selectedAssignment.id);

    const formData = new FormData();
    formData.append("warehouse_id", selectedAssignment.warehouse_id);
    formData.append("approval_notes", approvalNotes);

    const result = await approveReturn(selectedAssignment.id, formData);
    setProcessing(null);

    if (result.error) {
      alert(result.error);
    } else {
      setShowApprovalDialog(false);
      setSelectedAssignment(null);
      setApprovalNotes("");
      router.refresh();
    }
  };

  const handleSubmitReject = async () => {
    if (!selectedAssignment) return;

    setProcessing(selectedAssignment.id);

    const formData = new FormData();
    formData.append("approval_notes", approvalNotes);

    const result = await rejectReturn(selectedAssignment.id, formData);
    setProcessing(null);

    if (result.error) {
      alert(result.error);
    } else {
      setShowRejectDialog(false);
      setSelectedAssignment(null);
      setApprovalNotes("");
      router.refresh();
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
                <TableHead>Zimmetli Kullanıcı</TableHead>
                <TableHead>Zimmet Tarihi</TableHead>
                <TableHead>İade İsteği Tarihi</TableHead>
                <TableHead>İade Notu</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                    Onay bekleyen iade isteği bulunmamaktadır
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
                      {new Date(assignment.assigned_at).toLocaleString("tr-TR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {assignment.return_requested_at
                        ? new Date(assignment.return_requested_at).toLocaleString("tr-TR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {assignment.return_notes || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(assignment)}
                          disabled={processing === assignment.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Onayla
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(assignment)}
                          disabled={processing === assignment.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reddet
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
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Toplam {totalCount} kayıt
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/depo/tools/assignments/approvals?page=${currentPage - 1}`}
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
                href={`/depo/tools/assignments/approvals?page=${currentPage + 1}`}
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

      {/* Onay Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İade Onayı</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.tool?.name} araç-gereci için iade isteğini onaylayın
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval_notes">Onay Notu (Opsiyonel)</Label>
              <textarea
                id="approval_notes"
                name="approval_notes"
                rows={4}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Kontrol notu veya açıklama..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalDialog(false);
                setSelectedAssignment(null);
                setApprovalNotes("");
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmitApprove}
              disabled={processing === selectedAssignment?.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing === selectedAssignment?.id ? "Onaylanıyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Red Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İade Reddi</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.tool?.name} araç-gereci için iade isteğini reddedin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject_notes">Red Nedeni *</Label>
              <textarea
                id="reject_notes"
                name="reject_notes"
                rows={4}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Red nedeni (zorunlu)..."
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedAssignment(null);
                setApprovalNotes("");
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReject}
              disabled={processing === selectedAssignment?.id || !approvalNotes.trim()}
            >
              {processing === selectedAssignment?.id ? "Reddediliyor..." : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

