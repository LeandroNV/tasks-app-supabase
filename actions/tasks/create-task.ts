"use server";

import { createClient } from "@/lib/supabase/server";
import { TASK_IMAGES_BUCKET } from "@/lib/task-images";
import { mapTaskRow, type Task, type TaskRow } from "@/types/task";

const STATUSES = ["todo", "in-progress", "review", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export type CreateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: string };

export async function createTask(formData: FormData): Promise<CreateTaskResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");

  if (!title) {
    return { ok: false, error: "El título es requerido" };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false, error: "Estado no válido" };
  }
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return { ok: false, error: "Prioridad no válida" };
  }

  let imageUrl: string | null = null;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(TASK_IMAGES_BUCKET)
      .upload(path, imageFile, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("createTask upload", uploadError);
      return { ok: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(TASK_IMAGES_BUCKET)
      .getPublicUrl(path);

    if (!publicUrlData?.publicUrl) {
      return { ok: false, error: "No se pudo obtener la URL de la imagen" };
    }
    imageUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: description || null,
      status,
      priority,
      user_id: user.id,
      created_at: now,
      updated_at: now,
      image: imageUrl,
    })
    .select(
      "id, title, description, status, priority, created_at, updated_at, user_id, image",
    )
    .single();

  if (error) {
    console.error("createTask insert", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, task: mapTaskRow(data as TaskRow) };
}
