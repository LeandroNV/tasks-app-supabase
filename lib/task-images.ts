const BUCKET = "task-images";

/** Extrae la ruta del objeto dentro del bucket a partir de la URL pública de Supabase Storage. */
export function taskImageStoragePath(
  publicUrl: string,
  userId: string,
): string | null {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    const rest = publicUrl.slice(idx + marker.length);
    const pathPart = decodeURIComponent(rest.split("?")[0] ?? "");
    if (!pathPart.startsWith(`${userId}/`)) return null;
    return pathPart;
  } catch {
    return null;
  }
}

export { BUCKET as TASK_IMAGES_BUCKET };
