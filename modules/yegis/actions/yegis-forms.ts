"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface YegisFormData {
  customer_id: string;
  form_number?: string;
  customer_name: string;
  customer_address?: string;
  customer_city?: string;
  customer_district?: string;
  customer_phone?: string;
  customer_tax_id?: string;
  customer_tax_office?: string;
  facility_name?: string;
  facility_address?: string;
  facility_city?: string;
  facility_district?: string;
  facility_phone?: string;
  transformer_power?: string;
  transformer_brand?: string;
  transformer_model?: string;
  transformer_serial_number?: string;
  transformer_manufacturing_year?: number;
  transformer_installation_date?: string;
  control_date: string;
  control_type?: string;
  next_control_date?: string;
  control_interval_months?: number;
  control_results?: any;
  measurements?: any;
  findings?: string;
  recommendations?: string;
  notes?: string;
  technician_signature?: string;
  technician_name?: string;
  technician_title?: string;
  technician_license_number?: string;
  customer_signature?: string;
  customer_representative_name?: string;
  customer_representative_title?: string;
  status?: string;
  created_by?: string;
}

export async function createYegisForm(formData: FormData) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz erişim" };
  }

  // Form numarası oluştur
  const { data: formNumberData } = await supabase.rpc("generate_yegis_form_number");
  const form_number = formNumberData || `YEGIS-${new Date().getFullYear()}-${Date.now()}`;

  // Kontrol tarihine göre next_control_date hesapla (1 ay sonra)
  const controlDate = formData.get("control_date") as string;
  let nextControlDate: string | undefined;
  if (controlDate) {
    const controlDateObj = new Date(controlDate);
    controlDateObj.setMonth(controlDateObj.getMonth() + 1);
    nextControlDate = controlDateObj.toISOString().split("T")[0];
  }
  // Eğer formData'da next_control_date varsa onu kullan, yoksa otomatik hesaplananı kullan
  const providedNextControlDate = formData.get("next_control_date") as string;
  const finalNextControlDate = providedNextControlDate || nextControlDate;

  const yegisForm: Partial<YegisFormData> = {
    customer_id: formData.get("customer_id") as string,
    form_number,
    customer_name: formData.get("customer_name") as string,
    customer_address: formData.get("customer_address") as string || undefined,
    customer_city: formData.get("customer_city") as string || undefined,
    customer_district: formData.get("customer_district") as string || undefined,
    customer_phone: formData.get("customer_phone") as string || undefined,
    customer_tax_id: formData.get("customer_tax_id") as string || undefined,
    customer_tax_office: formData.get("customer_tax_office") as string || undefined,
    facility_name: formData.get("facility_name") as string || undefined,
    facility_address: formData.get("facility_address") as string || undefined,
    facility_city: formData.get("facility_city") as string || undefined,
    facility_district: formData.get("facility_district") as string || undefined,
    facility_phone: formData.get("facility_phone") as string || undefined,
    transformer_power: formData.get("transformer_power") as string || undefined,
    transformer_brand: formData.get("transformer_brand") as string || undefined,
    transformer_model: formData.get("transformer_model") as string || undefined,
    transformer_serial_number: formData.get("transformer_serial_number") as string || undefined,
    transformer_manufacturing_year: formData.get("transformer_manufacturing_year") ? parseInt(formData.get("transformer_manufacturing_year") as string) : undefined,
    transformer_installation_date: formData.get("transformer_installation_date") as string || undefined,
    control_date: formData.get("control_date") as string,
    control_type: formData.get("control_type") as string || undefined,
    next_control_date: formData.get("next_control_date") as string || undefined,
    control_interval_months: formData.get("control_interval_months") ? parseInt(formData.get("control_interval_months") as string) : undefined,
    findings: formData.get("findings") as string || undefined,
    recommendations: formData.get("recommendations") as string || undefined,
    notes: formData.get("notes") as string || undefined,
    technician_signature: formData.get("technician_signature") as string || undefined,
    technician_name: formData.get("technician_name") as string || undefined,
    technician_title: formData.get("technician_title") as string || undefined,
    technician_license_number: formData.get("technician_license_number") as string || undefined,
    customer_signature: formData.get("customer_signature") as string || undefined,
    customer_representative_name: formData.get("customer_representative_name") as string || undefined,
    customer_representative_title: formData.get("customer_representative_title") as string || undefined,
    status: (formData.get("status") as string) || "draft",
    created_by: user.id,
  };

  // JSONB alanları
  const controlResultsStr = formData.get("control_results");
  if (controlResultsStr) {
    try {
      yegisForm.control_results = JSON.parse(controlResultsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const measurementsStr = formData.get("measurements");
  if (measurementsStr) {
    try {
      yegisForm.measurements = JSON.parse(measurementsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  // Yeni JSONB alanları
  const meterReadingsStr = formData.get("meter_readings");
  if (meterReadingsStr) {
    try {
      (yegisForm as any).meter_readings = JSON.parse(meterReadingsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const controlChecklistStr = formData.get("control_checklist");
  if (controlChecklistStr) {
    try {
      (yegisForm as any).control_checklist = JSON.parse(controlChecklistStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const groundingMeasurementsStr = formData.get("grounding_measurements");
  if (groundingMeasurementsStr) {
    try {
      (yegisForm as any).grounding_measurements = JSON.parse(groundingMeasurementsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  // Yeni alanlar
  (yegisForm as any).tm_number = formData.get("tm_number") as string || undefined;
  (yegisForm as any).installation_number = formData.get("installation_number") as string || undefined;
  (yegisForm as any).meter_multiplier = formData.get("meter_multiplier") as string || undefined;
  (yegisForm as any).transformer_voltage = formData.get("transformer_voltage") as string || undefined;
  (yegisForm as any).center_type = formData.get("center_type") as string || undefined;
  (yegisForm as any).cos_q_value = formData.get("cos_q_value") as string || undefined;
  (yegisForm as any).cos_q_suitable = formData.get("cos_q_suitable") === "true" || formData.get("cos_q_suitable") === "on" || false;
  (yegisForm as any).inductive_active_ratio = formData.get("inductive_active_ratio") as string || undefined;
  (yegisForm as any).inductive_active_suitable = formData.get("inductive_active_suitable") === "true" || formData.get("inductive_active_suitable") === "on" || false;
  (yegisForm as any).capacitive_active_ratio = formData.get("capacitive_active_ratio") as string || undefined;
  (yegisForm as any).capacitive_active_suitable = formData.get("capacitive_active_suitable") === "true" || formData.get("capacitive_active_suitable") === "on" || false;
  (yegisForm as any).demant_value = formData.get("demant_value") as string || undefined;

  const { data, error } = await supabase
    .from("yegis_forms")
    .insert(yegisForm)
    .select()
    .single();

  if (error) {
    console.error("YEGİS form oluşturma hatası:", error);
    return { error: error.message };
  }

  // YEGİS form oluşturulduğunda bildirim gönder
  if (data?.id) {
    try {
      const { notifyYegisFormCreated } = await import("@/modules/bildirim/actions/yegis-notifications");
      await notifyYegisFormCreated(data.id);
    } catch (notifError) {
      console.error("YEGİS bildirim gönderme hatası:", notifError);
      // Bildirim hatası form oluşturmayı engellemez
    }
  }

  revalidatePath("/yegis");
  return { data, error: null };
}

export async function updateYegisForm(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz erişim" };
  }

  const yegisForm: Partial<YegisFormData> = {
    customer_id: formData.get("customer_id") as string,
    customer_name: formData.get("customer_name") as string,
    customer_address: formData.get("customer_address") as string || undefined,
    customer_city: formData.get("customer_city") as string || undefined,
    customer_district: formData.get("customer_district") as string || undefined,
    customer_phone: formData.get("customer_phone") as string || undefined,
    customer_tax_id: formData.get("customer_tax_id") as string || undefined,
    customer_tax_office: formData.get("customer_tax_office") as string || undefined,
    facility_name: formData.get("facility_name") as string || undefined,
    facility_address: formData.get("facility_address") as string || undefined,
    facility_city: formData.get("facility_city") as string || undefined,
    facility_district: formData.get("facility_district") as string || undefined,
    facility_phone: formData.get("facility_phone") as string || undefined,
    transformer_power: formData.get("transformer_power") as string || undefined,
    transformer_brand: formData.get("transformer_brand") as string || undefined,
    transformer_model: formData.get("transformer_model") as string || undefined,
    transformer_serial_number: formData.get("transformer_serial_number") as string || undefined,
    transformer_manufacturing_year: formData.get("transformer_manufacturing_year") ? parseInt(formData.get("transformer_manufacturing_year") as string) : undefined,
    transformer_installation_date: formData.get("transformer_installation_date") as string || undefined,
    control_date: formData.get("control_date") as string,
    control_type: formData.get("control_type") as string || undefined,
    next_control_date: formData.get("next_control_date") as string || undefined,
    control_interval_months: formData.get("control_interval_months") ? parseInt(formData.get("control_interval_months") as string) : undefined,
    findings: formData.get("findings") as string || undefined,
    recommendations: formData.get("recommendations") as string || undefined,
    notes: formData.get("notes") as string || undefined,
    technician_signature: formData.get("technician_signature") as string || undefined,
    technician_name: formData.get("technician_name") as string || undefined,
    technician_title: formData.get("technician_title") as string || undefined,
    technician_license_number: formData.get("technician_license_number") as string || undefined,
    customer_signature: formData.get("customer_signature") as string || undefined,
    customer_representative_name: formData.get("customer_representative_name") as string || undefined,
    customer_representative_title: formData.get("customer_representative_title") as string || undefined,
    status: (formData.get("status") as string) || "draft",
  };

  // JSONB alanları
  const controlResultsStr = formData.get("control_results");
  if (controlResultsStr) {
    try {
      yegisForm.control_results = JSON.parse(controlResultsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const measurementsStr = formData.get("measurements");
  if (measurementsStr) {
    try {
      yegisForm.measurements = JSON.parse(measurementsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  // Yeni JSONB alanları
  const meterReadingsStr = formData.get("meter_readings");
  if (meterReadingsStr) {
    try {
      (yegisForm as any).meter_readings = JSON.parse(meterReadingsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const controlChecklistStr = formData.get("control_checklist");
  if (controlChecklistStr) {
    try {
      (yegisForm as any).control_checklist = JSON.parse(controlChecklistStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  const groundingMeasurementsStr = formData.get("grounding_measurements");
  if (groundingMeasurementsStr) {
    try {
      (yegisForm as any).grounding_measurements = JSON.parse(groundingMeasurementsStr as string);
    } catch (e) {
      // JSON parse hatası
    }
  }

  // Yeni alanlar
  (yegisForm as any).tm_number = formData.get("tm_number") as string || undefined;
  (yegisForm as any).installation_number = formData.get("installation_number") as string || undefined;
  (yegisForm as any).meter_multiplier = formData.get("meter_multiplier") as string || undefined;
  (yegisForm as any).transformer_voltage = formData.get("transformer_voltage") as string || undefined;
  (yegisForm as any).center_type = formData.get("center_type") as string || undefined;
  (yegisForm as any).cos_q_value = formData.get("cos_q_value") as string || undefined;
  (yegisForm as any).cos_q_suitable = formData.get("cos_q_suitable") === "true" || formData.get("cos_q_suitable") === "on" || false;
  (yegisForm as any).inductive_active_ratio = formData.get("inductive_active_ratio") as string || undefined;
  (yegisForm as any).inductive_active_suitable = formData.get("inductive_active_suitable") === "true" || formData.get("inductive_active_suitable") === "on" || false;
  (yegisForm as any).capacitive_active_ratio = formData.get("capacitive_active_ratio") as string || undefined;
  (yegisForm as any).capacitive_active_suitable = formData.get("capacitive_active_suitable") === "true" || formData.get("capacitive_active_suitable") === "on" || false;
  (yegisForm as any).demant_value = formData.get("demant_value") as string || undefined;

  const { data, error } = await supabase
    .from("yegis_forms")
    .update(yegisForm)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("YEGİS form güncelleme hatası:", error);
    return { error: error.message };
  }

  revalidatePath("/yegis");
  revalidatePath(`/yegis/${id}`);
  return { data, error: null };
}

export async function deleteYegisForm(id: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz erişim" };
  }

  const { error } = await supabase
    .from("yegis_forms")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("YEGİS form silme hatası:", error);
    return { error: error.message };
  }

  revalidatePath("/yegis");
  return { error: null };
}

export async function getYegisForm(id: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Yetkisiz erişim" };
  }

  const { data, error } = await supabase
    .from("yegis_forms")
    .select(`
      *,
      customer:customers(id, name, tax_id, tax_office, phone, address, city, district),
      creator:profiles!yegis_forms_created_by_fkey(id, full_name, email)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("YEGİS form getirme hatası:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getYegisForms() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: "Yetkisiz erişim" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("yegis_forms")
    .select(`
      *,
      customer:customers(id, name, tax_id, tax_office, phone, address, city, district),
      creator:profiles!yegis_forms_created_by_fkey(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Admin tüm formları görebilir, kullanıcılar sadece kendi oluşturduklarını
  if (profile?.role !== "admin") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("YEGİS formları getirme hatası:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

