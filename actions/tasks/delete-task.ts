"use server";

import { createClient } from "@/lib/supabase/server";
import { TASK_IMAGES_BUCKET, taskImageStoragePath } from "@/lib/task-images";

export type DeleteTaskResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteTask(taskId: string): Promise<DeleteTaskResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado" };
  }

  const id = taskId.trim();
  if (!id) {
    return { ok: false, error: "Falta el id de la tarea" };
  }

  const { data: row, error: fetchError } = await supabase
    .from("tasks")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Tarea no encontrada" };
  }

  const imageUrl = (row as { image: string | null }).image;
  if (imageUrl) {
    const path = taskImageStoragePath(imageUrl, user.id);
    if (path) {
      await supabase.storage.from(TASK_IMAGES_BUCKET).remove([path]);
    }
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("deleteTask", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
