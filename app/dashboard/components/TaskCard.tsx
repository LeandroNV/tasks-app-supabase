import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Eye,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const statusConfig = {
  todo: {
    color: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Pendiente",
  },
  "in-progress": {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "En curso",
  },
  review: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Revisión",
  },
  done: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Completada",
  },
};

const priorityConfig = {
  low: {
    color: "text-blue-600 bg-blue-50",
    icon: <Clock size={18} />,
    label: "Baja",
  },
  medium: {
    color: "text-amber-600 bg-amber-50",
    icon: <AlertCircle size={18} />,
    label: "Media",
  },
  high: {
    color: "text-rose-600 bg-rose-50",
    icon: <AlertCircle size={18} />,
    label: "Alta",
  },
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  const desc = (task.description ?? "").trim();
  const descriptionPreview =
    desc.length === 0
      ? "Sin descripción detallada."
      : desc.length > 70
        ? `${desc.slice(0, 70)}...`
        : desc;

  return (
    <>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-card/50 backdrop-blur-sm flex flex-row md:flex-col h-auto md:h-full ring-1 ring-border/50 hover:ring-primary/20">
        {/* Content Container */}
        <div className="flex flex-col flex-1 min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0 text-[9px] uppercase font-bold",
                  status.color,
                )}
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-2 ">
                {priority.icon}
                <div>
                  <p className="text-xs opacity-50">Prioridad</p>
                  <div className="text-sm">{priority.label}</div>
                </div>
              </div>

              {task.image && (
                <button
                  onClick={() => setIsImageOpen(true)}
                  className="relative group/img overflow-hidden rounded-full focus:outline-none"
                  type="button"
                >
                  <Image
                    src={task.image}
                    alt={task.title}
                    width={100}
                    height={100}
                    loading="eager"
                    className="object-cover w-14 h-14 transition-transform duration-300 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <Maximize2 size={16} className="text-white" />
                  </div>
                </button>
              )}
            </div>

            <CardTitle className="text-sm md:text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {task.title}
            </CardTitle>
            <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
              {descriptionPreview}
            </p>
          </CardHeader>

          <CardFooter className="p-3 md:p-4 pt-2 md:pt-0 border-t border-border/10 mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center text-[10px] text-muted-foreground font-medium truncate">
              <Calendar size={12} className="mr-1 opacity-70 shrink-0" />
              {format(task.created_at, "d MMM", { locale: es })}
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 shadow-xs">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-7 md:w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsDetailsOpen(true)}
              >
                <Eye size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-7 md:w-7 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => onEdit(task)}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-7 md:w-7 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                onClick={() => onDelete(task)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>

      {/* Task Detail Dialog */}
      {/* Task Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent
          className={`${task.image ? "max-w-xl" : "max-w-md"} w-[97vw]`}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {task.title}
            </DialogTitle>
          </DialogHeader>
          <div
            className={`grid grid-cols-1 ${task.image ? "md:grid-cols-[minmax(0,1fr)_200px]" : ""} gap-6 py-4 items-start`}
          >
            <div className="space-y-6 min-w-0">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5 line-clamp-1">
                    Estado
                  </p>
                  <Badge
                    className={cn("px-2.5 py-0.5 text-[10px]", status.color)}
                  >
                    {status.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5 line-clamp-1">
                    Prioridad
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn("p-1.5 rounded-full", priority.color)}>
                      {priority.icon}
                    </span>
                    <span className="text-sm font-semibold">
                      {priority.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-full overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">
                  Descripción
                </p>
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap wrap-break-word w-full">
                  {task.description ||
                    "No hay una descripción proporcionada para esta tarea."}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 pt-4 border-t border-border/50">
                <Calendar size={12} />
                <span className="uppercase font-medium tracking-tight">
                  Creado el{" "}
                  {format(task.created_at, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
            </div>

            {task.image && (
              <button
                className="relative group cursor-zoom-in mt-2"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsImageOpen(true);
                }}
                type="button"
              >
                <Image
                  src={task.image}
                  alt={task.title}
                  width={300}
                  height={300}
                  className="rounded-xl object-cover w-full aspect-square shadow-md border border-border/50 hover:opacity-90 transition-all duration-300 group-hover:shadow-lg max-w-[200px]"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
                  <Maximize2 className="text-white" size={20} />
                </div>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog (Gallery Style) */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-5xl p-1 bg-transparent border-none shadow-none flex items-center justify-center">
          {task.image && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={task.image}
                alt={task.title}
                width={1200}
                height={1200}
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
