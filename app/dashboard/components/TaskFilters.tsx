import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Filter } from "lucide-react";
import { Searchbar } from "@/components/Searchbar";

export type Status = "todo" | "in-progress" | "review" | "done";

interface TaskFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  currentFilters: {
    search: string;
    status: string;
    priority: string;
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function TaskFilters({
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  currentFilters,
}: TaskFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search);
  const debouncedSearch = useDebounce(searchTerm, 1000);

  // Sync local state with currentFilters.search if it changes externally
  useEffect(() => {
    setSearchTerm(currentFilters.search);
  }, [currentFilters.search]);

  // Trigger onSearchChange when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== currentFilters.search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, currentFilters.search]);

  return (
    <div className="grid grid-cols-12 gap-4 pb-8">
      <div className="col-span-12 md:col-span-8 lg:col-span-8 space-y-2">
        <label
          htmlFor="task-filters-search"
          className="text-sm font-medium flex items-center gap-2"
        >
          Buscar por título o descripción
        </label>
        <Searchbar
          id="task-filters-search"
          placeholder="Escribe para buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="col-span-12 md:col-span-4 lg:col-span-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="space-y-2 col-span-6">
            <label
              htmlFor="task-filters-status"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Filter size={16} /> Estado
            </label>
            <Select
              value={currentFilters.status}
              onValueChange={onStatusChange}
            >
              <SelectTrigger id="task-filters-status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="todo">Pendiente</SelectItem>
                <SelectItem value="in-progress">En curso</SelectItem>
                <SelectItem value="review">En revisión</SelectItem>
                <SelectItem value="done">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-6">
            <label
              htmlFor="task-filters-priority"
              className="text-sm font-medium flex items-center gap-2 truncate"
            >
              Prioridad
            </label>
            <Select
              value={currentFilters.priority}
              onValueChange={onPriorityChange}
            >
              <SelectTrigger id="task-filters-priority">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
