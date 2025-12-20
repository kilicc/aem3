"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface MeterReadings {
  firstIndex: Record<string, string>;
  lastIndex: Record<string, string>;
  monthlyConsumption: Record<string, string>;
}

interface ControlChecklistItem {
  id: string;
  label: string;
  suitable?: boolean;
  notSuitable?: boolean;
  notRelevant?: boolean;
  explanation?: string;
}

interface GroundingMeasurement {
  protection?: string;
  operation?: string;
  suitable?: boolean;
  notSuitable?: boolean;
}

interface YegisFormAdditionalSectionsProps {
  // Meter readings
  meterReadings: MeterReadings;
  setMeterReadings: (readings: MeterReadings) => void;
  
  // Control ratios
  cosQValue: string;
  setCosQValue: (value: string) => void;
  cosQSuitable: boolean;
  setCosQSuitable: (value: boolean) => void;
  inductiveActiveRatio: string;
  setInductiveActiveRatio: (value: string) => void;
  inductiveActiveSuitable: boolean;
  setInductiveActiveSuitable: (value: boolean) => void;
  capacitiveActiveRatio: string;
  setCapacitiveActiveRatio: (value: string) => void;
  capacitiveActiveSuitable: boolean;
  setCapacitiveActiveSuitable: (value: boolean) => void;
  demantValue: string;
  setDemantValue: (value: string) => void;
  
  // Control checklist
  controlChecklist: Record<string, ControlChecklistItem>;
  setControlChecklist: (checklist: Record<string, ControlChecklistItem>) => void;
  
  // Grounding measurements
  groundingMeasurements: Record<string, GroundingMeasurement>;
  setGroundingMeasurements: (measurements: Record<string, GroundingMeasurement>) => void;
}

// Kontrol checklist maddeleri (PDF'den)
const CONTROL_CHECKLIST_ITEMS: Array<{ id: string; label: string }> = [
  { id: "enh_direkleri", label: "ENH direkleri ve izolatörleri" },
  { id: "parafudur", label: "Parafudur tesis durumu" },
  { id: "topraklama", label: "Topraklama techizat kontrolü" },
  { id: "yg_sigortaları", label: "Y.G. Sigortaları" },
  { id: "trafo_durumu", label: "Trafonun durumu, buşinglerde çatlak, kırık, yağ sızdırma vs.durumu" },
  { id: "olcu_bolumu", label: "Ölçü bölümü mühürleri ve pano" },
  { id: "akim_gerilim_trafo", label: "Akım Gerilim Trafoları" },
  { id: "olum_tehlikesi", label: "Ölüm Tehlikesi levhası ve korkuluk" },
  { id: "guvenlik_ekipman", label: "Güvenlik ekipmanları (izole eldiven, izole sehpa Y.G. gerilim)" },
  { id: "tek_hat_semasi", label: "Tek hat şeması, işletme talimatı" },
  { id: "tesis_emniyet", label: "Tesis emniyet mesafeleri" },
  { id: "trafo_merkez_genel", label: "Trafo merkezinin genel görünümü ve bütün kapıların kilitlenebilirliği" },
  { id: "kapilar_disa", label: "Bütün kapıların dışa doğru açılabilirliği" },
  { id: "yg_ag_pano", label: "YG ve AG Ana Panosu bölümünün durumu" },
  { id: "metal_aksam", label: "Trafo Merkezindeki bütün metal aksam topraklaması" },
  { id: "techizat_adres", label: "Bütün teçhizat adreslenmesi" },
  { id: "trafo_havalandirma", label: "Trafo odası havalandırması" },
  { id: "yanici_malzeme", label: "Trafo hücresi içinde yanıcı malzeme var mı?" },
  { id: "ayirici_manevra", label: "Ayırıcı manevra kolları, kilitleme tertibatı" },
  { id: "yagli_trafo", label: "Yağlı tip trafo ve genleşme kaplı ise slikajel durumu" },
  { id: "aku_redresor", label: "Aku ve Redresor kontrolu" },
];

export default function YegisFormAdditionalSections({
  meterReadings,
  setMeterReadings,
  cosQValue,
  setCosQValue,
  cosQSuitable,
  setCosQSuitable,
  inductiveActiveRatio,
  setInductiveActiveRatio,
  inductiveActiveSuitable,
  setInductiveActiveSuitable,
  capacitiveActiveRatio,
  setCapacitiveActiveRatio,
  capacitiveActiveSuitable,
  setCapacitiveActiveSuitable,
  demantValue,
  setDemantValue,
  controlChecklist,
  setControlChecklist,
  groundingMeasurements,
  setGroundingMeasurements,
}: YegisFormAdditionalSectionsProps) {
  const meterColumns = ["1.8.0", "1.8.1", "1.8.2", "1.8.3", "5.8.0", "8.8.0"];

  const updateChecklistItem = (id: string, field: keyof ControlChecklistItem, value: any) => {
    setControlChecklist({
      ...controlChecklist,
      [id]: {
        ...controlChecklist[id],
        id,
        label: CONTROL_CHECKLIST_ITEMS.find(item => item.id === id)?.label || "",
        [field]: value,
      },
    });
  };

  const updateGroundingMeasurement = (key: string, field: keyof GroundingMeasurement, value: any) => {
    setGroundingMeasurements({
      ...groundingMeasurements,
      [key]: {
        ...groundingMeasurements[key],
        [field]: value,
      },
    });
  };

  return (
    <>
      {/* Endeks/Sayaç Okumaları */}
      <Card>
        <CardHeader>
          <CardTitle>Endeks/Sayaç Okumaları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endeks</TableHead>
                  {meterColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">İlk Endeks</TableCell>
                  {meterColumns.map((key) => (
                    <TableCell key={key}>
                      <Input
                        type="number"
                        step="0.01"
                        value={meterReadings.firstIndex?.[key] || ""}
                        onChange={(e) => setMeterReadings({
                          ...meterReadings,
                          firstIndex: { ...meterReadings.firstIndex, [key]: e.target.value }
                        })}
                        className="w-full"
                      />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Son Endeks</TableCell>
                  {meterColumns.map((key) => (
                    <TableCell key={key}>
                      <Input
                        type="number"
                        step="0.01"
                        value={meterReadings.lastIndex?.[key] || ""}
                        onChange={(e) => setMeterReadings({
                          ...meterReadings,
                          lastIndex: { ...meterReadings.lastIndex, [key]: e.target.value }
                        })}
                        className="w-full"
                      />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Aya Ait Kont. Tüketim</TableCell>
                  {meterColumns.map((key) => (
                    <TableCell key={key}>
                      <Input
                        type="number"
                        step="0.01"
                        value={meterReadings.monthlyConsumption?.[key] || ""}
                        onChange={(e) => setMeterReadings({
                          ...meterReadings,
                          monthlyConsumption: { ...meterReadings.monthlyConsumption, [key]: e.target.value }
                        })}
                        className="w-full"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <input type="hidden" name="meter_readings" value={JSON.stringify(meterReadings)} />
        </CardContent>
      </Card>

      {/* Kontrol Oranları */}
      <Card>
        <CardHeader>
          <CardTitle>Kontroller Arası Endüktif ve Kapasitif Oranlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="cos_q_value">COS Q Değeri</Label>
                <Input
                  id="cos_q_value"
                  name="cos_q_value"
                  value={cosQValue}
                  onChange={(e) => setCosQValue(e.target.value)}
                  placeholder=">0,8"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="cos_q_suitable"
                  checked={cosQSuitable}
                  onChange={(e) => setCosQSuitable(e.target.checked)}
                />
                <Label htmlFor="cos_q_suitable" className="cursor-pointer">Uygun</Label>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="cos_q_not_suitable"
                  checked={!cosQSuitable && cosQValue !== ""}
                  onChange={(e) => setCosQSuitable(!e.target.checked)}
                />
                <Label htmlFor="cos_q_not_suitable" className="cursor-pointer">Uygun Değil</Label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="inductive_active_ratio">Endüktif / Aktif Oran</Label>
                <Input
                  id="inductive_active_ratio"
                  name="inductive_active_ratio"
                  value={inductiveActiveRatio}
                  onChange={(e) => setInductiveActiveRatio(e.target.value)}
                  placeholder="<20%"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="inductive_active_suitable"
                  checked={inductiveActiveSuitable}
                  onChange={(e) => setInductiveActiveSuitable(e.target.checked)}
                />
                <Label htmlFor="inductive_active_suitable" className="cursor-pointer">Uygun</Label>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="inductive_active_not_suitable"
                  checked={!inductiveActiveSuitable && inductiveActiveRatio !== ""}
                  onChange={(e) => setInductiveActiveSuitable(!e.target.checked)}
                />
                <Label htmlFor="inductive_active_not_suitable" className="cursor-pointer">Uygun Değil</Label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="capacitive_active_ratio">Kapasitif / Aktif Oran</Label>
                <Input
                  id="capacitive_active_ratio"
                  name="capacitive_active_ratio"
                  value={capacitiveActiveRatio}
                  onChange={(e) => setCapacitiveActiveRatio(e.target.value)}
                  placeholder="<15%"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="capacitive_active_suitable"
                  checked={capacitiveActiveSuitable}
                  onChange={(e) => setCapacitiveActiveSuitable(e.target.checked)}
                />
                <Label htmlFor="capacitive_active_suitable" className="cursor-pointer">Uygun</Label>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="capacitive_active_not_suitable"
                  checked={!capacitiveActiveSuitable && capacitiveActiveRatio !== ""}
                  onChange={(e) => setCapacitiveActiveSuitable(!e.target.checked)}
                />
                <Label htmlFor="capacitive_active_not_suitable" className="cursor-pointer">Uygun Değil</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="demant_value">DEMANT(1.6.0)</Label>
              <Input
                id="demant_value"
                name="demant_value"
                value={demantValue}
                onChange={(e) => setDemantValue(e.target.value)}
                placeholder="0.51 kv"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kontrol ve Tespitler */}
      <Card>
        <CardHeader>
          <CardTitle>Kontrol ve Tespitler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kontrol Noktası</TableHead>
                  <TableHead>Uygun</TableHead>
                  <TableHead>Uygun Değil</TableHead>
                  <TableHead>İlgili Değil</TableHead>
                  <TableHead>Açıklama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONTROL_CHECKLIST_ITEMS.map((item) => {
                  const checklistItem = controlChecklist[item.id] || { id: item.id, label: item.label };
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={checklistItem.suitable || false}
                          onChange={(e) => updateChecklistItem(item.id, "suitable", e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={checklistItem.notSuitable || false}
                          onChange={(e) => updateChecklistItem(item.id, "notSuitable", e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={checklistItem.notRelevant || false}
                          onChange={(e) => updateChecklistItem(item.id, "notRelevant", e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={checklistItem.explanation || ""}
                          onChange={(e) => updateChecklistItem(item.id, "explanation", e.target.value)}
                          placeholder="Açıklama"
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <input type="hidden" name="control_checklist" value={JSON.stringify(controlChecklist)} />
        </CardContent>
      </Card>

      {/* Topraklama */}
      <Card>
        <CardHeader>
          <CardTitle>Topraklama</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Öğe</TableHead>
                  <TableHead>Koruma</TableHead>
                  <TableHead>İşletme</TableHead>
                  <TableHead>Uygun</TableHead>
                  <TableHead>Uygun Değil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ADP</TableCell>
                  <TableCell>
                    <Input
                      value={groundingMeasurements.adp?.protection || ""}
                      onChange={(e) => updateGroundingMeasurement("adp", "protection", e.target.value)}
                      placeholder="<5"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={groundingMeasurements.adp?.operation || ""}
                      onChange={(e) => updateGroundingMeasurement("adp", "operation", e.target.value)}
                      placeholder="<2"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.adp?.suitable || false}
                      onChange={(e) => updateGroundingMeasurement("adp", "suitable", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.adp?.notSuitable || false}
                      onChange={(e) => updateGroundingMeasurement("adp", "notSuitable", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">PARAFUDR</TableCell>
                  <TableCell>
                    <Input
                      value={groundingMeasurements.parafudr?.protection || ""}
                      onChange={(e) => updateGroundingMeasurement("parafudr", "protection", e.target.value)}
                      placeholder="<1"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.parafudr?.suitable || false}
                      onChange={(e) => updateGroundingMeasurement("parafudr", "suitable", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.parafudr?.notSuitable || false}
                      onChange={(e) => updateGroundingMeasurement("parafudr", "notSuitable", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DİREK</TableCell>
                  <TableCell>
                    <Input
                      value={groundingMeasurements.direk?.protection || ""}
                      onChange={(e) => updateGroundingMeasurement("direk", "protection", e.target.value)}
                      placeholder="<5"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.direk?.suitable || false}
                      onChange={(e) => updateGroundingMeasurement("direk", "suitable", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.direk?.notSuitable || false}
                      onChange={(e) => updateGroundingMeasurement("direk", "notSuitable", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">KÖŞK</TableCell>
                  <TableCell>
                    <Input
                      value={groundingMeasurements.kosk?.protection || ""}
                      onChange={(e) => updateGroundingMeasurement("kosk", "protection", e.target.value)}
                      placeholder="<5"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.kosk?.suitable || false}
                      onChange={(e) => updateGroundingMeasurement("kosk", "suitable", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={groundingMeasurements.kosk?.notSuitable || false}
                      onChange={(e) => updateGroundingMeasurement("kosk", "notSuitable", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <input type="hidden" name="grounding_measurements" value={JSON.stringify(groundingMeasurements)} />
        </CardContent>
      </Card>
    </>
  );
}

