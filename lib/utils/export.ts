import * as XLSX from "xlsx";

// Excel export utility
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel export için özel format (Teknik Servis Formu)
export function exportTechnicalServiceFormToExcel(
  formData: any,
  workOrderNumber: string,
  filename: string
) {
  // Yeni workbook oluştur
  const wb = XLSX.utils.book_new();
  
  // Veri dizisi oluştur
  const data: any[][] = [];
  
  // Başlık
  data.push(["ARIZA BAKIM VE MALZEME SİPARİŞ FİŞİ"]);
  data.push([]);
  
  // Form bilgileri (iki sütunlu format)
  data.push(["Form No", workOrderNumber || formData.form_number || ""]);
  data.push(["Tarih", formData.date || ""]);
  data.push(["SAYIN", formData.sayin || ""]);
  data.push(["TEL.", formData.phone || ""]);
  data.push(["ADRES", formData.address || ""]);
  data.push(["T.C.V.NO.-V.D.", formData.tax_id || ""]);
  data.push(["İŞE BAŞLAMA SAATİ", formData.start_time || ""]);
  data.push(["BİTİŞ SAATİ", formData.end_time || ""]);
  data.push(["PERSONEL", formData.personnel || ""]);
  data.push(["NOT", formData.note || ""]);
  data.push([]);
  
  // Malzeme listesi başlığı
  data.push(["MALZEME LİSTESİ"]);
  data.push([]);
  
  // Malzeme listesi tablo başlıkları
  data.push(["Sıra", "MALZEME CİNSİ", "MİKTAR", "BİRİM (AD./MT.)"]);
  
  // Malzeme listesi verileri
  if (formData.materials && Array.isArray(formData.materials) && formData.materials.length > 0) {
    formData.materials.forEach((m: any, index: number) => {
      data.push([
        index + 1,
        m.material_type || "",
        m.quantity || "",
        m.unit || "",
      ]);
    });
  } else {
    data.push([1, "Malzeme eklenmemiş", "", ""]);
  }
  
  // Worksheet oluştur
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Sütun genişliklerini ayarla
  ws["!cols"] = [
    { wch: 20 }, // Form No, Tarih vb. için
    { wch: 40 }, // Değerler için
    { wch: 15 }, // Miktar için
    { wch: 15 }, // Birim için
  ];
  
  // İlk satırı (başlık) kalın yap
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }
  
  // Malzeme listesi başlık satırını kalın yap
  const materialHeaderRow = data.findIndex((row) => row[0] === "MALZEME LİSTESİ") + 1;
  if (ws[`A${materialHeaderRow}`]) {
    ws[`A${materialHeaderRow}`].s = {
      font: { bold: true },
    };
  }
  
  // Malzeme tablo başlıklarını kalın yap
  const tableHeaderRow = materialHeaderRow + 2;
  ["A", "B", "C", "D"].forEach((col) => {
    const cell = ws[`${col}${tableHeaderRow}`];
    if (cell) {
      cell.s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
      };
    }
  });
  
  // Workbook'a worksheet ekle
  XLSX.utils.book_append_sheet(wb, ws, "Teknik Servis Formu");
  
  // Excel dosyasını indir
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToExcel(data: any[], filename: string) {
  // CSV olarak export (Excel açabilir)
  exportToCSV(data, filename);
}

export function printTable(tableId: string) {
  const printContents = document.getElementById(tableId)?.innerHTML;
  if (!printContents) return;

  const originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
}
