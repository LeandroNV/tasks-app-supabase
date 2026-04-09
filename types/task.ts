export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: number;
  image: string | null;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  image: string | null;
}

export function mapTaskRow(row: TaskRow): Task {
  const created = row.created_at
    ? new Date(row.created_at).getTime()
    : Date.now();
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority,
    created_at: created,
    image: row.image,
  };
}
