"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  Search,
  Plus,
  ClipboardList,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TodoCard } from "@/widgets/todo-card/TodoCard";
import { TodoListSkeleton } from "@/widgets/todo-card/TodoCardSkeleton";
import { CreateTodoDialog } from "@/features/todos/components/CreateTodoDialog";
import { useDebounce } from "@/shared/lib/useDebounce";
import type { TodoResponseDto, TodoResponsePageableDto, Priority } from "@/shared/api/types";
import {
  getTodos,
  searchTodos,
  filterTodos,
  getSmartList,
} from "@/features/todos/api";

type StatusFilter = "all" | "active" | "completed";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
];

const PRIORITY_OPTIONS: { value: Priority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Любой" },
  { value: "BLOCKER", label: "Blocker" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get("view");
  const paramPriority = searchParams.get("priority") as Priority | null;

  const [createOpen, setCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedQuery = useDebounce(searchInput, 300);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">(
    paramPriority ?? "ALL",
  );
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const isSmartView = view === "smart";
  const isSearching = debouncedQuery.length > 0;

  const hasFilter =
    statusFilter !== "all" ||
    priorityFilter !== "ALL" ||
    paramPriority !== null;

  const swrKey = isSmartView
    ? ["smart", page, pageSize]
    : isSearching
      ? ["search", debouncedQuery, page, pageSize]
      : hasFilter
        ? [
            "filter",
            statusFilter,
            paramPriority ?? priorityFilter,
            page,
            pageSize,
          ]
        : ["todos", page, pageSize];

  const { data, isLoading, mutate } = useSWR<TodoResponsePageableDto>(
    swrKey,
    () => {
      if (isSmartView) return getSmartList(page, pageSize);
      if (isSearching) return searchTodos(debouncedQuery, page, pageSize);

      const effectivePriority = paramPriority ?? priorityFilter;
      const done =
        statusFilter === "active"
          ? false
          : statusFilter === "completed"
            ? true
            : undefined;
      const prio =
        effectivePriority !== "ALL" ? effectivePriority : undefined;

      if (done !== undefined || prio) {
        return filterTodos(done, prio as Priority, page, pageSize);
      }

      return getTodos(page, pageSize);
    },
    { revalidateOnFocus: true },
  );

  const handleToggle = useCallback(
    (updated: TodoResponseDto) => {
      if (!data) return;
      mutate(
        {
          ...data,
          items: data.items.map((t) =>
            t.id === updated.id ? updated : t,
          ),
        },
        false,
      );
    },
    [data, mutate],
  );

  const todos = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  const title = isSmartView
    ? "Умный список"
    : paramPriority
      ? `Задачи: ${paramPriority}`
      : "Все задачи";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Новая задача</span>
        </Button>
      </div>

      {/* Search */}
      {!isSmartView && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
      )}

      {/* Filters */}
      {!isSmartView && !isSearching && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Status tabs */}
          <div className="flex rounded-lg bg-muted p-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(0);
                  if (paramPriority) {
                    router.push("/dashboard");
                  }
                }}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  statusFilter === opt.value && !paramPriority
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          {!paramPriority && (
            <div className="flex rounded-lg bg-muted p-0.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setPriorityFilter(opt.value);
                    setPage(0);
                  }}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                    priorityFilter === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Todo List */}
      {isLoading ? (
        <TodoListSkeleton />
      ) : todos.length === 0 ? (
        <EmptyState
          isSmartView={isSmartView}
          isSearching={isSearching}
          query={debouncedQuery}
        />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDeleted={() => mutate()}
              onUpdated={() => mutate()}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <CreateTodoDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => mutate()}
      />
    </div>
  );
}

function EmptyState({
  isSmartView,
  isSearching,
  query,
}: {
  isSmartView: boolean;
  isSearching: boolean;
  query: string;
}) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Search className="size-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Ничего не найдено по запросу &laquo;{query}&raquo;
        </p>
      </div>
    );
  }

  if (isSmartView) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Sparkles className="size-10 text-muted-foreground/50" />
        <p className="font-medium">Всё сделано!</p>
        <p className="text-sm text-muted-foreground">
          Нет просроченных или срочных задач.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <ClipboardList className="size-10 text-muted-foreground/50" />
      <p className="font-medium">Задач пока нет</p>
      <p className="text-sm text-muted-foreground">
        Создайте свою первую задачу, чтобы начать.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<TodoListSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
