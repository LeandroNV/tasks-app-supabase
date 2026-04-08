"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

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

  //* 2. Obtener URL pública de la imagen

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  if (!publicUrlData.publicUrl) {
    throw new Error("No se pudo obtener la URL pública de la imagen");
  }

  //* Versionar la URL con un timestamp fijo al momento de subida.
  //* Esto invalida el caché de Next.js Image cuando el avatar cambia,
  //* sin generar una URL nueva en cada render.
  const versionedUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  //* Actualizar el campo avatar en la tabla profiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: versionedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Error al actualizar el perfil:", {
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      code: updateError.code,
    });
    throw new Error(`Error al actualizar el perfil: ${updateError.message}`);
  }

  return { publicUrl: versionedUrl };
}
