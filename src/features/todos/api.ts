import { apiClient } from "@/shared/api/client";
import type {
  TodoResponseDto,
  TodoResponsePageableDto,
  Priority,
} from "@/shared/api/types";

export function getTodos(
  page = 0,
  size = 10,
): Promise<TodoResponsePageableDto> {
  return apiClient<TodoResponsePageableDto>(
    `/todos?page=${page}&size=${size}&sort=createdAt,desc`,
  );
}

export function getTodoById(id: string): Promise<TodoResponseDto> {
  return apiClient<TodoResponseDto>(`/todos/${id}`);
}

export interface CreateTodoData {
  title: string;
  content?: string;
  deadline?: string;
  priority?: Priority;
  repeatType?: string;
}

export function createTodo(
  data: CreateTodoData,
  files?: File[],
): Promise<TodoResponseDto> {
  if (files && files.length > 0) {
    const formData = new FormData();
    formData.append(
      "todo",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    files.forEach((file) => formData.append("files", file));
    return apiClient<TodoResponseDto>("/todos", {
      method: "POST",
      body: formData,
    });
  }

  return apiClient<TodoResponseDto>("/todos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateTodoData {
  title?: string;
  content?: string;
  deadline?: string;
  done?: boolean;
  priority?: Priority;
  repeatType?: string | null;
}

export function updateTodo(
  id: string,
  data: UpdateTodoData,
  files?: File[],
): Promise<TodoResponseDto> {
  if (files && files.length > 0) {
    const formData = new FormData();
    formData.append(
      "todo",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    files.forEach((file) => formData.append("files", file));
    return apiClient<TodoResponseDto>(`/todos/${id}`, {
      method: "PUT",
      body: formData,
    });
  }

  return apiClient<TodoResponseDto>(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTodo(id: string): Promise<void> {
  return apiClient<void>(`/todos/${id}`, { method: "DELETE" });
}

export function searchTodos(
  query: string,
  page = 0,
  size = 10,
): Promise<TodoResponsePageableDto> {
  return apiClient<TodoResponsePageableDto>(
    `/todos/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
  );
}

export function filterTodos(
  done?: boolean,
  priority?: Priority,
  page = 0,
  size = 10,
): Promise<TodoResponsePageableDto> {
  const params = new URLSearchParams();
  if (done !== undefined) params.set("done", String(done));
  if (priority) params.set("priority", priority);
  params.set("page", String(page));
  params.set("size", String(size));
  return apiClient<TodoResponsePageableDto>(
    `/todos/filter?${params.toString()}`,
  );
}

export function getSmartList(
  page = 0,
  size = 10,
): Promise<TodoResponsePageableDto> {
  return apiClient<TodoResponsePageableDto>(
    `/todos/smart-list?page=${page}&size=${size}`,
  );
}
