"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  currentFiles?: string[];
}

export default function FileUpload({
  bucket,
  folder = "",
  accept = "image/*",
  multiple = false,
  maxSize = 5,
  onUploadComplete,
  onError,
  currentFiles = [],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(currentFiles);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Boyut kontrolü
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`${file.name} dosyası çok büyük. Maksimum ${maxSize}MB olmalıdır.`);
        return;
      }
    }

    // Preview oluştur
    const newPreviews: string[] = [];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setPreviews([...previews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    handleUpload(files);
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    const uploadPromises: Promise<string>[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })
        .then(({ data, error }) => {
          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

          return urlData.publicUrl;
        });

      uploadPromises.push(uploadPromise);
    }

    try {
      const urls = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...urls];
      setUploadedFiles(newFiles);
      onUploadComplete?.(newFiles);
    } catch (error: any) {
      onError?.(error.message || "Dosya yükleme hatası");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviews(newPreviews);
    onUploadComplete?.(newFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        {uploadedFiles.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={`Fotoğraf ${index + 1} kaldır`}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="file-upload-input" className="sr-only">
          Dosya seç
        </Label>
        <input
          ref={fileInputRef}
          id="file-upload-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          aria-label="Dosya seç"
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            "Yükleniyor..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? "Dosyalar Seç" : "Dosya Seç"}
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Maksimum dosya boyutu: {maxSize}MB
        </p>
      </div>
    </div>
  );
}
