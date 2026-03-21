"use client";

import useSWR from "swr";
import type { TodoResponsePageableDto, Priority } from "@/shared/api/types";
import {
  getTodos,
  searchTodos,
  filterTodos,
  getSmartList,
} from "./api";

export function useTodos(page = 0, size = 10) {
  return useSWR<TodoResponsePageableDto>(
    ["todos", page, size],
    () => getTodos(page, size),
    { revalidateOnFocus: true },
  );
}

export function useTodoSearch(query: string, page = 0, size = 10) {
  return useSWR<TodoResponsePageableDto>(
    query ? ["todos-search", query, page, size] : null,
    () => searchTodos(query, page, size),
    { revalidateOnFocus: false },
  );
}

export function useTodoFilter(
  done?: boolean,
  priority?: Priority,
  page = 0,
  size = 10,
) {
  const hasFilter = done !== undefined || priority !== undefined;
  return useSWR<TodoResponsePageableDto>(
    hasFilter ? ["todos-filter", done, priority, page, size] : null,
    () => filterTodos(done, priority, page, size),
    { revalidateOnFocus: true },
  );
}

export function useSmartList(page = 0, size = 10) {
  return useSWR<TodoResponsePageableDto>(
    ["todos-smart", page, size],
    () => getSmartList(page, size),
    { revalidateOnFocus: true },
  );
}
