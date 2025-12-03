"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const userId = formData.get("user_id") as string | null;
  const employeeNumber = formData.get("employee_number") as string | null;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const tcIdentityNumber = formData.get("tc_identity_number") as string | null;
  const birthDate = formData.get("birth_date") as string | null;
  const birthPlace = formData.get("birth_place") as string | null;
  const gender = formData.get("gender") as string | null;
  const maritalStatus = formData.get("marital_status") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string | null;
  const city = formData.get("city") as string | null;
  const district = formData.get("district") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const emergencyContactName = formData.get("emergency_contact_name") as string | null;
  const emergencyContactPhone = formData.get("emergency_contact_phone") as string | null;
  const emergencyContactRelation = formData.get("emergency_contact_relation") as string | null;
  const hireDate = formData.get("hire_date") as string | null;
  const terminationDate = formData.get("termination_date") as string | null;
  const department = formData.get("department") as string | null;
  const position = formData.get("position") as string | null;
  const salary = formData.get("salary") ? parseFloat(formData.get("salary") as string) : null;
  const bankName = formData.get("bank_name") as string | null;
  const bankAccountNumber = formData.get("bank_account_number") as string | null;
  const iban = formData.get("iban") as string | null;
  const bloodType = formData.get("blood_type") as string | null;
  const drivingLicenseNumber = formData.get("driving_license_number") as string | null;
  const drivingLicenseClass = formData.get("driving_license_class") as string | null;
  const educationLevel = formData.get("education_level") as string | null;
  const schoolName = formData.get("school_name") as string | null;
  const graduationYear = formData.get("graduation_year") ? parseInt(formData.get("graduation_year") as string) : null;
  const notes = formData.get("notes") as string | null;
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === null;

  if (!firstName || firstName.trim() === "") {
    return { error: "Ad gereklidir" };
  }
  if (!lastName || lastName.trim() === "") {
    return { error: "Soyad gereklidir" };
  }

  // Eğer user_id seçildiyse, o kullanıcının zaten bir çalışan kaydı olup olmadığını kontrol et
  if (userId) {
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingEmployee) {
      return { error: "Bu kullanıcının zaten bir çalışan kaydı var" };
    }
  }

  const { data, error } = await supabase
    .from("employees")
    .insert({
      user_id: userId || null,
      employee_number: employeeNumber?.trim() || null,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      tc_identity_number: tcIdentityNumber?.trim() || null,
      birth_date: birthDate || null,
      birth_place: birthPlace?.trim() || null,
      gender: gender || null,
      marital_status: maritalStatus || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      district: district?.trim() || null,
      postal_code: postalCode?.trim() || null,
      emergency_contact_name: emergencyContactName?.trim() || null,
      emergency_contact_phone: emergencyContactPhone?.trim() || null,
      emergency_contact_relation: emergencyContactRelation?.trim() || null,
      hire_date: hireDate || null,
      termination_date: terminationDate || null,
      department: department?.trim() || null,
      position: position?.trim() || null,
      salary,
      bank_name: bankName?.trim() || null,
      bank_account_number: bankAccountNumber?.trim() || null,
      iban: iban?.trim() || null,
      blood_type: bloodType || null,
      driving_license_number: drivingLicenseNumber?.trim() || null,
      driving_license_class: drivingLicenseClass?.trim() || null,
      education_level: educationLevel || null,
      school_name: schoolName?.trim() || null,
      graduation_year: graduationYear,
      notes: notes?.trim() || null,
      is_active: isActive,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("employee_number")) {
        return { error: "Bu personel numarası zaten kayıtlı" };
      }
      if (error.message.includes("tc_identity_number")) {
        return { error: "Bu T.C. Kimlik No zaten kayıtlı" };
      }
      if (error.message.includes("user_id")) {
        return { error: "Bu kullanıcının zaten bir çalışan kaydı var" };
      }
    }
    return { error: error.message };
  }

  revalidatePath("/calisanlar");
  return { data };
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const userId = formData.get("user_id") as string | null;
  const employeeNumber = formData.get("employee_number") as string | null;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const tcIdentityNumber = formData.get("tc_identity_number") as string | null;
  const birthDate = formData.get("birth_date") as string | null;
  const birthPlace = formData.get("birth_place") as string | null;
  const gender = formData.get("gender") as string | null;
  const maritalStatus = formData.get("marital_status") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string | null;
  const city = formData.get("city") as string | null;
  const district = formData.get("district") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const emergencyContactName = formData.get("emergency_contact_name") as string | null;
  const emergencyContactPhone = formData.get("emergency_contact_phone") as string | null;
  const emergencyContactRelation = formData.get("emergency_contact_relation") as string | null;
  const hireDate = formData.get("hire_date") as string | null;
  const terminationDate = formData.get("termination_date") as string | null;
  const department = formData.get("department") as string | null;
  const position = formData.get("position") as string | null;
  const salary = formData.get("salary") ? parseFloat(formData.get("salary") as string) : null;
  const bankName = formData.get("bank_name") as string | null;
  const bankAccountNumber = formData.get("bank_account_number") as string | null;
  const iban = formData.get("iban") as string | null;
  const bloodType = formData.get("blood_type") as string | null;
  const drivingLicenseNumber = formData.get("driving_license_number") as string | null;
  const drivingLicenseClass = formData.get("driving_license_class") as string | null;
  const educationLevel = formData.get("education_level") as string | null;
  const schoolName = formData.get("school_name") as string | null;
  const graduationYear = formData.get("graduation_year") ? parseInt(formData.get("graduation_year") as string) : null;
  const notes = formData.get("notes") as string | null;
  const isActive = formData.get("is_active") === "true";

  if (!firstName || firstName.trim() === "") {
    return { error: "Ad gereklidir" };
  }
  if (!lastName || lastName.trim() === "") {
    return { error: "Soyad gereklidir" };
  }

  // Eğer user_id değiştiriliyorsa, yeni user_id'nin zaten bir çalışan kaydı olup olmadığını kontrol et
  if (userId) {
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", userId)
      .neq("id", id)
      .single();

    if (existingEmployee) {
      return { error: "Bu kullanıcının zaten bir çalışan kaydı var" };
    }
  }

  const { data, error } = await supabase
    .from("employees")
    .update({
      user_id: userId || null,
      employee_number: employeeNumber?.trim() || null,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      tc_identity_number: tcIdentityNumber?.trim() || null,
      birth_date: birthDate || null,
      birth_place: birthPlace?.trim() || null,
      gender: gender || null,
      marital_status: maritalStatus || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      district: district?.trim() || null,
      postal_code: postalCode?.trim() || null,
      emergency_contact_name: emergencyContactName?.trim() || null,
      emergency_contact_phone: emergencyContactPhone?.trim() || null,
      emergency_contact_relation: emergencyContactRelation?.trim() || null,
      hire_date: hireDate || null,
      termination_date: terminationDate || null,
      department: department?.trim() || null,
      position: position?.trim() || null,
      salary,
      bank_name: bankName?.trim() || null,
      bank_account_number: bankAccountNumber?.trim() || null,
      iban: iban?.trim() || null,
      blood_type: bloodType || null,
      driving_license_number: drivingLicenseNumber?.trim() || null,
      driving_license_class: drivingLicenseClass?.trim() || null,
      education_level: educationLevel || null,
      school_name: schoolName?.trim() || null,
      graduation_year: graduationYear,
      notes: notes?.trim() || null,
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("employee_number")) {
        return { error: "Bu personel numarası zaten kayıtlı" };
      }
      if (error.message.includes("tc_identity_number")) {
        return { error: "Bu T.C. Kimlik No zaten kayıtlı" };
      }
      if (error.message.includes("user_id")) {
        return { error: "Bu kullanıcının zaten bir çalışan kaydı var" };
      }
    }
    return { error: error.message };
  }

  revalidatePath("/calisanlar");
  revalidatePath(`/calisanlar/${id}`);
  return { data };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/calisanlar");
  return { success: true };
}

