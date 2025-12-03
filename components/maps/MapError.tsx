"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface MapErrorProps {
  error: Error;
  latitude?: number | null;
  longitude?: number | null;
}

export default function MapError({ error, latitude, longitude }: MapErrorProps) {
  const isInvalidKey = error.message.includes("InvalidKey") || error.message.includes("invalidKey");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg">
            Google Maps yüklenemedi
          </p>
          {isInvalidKey ? (
            <>
              <p className="text-sm text-red-500 dark:text-red-300 mb-4 max-w-md">
                Google Maps API key'i geçersiz veya Maps JavaScript API etkin değil. Lütfen aşağıdaki adımları takip edin:
              </p>
              <div className="text-left text-sm text-red-600 dark:text-red-400 space-y-2 mb-4 max-w-md">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Google Cloud Console'a gidin</li>
                  <li>API'ler ve Servisler &gt; Kütüphane bölümünden "Maps JavaScript API"yi arayın</li>
                  <li>API'yi etkinleştirin</li>
                  <li>Kimlik Bilgileri bölümünden API key'inizi kontrol edin</li>
                  <li>.env.local dosyasına doğru key'i ekleyin</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  API Key Yönetimi →
                </a>
                <a
                  href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Maps JavaScript API →
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-500 dark:text-red-300 mb-4">
              {error.message || "Bilinmeyen bir hata oluştu."}
            </p>
          )}
          {latitude && longitude && (
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Google Maps'te Aç →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

