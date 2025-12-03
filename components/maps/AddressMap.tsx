"use client";

import { useState, useMemo, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface AddressMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  showDirections?: boolean;
  height?: string;
}

export default function AddressMap({
  address,
  latitude,
  longitude,
  showDirections = false,
  height = "400px",
}: AddressMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [directions, setDirections] = useState<any>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (loadError) {
      if (loadError.message.includes("BillingNotEnabledMapError")) {
        setMapError(
          "Google Maps API için faturalandırma etkinleştirilmemiş. Lütfen Google Cloud Console'dan faturalandırmayı etkinleştirin."
        );
      } else if (loadError.message.includes("InvalidKeyMapError")) {
        setMapError(
          "Geçersiz Google Maps API anahtarı. Lütfen .env.local dosyasında NEXT_PUBLIC_GOOGLE_MAPS_API_KEY değerini kontrol edin."
        );
      } else {
        setMapError(`Harita yüklenirken bir hata oluştu: ${loadError.message}`);
      }
    }
  }, [loadError]);

  const mapContainerStyle = {
    width: "100%",
    height: height,
    borderRadius: "8px",
  };

  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    return { lat: 39.9334, lng: 32.8597 }; // Türkiye merkezi
  }, [latitude, longitude]);

  // Mobil cihaz tespiti
  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    );
  };

  // iOS tespiti
  const isIOS = () => {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  // Android tespiti
  const isAndroid = () => {
    if (typeof window === "undefined") return false;
    return /android/i.test(navigator.userAgent);
  };

  // Mobil cihazlarda Google Maps uygulamasını açma fonksiyonu
  const tryOpenMapsApp = (userLat?: number, userLng?: number) => {
    let appUrl: string;
    let webUrl: string;

    if (userLat !== undefined && userLng !== undefined) {
      // Kullanıcı konumu varsa yol tarifi URL'i oluştur
      if (isIOS()) {
        // iOS için Google Maps uygulaması
        appUrl = `comgooglemaps://?saddr=${userLat},${userLng}&daddr=${latitude},${longitude}&directionsmode=driving`;
        // iOS için Apple Maps fallback
        webUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
      } else if (isAndroid()) {
        // Android için Google Maps Navigation
        appUrl = `google.navigation:q=${latitude},${longitude}`;
        // Android için Google Maps web fallback
        webUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
      } else {
        // Diğer mobil cihazlar
        appUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
        webUrl = appUrl;
      }
    } else {
      // Kullanıcı konumu yoksa sadece hedef adresine yönlendir
      if (isIOS()) {
        appUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
        webUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      } else if (isAndroid()) {
        appUrl = `google.navigation:q=${latitude},${longitude}`;
        webUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      } else {
        appUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        webUrl = appUrl;
      }
    }

    // Önce uygulama URL'ini dene (deep link)
    try {
      // iOS ve Android için direkt yönlendirme
      if (isIOS() || isAndroid()) {
        window.location.href = appUrl;
        // Uygulama açılmazsa 2 saniye sonra web versiyonunu aç
        setTimeout(() => {
          window.open(webUrl, "_blank");
        }, 2000);
      } else {
        // Diğer cihazlarda direkt web versiyonunu aç
        window.open(webUrl, "_blank");
      }
    } catch (error) {
      // Hata durumunda web versiyonunu aç
      console.error("Uygulama açma hatası:", error);
      window.open(webUrl, "_blank");
    }

    setLoadingDirections(false);
  };

  const handleGetDirections = () => {
    const isMobile = isMobileDevice();

    if (isMobile) {
      // Mobil cihazda direkt Google Maps uygulamasına yönlendir
      setLoadingDirections(true);

      // Kullanıcı konumunu al
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            tryOpenMapsApp(userLat, userLng);
          },
          (error) => {
            // Konum alınamazsa sadece hedef adresine yönlendir
            console.warn("Konum alınamadı, sadece hedef adresine yönlendiriliyor:", error);
            tryOpenMapsApp();
          },
          {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0,
          }
        );
      } else {
        // Geolocation desteklenmiyorsa sadece hedef adresine yönlendir
        tryOpenMapsApp();
      }
    } else {
      // Desktop'ta mevcut davranış (haritada göster + web URL aç)
      if (!navigator.geolocation) {
        alert("Tarayıcınız konum servisini desteklemiyor.");
        return;
      }

      setLoadingDirections(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Google Maps URL'i her zaman açılır (daha güvenilir)
          const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
          
          if (!googleMapsApiKey || !isLoaded) {
            // API key yoksa veya harita yüklenmediyse direkt Google Maps URL'i aç
            window.open(url, "_blank");
            setLoadingDirections(false);
            return;
          }

          // Directions Service kullanarak yol tarifi al
          try {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
              {
                origin: { lat: userLat, lng: userLng },
                destination: { lat: latitude!, lng: longitude! },
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === "OK" && result) {
                  // Yol tarifi başarılı, haritada göster
                  setDirections(result);
                } else {
                  // Fallback: Google Maps URL aç
                  window.open(url, "_blank");
                }
                setLoadingDirections(false);
              }
            );
          } catch (error) {
            // Hata durumunda Google Maps URL'i aç
            console.error("Directions Service hatası:", error);
            window.open(url, "_blank");
            setLoadingDirections(false);
          }
        },
        (error) => {
          console.error("Konum alma hatası:", error);
          
          // Konum alınamazsa direkt hedef adresine yönlendir
          if (latitude && longitude) {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(url, "_blank");
          } else {
            alert("Konumunuz alınamadı. Lütfen tarayıcı izinlerini kontrol edin veya haritaya tıklayarak yol tarifi alabilirsiniz.");
          }
          setLoadingDirections(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  if (!googleMapsApiKey) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Müşteri Konumu
            </CardTitle>
            {(latitude && longitude) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  window.open(url, "_blank");
                }}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Haritada Aç
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Google Maps API anahtarı bulunamadı. Lütfen .env.local dosyasında NEXT_PUBLIC_GOOGLE_MAPS_API_KEY değerini ayarlayın.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Müşteri Konumu
          </CardTitle>
          {showDirections && (latitude && longitude) && (
            <Button
              variant="default"
              size="sm"
              onClick={handleGetDirections}
              disabled={loadingDirections || (!isMobileDevice() && !isLoaded)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Navigation className="mr-2 h-4 w-4" />
              {loadingDirections
                ? "Yönlendiriliyor..."
                : isMobileDevice()
                ? "Google Maps'te Aç"
                : "Yol Tarifi Al"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adres:
            </p>
            <p className="text-gray-700 dark:text-gray-300">{address || "Adres bilgisi bulunamadı"}</p>
          </div>
          
          {showDirections && directions && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                ✓ Yol tarifi haritada gösteriliyor
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Yol tarifini Google Maps uygulamasında açmak için butona tekrar tıklayın.
              </p>
            </div>
          )}
          
          {latitude && longitude ? (
            !isLoaded ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Harita yükleniyor...
              </div>
            ) : loadError ? (
              <div className="h-[300px] flex items-center justify-center text-red-500">
                {mapError || "Harita yüklenirken bir hata oluştu."}
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ ...mapContainerStyle, height }}
                center={center}
                zoom={15}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
                onLoad={() => {
                  console.log("Google Maps yüklendi");
                }}
              >
                <Marker
                  position={center}
                  title={address}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                />
                {directions && isLoaded && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: "#dc2626",
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                      markerOptions: {
                        icon: {
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          scaledSize: new google.maps.Size(32, 32),
                        },
                      },
                    }}
                  />
                )}
              </GoogleMap>
            )
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Konum bilgisi bulunamadı
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
