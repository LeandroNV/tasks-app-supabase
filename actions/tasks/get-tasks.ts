"use server";

import { createClient } from "@/lib/supabase/server";
import { mapTaskRow, type Task, type TaskRow } from "@/types/task";

function escapeIlike(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export type GetTasksParams = {
  page: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
};

export type GetTasksResult =
  | { ok: true; tasks: Task[]; hasMore: boolean }
  | { ok: false; error: string };

export async function getTasks(params: GetTasksParams): Promise<GetTasksResult> {
  const pageSize = params.pageSize ?? 10;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado" };
  }

  let query = supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, created_at, updated_at, user_id, image",
    )
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.priority && params.priority !== "all") {
    query = query.eq("priority", params.priority);
  }

  const rawSearch = params.search?.trim();
  if (rawSearch) {
    const q = escapeIlike(rawSearch);
    const pattern = `%${q}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  const from = params.page * pageSize;
  const to = from + pageSize;
  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("getTasks", error);
    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as TaskRow[];
  const hasMore = rows.length > pageSize;
  const tasks = rows.slice(0, pageSize).map(mapTaskRow);
  return { ok: true, tasks, hasMore };
}
