"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Paperclip, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import type { TodoResponseDto } from "@/shared/api/types";
import { PRIORITY_CONFIG, REPEAT_LABELS } from "@/shared/lib/constants";
import { formatDeadline } from "@/shared/lib/format";
import { updateTodo } from "@/features/todos/api";
import { EditTodoDialog } from "@/features/todos/components/EditTodoDialog";
import { DeleteConfirmDialog } from "@/features/todos/components/DeleteConfirmDialog";

interface TodoCardProps {
  todo: TodoResponseDto;
  onToggle?: (todo: TodoResponseDto) => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function TodoCard({ todo, onToggle, onDeleted, onUpdated }: TodoCardProps) {
  const priorityCfg = PRIORITY_CONFIG[todo.priority];
  const deadline = todo.deadline ? formatDeadline(todo.deadline) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleToggle() {
    try {
      onToggle?.({ ...todo, done: !todo.done });
      await updateTodo(todo.id, { done: !todo.done });
    } catch {
      onToggle?.(todo);
      toast.error("Не удалось обновить задачу");
    }
  }

  return (
    <>
      <div className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
        <Checkbox
          checked={todo.done}
          onCheckedChange={handleToggle}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/todos/${todo.id}`}
              className={`text-sm font-medium hover:underline ${
                todo.done
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {todo.todoName}
            </Link>

            {todo.priority !== "NONE" && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityCfg.color} ${priorityCfg.text}`}
              >
                {priorityCfg.label}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {deadline && (
              <span
                className={`inline-flex items-center gap-1 ${
                  deadline.isOverdue ? "text-destructive font-medium" : ""
                }`}
              >
                <Calendar className="size-3" />
                {deadline.text}
              </span>
            )}

            {todo.repeatType && (
              <Tooltip>
                <TooltipTrigger className="inline-flex items-center gap-1">
                  <Repeat className="size-3" />
                  {REPEAT_LABELS[todo.repeatType]}
                </TooltipTrigger>
                <TooltipContent>
                  Повторяется: {REPEAT_LABELS[todo.repeatType]}
                </TooltipContent>
              </Tooltip>
            )}

            {todo.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="size-3" />
                {todo.attachments.length}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Действия</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Edit className="size-4" />
              Изменить
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditTodoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        todo={todo}
        onUpdated={onUpdated}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        todoId={todo.id}
        todoTitle={todo.todoName}
        onDeleted={onDeleted}
      />
    </>
  );
}
