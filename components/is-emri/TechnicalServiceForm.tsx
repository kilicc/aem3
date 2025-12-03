"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TechnicalServiceFormProps {
  template: any;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_id?: string;
    tax_office?: string;
  };
  device?: {
    device_type?: string;
    device_name?: string;
    serial_number?: string | null;
  };
  formData?: any;
  onChange?: (data: any) => void;
  readOnly?: boolean;
  workOrderNumber?: string;
  assignedUsers?: Array<{ id: string; full_name: string }>;
}

interface Material {
  id: string;
  material_type: string;
  quantity: string;
  unit: string;
  product_id?: string; // Seçilen ürün ID'si
}

interface Product {
  id: string;
  name: string;
  unit: {
    name: string;
    symbol: string;
  } | null;
}


export default function TechnicalServiceForm({
  template,
  customer,
  device,
  formData: initialFormData,
  onChange,
  readOnly = false,
  workOrderNumber,
  assignedUsers = [],
}: TechnicalServiceFormProps) {
  const supabase = createClient();
  const [formData, setFormData] = useState<any>(initialFormData || {});
  const [materials, setMaterials] = useState<Material[]>(
    initialFormData?.materials || []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Ürünleri yükle
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            unit:units!products_unit_id_fkey(name, symbol)
          `)
          .order("name", { ascending: true });

        if (error) {
          console.error("Ürünler yüklenirken hata:", error);
        } else {
          // Unit'i düzelt - Supabase array döndürebilir
          const formattedProducts = (data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            unit: Array.isArray(product.unit) ? product.unit[0] : product.unit,
          }));
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!readOnly) {
      fetchProducts();
    }
  }, [supabase, readOnly]);

  // Müşteri ve cihaz bilgilerini stringify ederek karşılaştır
  const customerKey = customer ? JSON.stringify({ name: customer.name, address: customer.address, tax_id: customer.tax_id, tax_office: customer.tax_office, phone: customer.phone }) : "";
  const deviceKey = device ? JSON.stringify({ device_type: device.device_type, device_name: device.device_name, serial_number: device.serial_number }) : "";
  const initialFormDataKey = initialFormData ? JSON.stringify(initialFormData) : "";

  useEffect(() => {
    // Müşteri bilgilerini otomatik doldur (sadece read-only değilse)
    if (!readOnly) {
      const autoFilled: any = {};
      
      if (customer) {
        autoFilled.sayin = customer.name || "";
        autoFilled.address = customer.address || "";
        autoFilled.tax_id = customer.tax_id || "";
        autoFilled.tax_office = customer.tax_office || "";
        autoFilled.phone = customer.phone || "";
      }

      if (device) {
        autoFilled.device_type = device.device_type || "";
        autoFilled.device_name = device.device_name || "";
        autoFilled.serial_number = device.serial_number || "";
      }

      // Tarihi otomatik doldur (her zaman)
      const today = new Date();
      autoFilled.date = today.toLocaleDateString("tr-TR");

      setFormData((prevFormData: any) => {
        const updatedFormData = { ...prevFormData, ...autoFilled };
        // onChange'i sadece gerçekten değişiklik varsa çağır
        const hasChanges = Object.keys(autoFilled).some(
          (key: string) => prevFormData[key] !== autoFilled[key]
        );
        if (hasChanges && onChange) {
          // setTimeout ile asenkron çağrı yaparak sonsuz döngüyü önle
          setTimeout(() => {
            onChange({ ...updatedFormData, materials });
          }, 0);
        }
        return updatedFormData;
      });
    } else {
      // Read-only modda sadece initial data'yı set et
      if (initialFormData) {
        setFormData(initialFormData);
        setMaterials(initialFormData?.materials || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKey, deviceKey, readOnly, initialFormDataKey]);

  const handleFieldChange = (name: string, value: string) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (onChange) onChange({ ...newData, materials });
  };

  const handleMaterialChange = (id: string, field: keyof Material, value: string) => {
    const updatedMaterials = materials.map((m) => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        // Eğer product_id değiştiyse, ürün bilgilerini otomatik doldur
        if (field === "product_id" && value) {
          const selectedProduct = products.find((p) => p.id === value);
          if (selectedProduct) {
            updated.material_type = selectedProduct.name;
            updated.unit = selectedProduct.unit?.symbol || selectedProduct.unit?.name || "";
          }
        }
        return updated;
      }
      return m;
    });
    setMaterials(updatedMaterials);
    if (onChange) onChange({ ...formData, materials: updatedMaterials });
  };

  const handleMaterialTypeChange = (id: string, value: string, productId?: string) => {
    const updatedMaterials = materials.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          material_type: value,
          product_id: productId || undefined,
        };
      }
      return m;
    });
    setMaterials(updatedMaterials);
    if (onChange) onChange({ ...formData, materials: updatedMaterials });
  };

  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      material_type: "",
      quantity: "",
      unit: "",
      product_id: undefined,
    };
    const updatedMaterials = [...materials, newMaterial];
    setMaterials(updatedMaterials);
    if (onChange) onChange({ ...formData, materials: updatedMaterials });
  };

  const removeMaterial = (id: string) => {
    const updatedMaterials = materials.filter((m) => m.id !== id);
    setMaterials(updatedMaterials);
    if (onChange) onChange({ ...formData, materials: updatedMaterials });
  };

  return (
    <Card className="printable-form max-h-[calc(100vh-200px)] overflow-y-auto">
      <CardHeader className="card-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold">AEM</h2>
              <p className="text-xs text-gray-600">AKGÜN ELEKTRİK MÜHENDİSLİK</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p>www.aemakgun.com.tr</p>
            <p>0(232) 632 15 92</p>
          </div>
        </div>
        
        <div className="text-center border-2 border-gray-800 rounded-lg p-4 bg-gray-50">
          <CardTitle className="text-xl md:text-2xl font-bold">
            ARIZA BAKIM VE MALZEME SİPARİŞ FİŞİ
          </CardTitle>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Label>Form No:</Label>
            <Input
              type="text"
              value={workOrderNumber || formData.form_number || ""}
              disabled={true}
              className="w-24 h-8 text-sm bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Tarih:</Label>
            <Input
              type="text"
              value={formData.date || ""}
              disabled={true}
              placeholder="__/__/____"
              className="w-32 h-8 text-sm bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Müşteri Bilgileri */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sayin">SAYIN:</Label>
            <Input
              id="sayin"
              name="sayin"
              value={formData.sayin || ""}
              disabled={true}
              placeholder="Müşteri adı"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="phone">TEL.:</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              disabled={true}
              placeholder="Telefon"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">ADRES:</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              disabled={true}
              placeholder="Adres"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="tax_id">T.C.V.NO.-V.D.:</Label>
            <Input
              id="tax_id"
              name="tax_id"
              value={formData.tax_id || ""}
              disabled={true}
              placeholder="Vergi No / Vergi Dairesi"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* İş Bilgileri */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="start_time">İŞE BAŞLAMA SAATİ:</Label>
            <Input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time || ""}
              onChange={(e) => handleFieldChange("start_time", e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="end_time">BİTİŞ SAATİ:</Label>
            <Input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time || ""}
              onChange={(e) => handleFieldChange("end_time", e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="personnel">PERSONEL:</Label>
            <Input
              id="personnel"
              name="personnel"
              value={formData.personnel || assignedUsers.map(u => u.full_name).join(", ") || ""}
              disabled={true}
              placeholder="Personel adı"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="note">NOT:</Label>
            <textarea
              id="note"
              name="note"
              value={formData.note || ""}
              onChange={(e) => handleFieldChange("note", e.target.value)}
              disabled={readOnly}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Notlar"
            />
          </div>
        </div>

        {/* Malzeme Listesi */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">MALZEME LİSTESİ</Label>
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
              >
                <Plus className="h-4 w-4 mr-1" />
                Malzeme Ekle
              </Button>
            )}
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold border-r">MALZEME CİNSİ</th>
                  <th className="px-4 py-2 text-left font-semibold border-r">MİKTAR</th>
                  <th className="px-4 py-2 text-left font-semibold">BİRİM (AD./MT.)</th>
                  {!readOnly && <th className="px-4 py-2 text-center font-semibold w-12">İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={readOnly ? 3 : 4} className="px-4 py-8 text-center text-gray-500">
                      Henüz malzeme eklenmedi
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id} className="border-t">
                      <td className="px-4 py-2 border-r">
                        {readOnly ? (
                          material.material_type
                        ) : (
                          <div className="space-y-1.5">
                            <Select
                              value={material.product_id || "manual"}
                              onChange={(e) => {
                                const productId = e.target.value;
                                if (productId && productId !== "manual") {
                                  handleMaterialChange(material.id, "product_id", productId);
                                } else {
                                  // Manuel giriş seçildi
                                  handleMaterialChange(material.id, "product_id", "");
                                }
                              }}
                              className="h-8 text-sm"
                            >
                              <option value="manual">Manuel Giriş</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} {product.unit?.symbol ? `(${product.unit.symbol})` : ""}
                                </option>
                              ))}
                            </Select>
                            <Input
                              value={material.material_type}
                              onChange={(e) =>
                                handleMaterialTypeChange(material.id, e.target.value, material.product_id)
                              }
                              placeholder={material.product_id ? "Malzeme adı (depodan seçildi)" : "Malzeme cinsi (manuel giriş)"}
                              className="h-8 text-sm"
                              disabled={!!material.product_id && !!products.find(p => p.id === material.product_id)}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 border-r">
                        {readOnly ? (
                          material.quantity
                        ) : (
                          <Input
                            type="number"
                            value={material.quantity}
                            onChange={(e) =>
                              handleMaterialChange(material.id, "quantity", e.target.value)
                            }
                            placeholder="Miktar"
                            className="h-8 text-sm"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {readOnly ? (
                          material.unit
                        ) : (
                          <Input
                            value={material.unit}
                            onChange={(e) =>
                              handleMaterialChange(material.id, "unit", e.target.value)
                            }
                            placeholder="Adet, Metre, Kg vb."
                            className="h-8 text-sm"
                            disabled={!!material.product_id && !!products.find(p => p.id === material.product_id)?.unit}
                          />
                        )}
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
