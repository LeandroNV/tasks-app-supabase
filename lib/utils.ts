import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//* Función para obtener la URL de la imagen. Pasar bustCache=true solo cuando
//* se acaba de subir una imagen nueva, para forzar recarga sin romper el caché habitual.
export const getImageUrl = (url: string, bustCache = false) => {
  if (!url) return "";
  return bustCache ? `${url}?t=${Date.now()}` : url;
};
