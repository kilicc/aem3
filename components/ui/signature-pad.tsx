"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
}

export default function SignaturePad({
  onSave,
  onCancel,
  width = 600,
  height = 300,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : e.clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : e.clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto border border-gray-200 dark:border-gray-800 rounded cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={save} disabled={!hasSignature}>
          Kaydet
        </Button>
        <Button type="button" variant="outline" onClick={clear}>
          Temizle
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        İmzanızı fare veya parmağınızla çizin
      </p>
    </div>
  );
}
