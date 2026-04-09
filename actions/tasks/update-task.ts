"use server";

import { createClient } from "@/lib/supabase/server";
import { TASK_IMAGES_BUCKET, taskImageStoragePath } from "@/lib/task-images";
import { mapTaskRow, type Task, type TaskRow } from "@/types/task";

const STATUSES = ["todo", "in-progress", "review", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export type UpdateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: string };

export async function updateTask(formData: FormData): Promise<UpdateTaskResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado" };
  }

  const userId = user.id;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Falta el id de la tarea" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const removeImage = formData.get("removeImage") === "true";

  if (!title) {
    return { ok: false, error: "El título es requerido" };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false, error: "Estado no válido" };
  }
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return { ok: false, error: "Prioridad no válida" };
  }

  const { data: current, error: fetchError } = await supabase
    .from("tasks")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return { ok: false, error: fetchError?.message ?? "Tarea no encontrada" };
  }

  const imageFile = formData.get("image");
  const hasNewFile = imageFile instanceof File && imageFile.size > 0;

  let imageUrl: string | null =
    (current as { image: string | null }).image ?? null;

  async function removeStoredObject(url: string | null) {
    if (!url) return;
    const oldPath = taskImageStoragePath(url, userId);
    if (oldPath) {
      await supabase.storage.from(TASK_IMAGES_BUCKET).remove([oldPath]);
    }
  }

  if (hasNewFile) {
    await removeStoredObject(imageUrl);

    const file = imageFile as File;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(TASK_IMAGES_BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("updateTask upload", uploadError);
      return { ok: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(TASK_IMAGES_BUCKET)
      .getPublicUrl(path);

    if (!publicUrlData?.publicUrl) {
      return { ok: false, error: "No se pudo obtener la URL de la imagen" };
    }
    imageUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  } else if (removeImage) {
    await removeStoredObject(imageUrl);
    imageUrl = null;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || null,
      status,
      priority,
      updated_at: now,
      image: imageUrl,
    })
    .eq("id", id)
    .select(
      "id, title, description, status, priority, created_at, updated_at, user_id, image",
    )
    .single();

  if (error) {
    console.error("updateTask", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, task: mapTaskRow(data as TaskRow) };
}
