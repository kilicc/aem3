"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteWorkOrderMaterial } from "../actions/work-orders";

interface WorkOrderMaterialDeleteProps {
  materialId: string;
}

export default function WorkOrderMaterialDelete({
  materialId,
}: WorkOrderMaterialDeleteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu malzemeyi silmek istediğinize emin misiniz?")) {
      return;
    }

    setLoading(true);
    const result = await deleteWorkOrderMaterial(materialId);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Malzeme sil"
    >
      <X className="h-4 w-4 text-red-600" />
    </Button>
  );
}
