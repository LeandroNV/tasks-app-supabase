"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  const userId = formData.get("userId") as String;

  //* 1. Subir la imagen al bucket de avatares
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error al subir imagen:", uploadError);
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }
}
