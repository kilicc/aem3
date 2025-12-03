"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface Customer {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
}

interface WorkOrder {
  id: string;
  order_number: string;
  status: string;
  customer_id: string;
}

interface CustomerMapProps {
  customers: Customer[];
  workOrders?: WorkOrder[];
  height?: string;
  showInfoWindow?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 39.9334, // Türkiye merkezi
  lng: 32.8597,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#22c55e"; // green
    case "in_progress":
      return "#3b82f6"; // blue
    case "pending":
      return "#eab308"; // yellow
    default:
      return "#6b7280"; // gray
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Tamamlandı";
    case "in_progress":
      return "İşlemde";
    case "pending":
      return "Beklemede";
    default:
      return "Diğer";
  }
};

// GoogleMap component wrapper
function GoogleMapComponent({
  center,
  zoom,
  height,
  customerMapData,
  showInfoWindow,
  onCustomerClick,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  height: string;
  customerMapData: Array<{ customer: Customer; workOrders: WorkOrder[] }>;
  showInfoWindow: boolean;
  onCustomerClick?: (customerId: string) => void;
}) {
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  // Müşteri seçildiğinde haritayı o müşteriye odakla
  React.useEffect(() => {
    if (selectedCustomer && map) {
      map.setCenter({
        lat: selectedCustomer.customer.latitude!,
        lng: selectedCustomer.customer.longitude!,
      });
      map.setZoom(15);
    }
  }, [selectedCustomer, map]);

  return (
    <GoogleMap
      mapContainerStyle={{ ...mapContainerStyle, height }}
      center={center}
      zoom={zoom}
      onLoad={(mapInstance) => setMap(mapInstance)}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {customerMapData.map(({ customer, workOrders }) => {
        const hasWorkOrder = workOrders.length > 0;
        const latestWorkOrder = workOrders[workOrders.length - 1];
        const statusColor = hasWorkOrder
          ? getStatusColor(latestWorkOrder.status)
          : "#6b7280";

        return (
          <Marker
            key={customer.id}
            position={{
              lat: customer.latitude!,
              lng: customer.longitude!,
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: statusColor,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: hasWorkOrder ? 10 : 7,
            }}
            onClick={() => {
              if (onCustomerClick) {
                onCustomerClick(customer.id);
              }
              if (showInfoWindow) {
                setSelectedCustomer({ customer, workOrders });
              }
            }}
          />
        );
      })}

      {selectedCustomer && showInfoWindow && (
        <InfoWindow
          position={{
            lat: selectedCustomer.customer.latitude!,
            lng: selectedCustomer.customer.longitude!,
          }}
          onCloseClick={() => setSelectedCustomer(null)}
        >
          <div className="p-2 min-w-[200px]">
            <Link href={`/musteri/${selectedCustomer.customer.id}`} className="block">
              <h3 className="font-semibold text-sm mb-1 hover:text-red-600 dark:hover:text-red-400 cursor-pointer">
                {selectedCustomer.customer.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {selectedCustomer.customer.address}
            </p>
            {selectedCustomer.workOrders.length > 0 && (
              <div className="space-y-1 mb-3">
                <p className="text-xs font-medium">İş Emirleri:</p>
                {selectedCustomer.workOrders.map((wo: WorkOrder) => (
                  <div key={wo.id} className="flex items-center gap-2">
                    <span className="text-xs">{wo.order_number}</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: getStatusColor(wo.status),
                        color: getStatusColor(wo.status),
                      }}
                    >
                      {getStatusLabel(wo.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/musteri/${selectedCustomer.customer.id}`}>
              <Button
                size="sm"
                className="w-full text-xs mt-2"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Detayları Görüntüle
              </Button>
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default function CustomerMap({
  customers,
  workOrders = [],
  height = "400px",
  showInfoWindow = true,
}: CustomerMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const router = useRouter();
  const [geocodedCustomers, setGeocodedCustomers] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [forceRegeocode, setForceRegeocode] = useState<Set<string>>(new Set()); // Zorla yeniden geocode edilecek müşteriler

  // Google Maps API'yi provider'dan al (tek instance)
  const { isLoaded, loadError } = useGoogleMaps();

  // Google Maps yüklendikten sonra geocoding yapacak
  useEffect(() => {
    if (!isLoaded || !googleMapsApiKey || typeof window === "undefined" || !window.google) {
      return;
    }

    const geocodeAddresses = async () => {
      const customersToGeocode = customers.filter(
        (c) => !c.latitude && !c.longitude && c.address && c.address.trim() !== ""
      );

      console.log(`Geocoding ${customersToGeocode.length} müşteri için başlatılıyor...`);
      
      if (customersToGeocode.length === 0) {
        console.log("Geocoding yapılacak müşteri bulunamadı (zaten koordinatları var veya adres bilgisi yok)");
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const newGeocoded = new Map<string, { lat: number; lng: number }>();

      // Rate limiting için birer birer işle
      for (const customer of customersToGeocode) {
        // Daha iyi geocoding için adres formatını optimize et
        // Format: Sokak, Mahalle/District, City, Country
        const addressParts = [];
        
        // Adres satırını temizle ve ekle
        if (customer.address) {
          addressParts.push(customer.address.trim());
        }
        
        // İlçe (district) ekle
        if (customer.district) {
          addressParts.push(customer.district.trim());
        }
        
        // Şehir (city) ekle
        if (customer.city) {
          addressParts.push(customer.city.trim());
        }
        
        // Ülke ekle
        addressParts.push("Türkiye");

        const fullAddress = addressParts.join(", ");
        
        console.log(`Geocoding: ${customer.name} - ${fullAddress}`);

        try {
          await new Promise<void>((resolve) => {
            // Daha spesifik geocoding için region belirt
            const geocodeRequest: google.maps.GeocoderRequest = {
              address: fullAddress,
              region: "TR", // Türkiye bölgesi
              componentRestrictions: customer.city ? {
                country: "TR",
                administrativeArea: customer.city.trim(),
              } : {
                country: "TR",
              },
            };

            geocoder.geocode(geocodeRequest, (results, status) => {
              if (status === "OK" && results && results.length > 0) {
                // En iyi sonucu bul - ilk sonuç genelde en doğrusudur ama kontrol edelim
                let bestResult = results[0];
                
                // Eğer şehir belirtilmişse, şehirle eşleşen sonucu tercih et
                if (customer.city && results.length > 1) {
                  const cityMatch = results.find((r) => {
                    const addressComponents = r.address_components || [];
                    return addressComponents.some((comp) => {
                      return comp.types.includes("locality") || 
                             comp.types.includes("administrative_area_level_1");
                    });
                  });
                  if (cityMatch) {
                    bestResult = cityMatch;
                  }
                }

                const location = bestResult.geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                // Sonucu logla (debug için)
                console.log(`Geocoded: ${customer.name} -> ${lat}, ${lng} (${bestResult.formatted_address})`);
                
                // Sonucun doğruluğunu kontrol et
                const locationType = bestResult.geometry.location_type;
                if (locationType === "APPROXIMATE" || locationType === "GEOMETRIC_CENTER") {
                  console.warn(`Warning: Low accuracy geocoding for ${customer.name}: ${locationType}`);
                }
                
                newGeocoded.set(customer.id, {
                  lat: lat,
                  lng: lng,
                });

                // Veritabanına kaydet (async, non-blocking)
                fetch("/api/customers/geocode", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customerId: customer.id,
                    latitude: lat,
                    longitude: lng,
                  }),
                }).catch(console.error);
              } else {
                console.warn(`Geocoding failed for customer ${customer.id} (${customer.name}): ${status} - Address: ${fullAddress}`);
                
                // Fallback: Sadece şehir ve ilçe ile dene
                if (customer.city && customer.district && status !== "ZERO_RESULTS") {
                  const fallbackAddress = `${customer.district}, ${customer.city}, Türkiye`;
                  console.log(`Trying fallback geocoding: ${fallbackAddress}`);
                  
                  geocoder.geocode({
                    address: fallbackAddress,
                    region: "TR",
                  }, (fallbackResults, fallbackStatus) => {
                    if (fallbackStatus === "OK" && fallbackResults && fallbackResults.length > 0) {
                      const location = fallbackResults[0].geometry.location;
                      console.log(`Fallback geocoded: ${customer.name} -> ${location.lat()}, ${location.lng()}`);
                      newGeocoded.set(customer.id, {
                        lat: location.lat(),
                        lng: location.lng(),
                      });
                    }
                    setTimeout(resolve, 200);
                  });
                } else {
                  setTimeout(resolve, 200);
                }
              }
              // Her geocoding sonrası kısa bir bekleme (rate limiting)
              if (status === "OK") {
                setTimeout(resolve, 200);
              }
            });
          });
        } catch (error) {
          console.error(`Geocoding failed for customer ${customer.id}:`, error);
        }
      }

      if (newGeocoded.size > 0) {
        console.log(`${newGeocoded.size} müşteri için geocoding tamamlandı`);
        setGeocodedCustomers((prev) => {
          const updated = new Map(prev);
          newGeocoded.forEach((value, key) => updated.set(key, value));
          return updated;
        });
      } else {
        console.warn("Geocoding tamamlandı ama hiçbir müşteri için koordinat bulunamadı");
      }
    };

    // Kısa bir gecikme ile geocoding başlat
    setTimeout(geocodeAddresses, 500);
  }, [isLoaded, googleMapsApiKey, customers, geocodedCustomers, forceRegeocode]);

  // Load hatalarını yakala
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps yükleme hatası:", loadError);
      
      const errorMessage = loadError.message || loadError.toString();
      
      if (errorMessage.includes("BillingNotEnabled") || errorMessage.includes("BillingNotEnabledMapError")) {
        setMapError("BillingNotEnabledMapError");
      } else if (errorMessage.includes("InvalidKey") || errorMessage.includes("InvalidKeyMapError")) {
        setMapError("Geçersiz API anahtarı. Lütfen API key'inizi kontrol edin.");
      } else if (errorMessage.includes("RefererNotAllowedMapError")) {
        setMapError("API key referans hatası. Lütfen API key ayarlarınızı kontrol edin.");
      } else {
        setMapError(errorMessage || "Harita yüklenirken bir hata oluştu.");
      }
    }
  }, [loadError]);

  // Arama sorgusuna göre müşterileri filtrele
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const query = searchQuery.toLowerCase();
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query) ||
        c.district?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, searchQuery]);

  // Center'ı hesapla (müşterilerin ortalaması)
  const center = useMemo(() => {
    const customersWithLocation = filteredCustomers.filter((c) => {
      const hasCoordinates = c.latitude && c.longitude;
      const hasGeocodedCoords = geocodedCustomers.has(c.id);
      return hasCoordinates || hasGeocodedCoords;
    });

    if (customersWithLocation.length === 0) return defaultCenter;

    const customersWithCoords = customersWithLocation.map((c) => {
      const coordinates = geocodedCustomers.get(c.id);
      return {
        ...c,
        latitude: c.latitude || coordinates?.lat || null,
        longitude: c.longitude || coordinates?.lng || null,
      };
    }).filter((c) => c.latitude && c.longitude);

    if (customersWithCoords.length === 0) return defaultCenter;

    const avgLat =
      customersWithCoords.reduce(
        (sum, item) => sum + (item.latitude || 0),
        0
      ) / customersWithCoords.length;
    const avgLng =
      customersWithCoords.reduce(
        (sum, item) => sum + (item.longitude || 0),
        0
      ) / customersWithCoords.length;

    return { lat: avgLat, lng: avgLng };
  }, [filteredCustomers, geocodedCustomers]);

  // Müşteri ve iş emirlerini birleştir
  const customerMapData = useMemo(() => {
    // Tüm müşterileri al (koordinat bilgisi olanlar veya adres bilgisi olanlar)
    const customersWithLocation = filteredCustomers.filter((c) => {
      const hasCoordinates = c.latitude && c.longitude;
      const hasGeocodedCoords = geocodedCustomers.has(c.id);
      const hasAddress = c.address && c.address.trim() !== "";
      return hasCoordinates || hasGeocodedCoords || hasAddress;
    });

    const mappedData = customersWithLocation.map((customer) => {
      // Geocoded koordinatları kullan veya mevcut koordinatları
      const coordinates = geocodedCustomers.get(customer.id);
      const customerWithCoords = {
        ...customer,
        latitude: customer.latitude || coordinates?.lat || null,
        longitude: customer.longitude || coordinates?.lng || null,
      };

      // Eğer hala koordinat yoksa null dön (geocoding devam ediyor olabilir)
      if (!customerWithCoords.latitude || !customerWithCoords.longitude) {
        return null;
      }

      const customerWorkOrders = workOrders.filter(
        (wo) => wo.customer_id === customer.id
      );
      return {
        customer: customerWithCoords,
        workOrders: customerWorkOrders,
      };
    }).filter((item): item is { customer: Customer & { latitude: number; longitude: number }; workOrders: WorkOrder[] } => item !== null);
    
    console.log(`CustomerMap: ${mappedData.length} müşteri haritada gösterilecek`);
    return mappedData;
  }, [filteredCustomers, workOrders, geocodedCustomers]);

  // Seçili müşteriye göre center'ı güncelle
  const mapCenter = useMemo(() => {
    if (selectedCustomerId && customerMapData.length > 0) {
      const selected = customerMapData.find(
        (item) => item.customer.id === selectedCustomerId
      );
      if (selected) {
        return {
          lat: selected.customer.latitude!,
          lng: selected.customer.longitude!,
        };
      }
    }
    return center;
  }, [selectedCustomerId, customerMapData, center]);

  // Arama sonucundan müşteri seçildiğinde haritada göster ve odakla
  const handleSearchResultClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    // Haritada bu müşteriye odaklanacak (mapCenter zaten bunu yapıyor)
  };

  // Arama sorgusu değiştiğinde ilk sonucu otomatik seç
  useEffect(() => {
    if (searchQuery && filteredCustomers.length > 0) {
      const firstWithLocation = filteredCustomers.find(
        (c) => c.latitude && c.longitude
      );
      if (firstWithLocation) {
        setSelectedCustomerId(firstWithLocation.id);
      }
    } else if (!searchQuery) {
      setSelectedCustomerId(null);
    }
  }, [searchQuery, filteredCustomers]);

  if (!googleMapsApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Haritası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="mb-2">Google Maps API key'i bulunamadı.</p>
            <p className="text-sm">
              Lütfen .env.local dosyasına{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </code>{" "}
              ekleyin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Haritası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-red-500 dark:text-red-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-semibold mb-2">Harita Yüklenemedi</p>
            </div>
            {mapError === "BillingNotEnabledMapError" ? (
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>
                  Google Maps API için faturalandırma (billing) aktif değil.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Faturalandırmayı Aktifleştirme Adımları:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>
                      <a
                        href="https://console.cloud.google.com/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
                      >
                        Google Cloud Console Billing sayfasına
                      </a>{" "}
                      gidin
                    </li>
                    <li>Bir faturalandırma hesabı seçin veya yeni bir tane oluşturun</li>
                    <li>Projenize kredi kartı bilgilerinizi ekleyin</li>
                    <li>
                      <a
                        href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
                      >
                        Maps JavaScript API'yi etkinleştirin
                      </a>
                    </li>
                    <li>Sayfayı yenileyin</li>
                  </ol>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  Not: Google Maps API'nin ücretsiz kullanım kotası mevcuttur (aylık $200 kredi).
                  Detaylı bilgi için{" "}
                  <a
                    href="https://developers.google.com/maps/billing-and-pricing/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    fiyatlandırma sayfasını
                  </a>{" "}
                  ziyaret edin.
                </p>
              </div>
            ) : (
              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">{mapError}</p>
                <p className="text-sm">
                  Lütfen API key'inizin doğru olduğundan ve gerekli API'lerin etkinleştirildiğinden emin olun.
                </p>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  Google Cloud Console'u aç
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Haritası</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Müşteri Arama */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Müşteri ara (isim, adres, şehir, telefon, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setSearchQuery("");
                setSelectedCustomerId(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Arama Sonuçları */}
        {searchQuery && filteredCustomers.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Arama sonucu bulunamadı.
            </p>
          </div>
        )}

        {searchQuery && filteredCustomers.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg">
            {filteredCustomers.map((customer) => {
              const hasLocation = customer.latitude && customer.longitude;
              return (
                <Link
                  key={customer.id}
                  href={`/musteri/${customer.id}`}
                  className={`block p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedCustomerId === customer.id
                      ? "bg-red-50 dark:bg-red-900/20"
                      : ""
                  }`}
                  onMouseEnter={() => {
                    // Mouse üzerine gelince haritada göster
                    if (hasLocation) {
                      handleSearchResultClick(customer.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {customer.address}
                      </p>
                    </div>
                    {hasLocation ? (
                      <Badge variant="outline" className="text-xs">
                        Haritada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        Konum yok
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoaded ? (
          <div className="h-[500px] flex items-center justify-center text-gray-500">
            Harita yükleniyor...
          </div>
        ) : loadError ? (
          <div className="h-[500px] flex items-center justify-center text-red-500">
            {mapError || "Harita yüklenirken bir hata oluştu."}
          </div>
        ) : (
          <GoogleMapComponent
            center={mapCenter}
            zoom={selectedCustomerId || customerMapData.length === 1 ? 15 : 10}
            height={height}
            customerMapData={customerMapData}
            showInfoWindow={showInfoWindow}
            onCustomerClick={(customerId) => {
              // Marker'a tıklayınca direkt detay sayfasına git
              router.push(`/musteri/${customerId}`);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

