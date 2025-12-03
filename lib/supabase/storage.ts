import { createClient } from "./server";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ data: { path: string } | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Dosyayı yükle
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${user.id}/${path}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { data: null, error: error.message };
  }

  // Public URL al
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { data: { path: urlData.publicUrl }, error: null };
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Client-side için
export function getPublicUrlClient(bucket: string, path: string): string {
  const { createClient } = require("./client");
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
