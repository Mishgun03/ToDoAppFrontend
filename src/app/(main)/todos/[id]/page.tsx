"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  ChevronRight,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Repeat,
  Paperclip,
  Calendar,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { getTodoById, updateTodo } from "@/features/todos/api";
import { EditTodoDialog } from "@/features/todos/components/EditTodoDialog";
import { DeleteConfirmDialog } from "@/features/todos/components/DeleteConfirmDialog";
import { PRIORITY_CONFIG, REPEAT_LABELS } from "@/shared/lib/constants";
import {
  formatDate,
  formatDeadline,
  formatBytes,
  formatRelativeDate,
} from "@/shared/lib/format";
import type { TodoResponseDto, ApiError } from "@/shared/api/types";

export default function TodoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const {
    data: todo,
    error,
    isLoading,
    mutate,
  } = useSWR<TodoResponseDto>(
    params.id ? ["todo", params.id] : null,
    () => getTodoById(params.id),
  );

  async function handleToggleDone() {
    if (!todo) return;
    setToggling(true);
    try {
      await updateTodo(todo.id, { done: !todo.done });
      mutate();
      toast.success(todo.done ? "Задача возобновлена" : "Задача завершена");
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Не удалось обновить задачу");
    } finally {
      setToggling(false);
    }
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !todo) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <FileText className="mx-auto size-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">Задача не найдена</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Возможно, она была удалена или у вас нет к ней доступа.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="size-4" />
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const priorityCfg = PRIORITY_CONFIG[todo.priority];
  const deadline = todo.deadline ? formatDeadline(todo.deadline) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Задачи
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{todo.todoName}</span>
      </nav>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1
            className={`text-xl font-semibold ${
              todo.done ? "text-muted-foreground line-through" : ""
            }`}
          >
            {todo.todoName}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="size-4" />
              <span className="hidden sm:inline">Изменить</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Удалить</span>
            </Button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {todo.priority !== "NONE" && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityCfg.color} ${priorityCfg.text}`}
            >
              {priorityCfg.label}
            </span>
          )}
          <Badge variant={todo.done ? "secondary" : "outline"}>
            {todo.done ? (
              <>
                <CheckCircle2 className="size-3" /> Завершена
              </>
            ) : (
              <>
                <Circle className="size-3" /> В работе
              </>
            )}
          </Badge>
          {todo.repeatType && (
            <Badge variant="outline">
              <Repeat className="size-3" />
              {REPEAT_LABELS[todo.repeatType]}
            </Badge>
          )}
        </div>
      </div>

      {/* Toggle done */}
      <Button
        variant="outline"
        onClick={handleToggleDone}
        disabled={toggling}
      >
        {toggling ? (
          <Loader2 className="animate-spin" />
        ) : todo.done ? (
          <Circle className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {todo.done ? "Отметить незавершённой" : "Отметить завершённой"}
      </Button>

      {/* Deadline */}
      {deadline && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className={deadline.isOverdue ? "font-medium text-destructive" : ""}>
            {deadline.text}
          </span>
          <span className="text-muted-foreground">
            ({formatDate(todo.deadline!)})
          </span>
        </div>
      )}

      {/* Content */}
      {todo.todoContent && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium">Описание</h3>
          <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
            {todo.todoContent}
          </p>
        </div>
      )}

      {/* Attachments */}
      {todo.attachments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Файлы ({todo.attachments.length})
          </h3>
          <ul className="space-y-1">
            {todo.attachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5 text-sm"
              >
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{att.fileName}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(att.fileSize)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 text-xs text-muted-foreground">
        <span>Создана: {formatRelativeDate(todo.createdAt)}</span>
        <span>Обновлена: {formatRelativeDate(todo.updatedAt)}</span>
      </div>

      {/* Dialogs */}
      <EditTodoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        todo={todo}
        onUpdated={() => mutate()}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        todoId={todo.id}
        todoTitle={todo.todoName}
        onDeleted={() => router.push("/dashboard")}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
