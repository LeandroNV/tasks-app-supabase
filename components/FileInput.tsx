"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X, AlertCircle } from "lucide-react";

export interface FileInputProps {
  /** Tipos de archivo aceptados (ej: "image/*,.pdf") */
  accept?: string;
  /** Tamaño máximo en MB */
  maxSize?: number;
  /** Múltiples archivos */
  multiple?: boolean;
  /** Callback cuando se seleccionan archivos */
  onFilesSelected?: (files: File[]) => void;
  /** Texto del placeholder */
  placeholder?: string;
  /** Clases adicionales */
  className?: string;
  /** Archivos seleccionados inicialmente */
  defaultFiles?: File[];
  /** Deshabilitar el input */
  disabled?: boolean;
  /** URL de imagen inicial para precargar (útil para edición) */
  initialImageUrl?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  error?: string;
}

export function FileInput({
  accept = "*/*",
  maxSize = 10, // 10MB por defecto
  multiple = false,
  onFilesSelected,
  placeholder = "Arrastra archivos aquí o haz clic para seleccionar",
  className,
  defaultFiles = [],
  disabled = false,
  initialImageUrl,
}: FileInputProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(defaultFiles);

  // Sincronizar solo cuando cambia la URL inicial (p. ej. otra tarea). No depender de
  // files.length: si el usuario borra la imagen, files queda [] y no debe reaparecer la remota.
  React.useEffect(() => {
    if (!initialImageUrl) {
      setFiles([]);
      return;
    }

    const initialFile = {
      name: "",
      size: 0,
      type: "image/remote",
      preview: initialImageUrl,
    } as unknown as FileWithPreview;

    setFiles([initialFile]);
  }, [initialImageUrl]);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crear previews para imágenes
  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        // Validar tamaño
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          errors.push(`${file.name} excede el tamaño máximo de ${maxSize}MB`);
          return;
        }

        // Validar tipo de archivo si hay un accept específico
        if (accept !== "*/*") {
          const acceptTypes = accept.split(",").map((type) => type.trim());
          const isValid = acceptTypes.some((type) => {
            if (type.startsWith(".")) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            return file.type.match(type.replace("*", ".*"));
          });

          if (!isValid) {
            errors.push(`${file.name} no es un tipo de archivo válido`);
            return;
          }
        }

        const fileWithPreview: FileWithPreview = file;

        // Crear preview para imágenes
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        newFiles.push(fileWithPreview);
      });

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      return { newFiles, errors };
    },
    [accept, maxSize],
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const { newFiles, errors } = processFiles(fileList);

      if (newFiles.length === 0) return;

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);

      if (onFilesSelected) {
        onFilesSelected(updatedFiles);
      }

      if (errors.length === 0) {
        setError(null);
      }
    },
    [files, multiple, onFilesSelected, processFiles],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      handleFiles(fileList);
    }
    // Reset input para permitir seleccionar el mismo archivo otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    // Liberar URLs de preview
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview!);
    }

    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  };

  const clearAll = () => {
    // Liberar todas las URLs de preview
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setFiles([]);
    if (onFilesSelected) {
      onFilesSelected([]);
    }
    setError(null);
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return (
        <div className="w-16 h-16 rounded overflow-hidden">
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    const iconClasses = "text-muted-foreground";
    switch (extension) {
      case "pdf":
        return <File className={cn(iconClasses, "text-red-500")} size={20} />;
      case "doc":
      case "docx":
        return <File className={cn(iconClasses, "text-blue-500")} size={20} />;
      case "xls":
      case "xlsx":
        return <File className={cn(iconClasses, "text-green-500")} size={20} />;
      default:
        return <File className={iconClasses} size={20} />;
    }
  };

  return (
    <div className={cn("space-y-1 mt-4", className)}>
      {files.length > 0 && (
        <div className="flex justify-end py-2">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            disabled={disabled}
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={cn(
          "relative border-2 border-dashed bg-background rounded-lg px-2 py-4 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {files.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Archivos seleccionados ({files.length})
              </h4>
            </div>

            <div className={`grid gap-2 grid-cols-3 lg:grid-cols-4`}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-center p-3 rounded-lg border"
                >
                  <div className="text-center min-w-full">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className=" hover:bg-muted rounded"
                        disabled={disabled}
                      >
                        <X size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {file.name && (
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                      )}
                      {file.size > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{placeholder}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tipos permitidos: {accept === "*/*" ? "Todos" : accept}
              </p>
              <p className="text-xs text-muted-foreground">
                Tamaño máximo: {maxSize}MB por archivo
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
