"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/actions/tasks/get-tasks";
import { deleteTask } from "@/actions/tasks/delete-task";
import type { Task } from "@/types/task";
import { TaskFilters } from "./TaskFilters";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

export function DashboardTasks() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreLock = useRef(false);

  const fetchFirstPage = useCallback(async () => {
    loadMoreLock.current = false;
    setLoading(true);
    const res = await getTasks({
      page: 0,
      pageSize: PAGE_SIZE,
      search: filters.search,
      status: filters.status,
      priority: filters.priority,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error, { duration: 4000 });
      setTasks([]);
      setHasMore(false);
      return;
    }
    setTasks(res.tasks);
    setHasMore(res.hasMore);
    setPage(0);
  }, [filters.search, filters.status, filters.priority]);

  useEffect(() => {
    void fetchFirstPage();
  }, [fetchFirstPage]);

  useEffect(() => {
    if (page === 0) return;

    let cancelled = false;
    const run = async () => {
      setLoadingMore(true);
      const f = filtersRef.current;
      try {
        const res = await getTasks({
          page,
          pageSize: PAGE_SIZE,
          search: f.search,
          status: f.status,
          priority: f.priority,
        });
        if (cancelled) return;
        if (!res.ok) {
          toast.error(res.error, { duration: 4000 });
          return;
        }
        setTasks((prev) => {
          const seen = new Set(prev.map((t) => t.id));
          const next = [...prev];
          for (const t of res.tasks) {
            if (!seen.has(t.id)) next.push(t);
          }
          return next;
        });
        setHasMore(res.hasMore);
      } finally {
        if (!cancelled) {
          setLoadingMore(false);
          loadMoreLock.current = false;
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          !first?.isIntersecting ||
          !hasMore ||
          loading ||
          loadingMore ||
          loadMoreLock.current
        ) {
          return;
        }
        loadMoreLock.current = true;
        setPage((p) => p + 1);
      },
      { root: null, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = async (task: Task) => {
    if (
      !window.confirm(
        `¿Eliminar la tarea «${task.title}»? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    const res = await deleteTask(task.id);
    if (!res.ok) {
      toast.error(res.error, { duration: 4000 });
      return;
    }
    toast.success("Tarea eliminada", { duration: 2500 });
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleSuccess = () => {
    void fetchFirstPage();
  };

  return (
    <div className="px-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
        <h1 className="text-lg font-semibold text-muted-foreground">
          Tus tareas
        </h1>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-2"
        >
          <Plus className="size-4" />
          Nueva tarea
        </Button>
      </div>

      <TaskFilters
        currentFilters={filters}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
        onStatusChange={(status) => setFilters((f) => ({ ...f, status }))}
        onPriorityChange={(priority) =>
          setFilters((f) => ({ ...f, priority }))
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No hay tareas con estos filtros. Crea una nueva o ajusta la búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-8 w-full shrink-0" aria-hidden />

      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <TaskForm
        isOpen={formOpen}
        onClose={handleFormClose}
        task={editingTask}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
