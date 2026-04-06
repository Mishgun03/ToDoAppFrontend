"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Loader2,
  CalendarIcon,
  Upload,
  X,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { updateTodo } from "@/features/todos/api";
import {
  updateTodoSchema,
  type UpdateTodoFormData,
} from "@/features/todos/schemas";
import { formatBytes } from "@/shared/lib/format";
import type { ApiError, TodoResponseDto } from "@/shared/api/types";

interface EditTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: TodoResponseDto;
  onUpdated?: () => void;
}

export function EditTodoDialog({
  open,
  onOpenChange,
  todo,
  onUpdated,
}: EditTodoDialogProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTodoFormData>({
    resolver: zodResolver(updateTodoSchema),
    defaultValues: {
      title: todo.todoName,
      content: todo.todoContent ?? "",
      deadline: todo.deadline ?? "",
      priority: todo.priority,
      repeatType: todo.repeatType,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: todo.todoName,
        content: todo.todoContent ?? "",
        deadline: todo.deadline ?? "",
        priority: todo.priority,
        repeatType: todo.repeatType,
      });
      setNewFiles([]);
    }
  }, [open, todo, reset]);

  const content = watch("content", "");

  function handleClose() {
    onOpenChange(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...selectedFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: UpdateTodoFormData) {
    try {
      const payload = {
        title: data.title || undefined,
        content: data.content,
        deadline: data.deadline || undefined,
        priority: data.priority,
        repeatType: data.repeatType,
      };

      await updateTodo(
        todo.id,
        payload,
        newFiles.length > 0 ? newFiles : undefined,
      );
      toast.success("Задача обновлена");
      handleClose();
      onUpdated?.();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Не удалось обновить задачу");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-content">Описание</Label>
              <span className="text-xs text-muted-foreground">
                {(content ?? "").length}/2048
              </span>
            </div>
            <Textarea
              id="edit-content"
              rows={3}
              aria-invalid={!!errors.content}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label>Дедлайн</Label>
            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal"
                        type="button"
                      />
                    }
                  >
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    {field.value ? (
                      format(new Date(field.value), "d MMM yyyy, HH:mm", {
                        locale: ru,
                      })
                    ) : (
                      <span className="text-muted-foreground">Выберите дату</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const existing = field.value
                            ? new Date(field.value)
                            : new Date();
                          date.setHours(existing.getHours(), existing.getMinutes());
                          field.onChange(date.toISOString());
                        } else {
                          field.onChange("");
                        }
                        setCalendarOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                    />
                    {field.value && (
                      <div className="border-t px-3 py-2">
                        <Label className="text-xs">Время</Label>
                        <Input
                          type="time"
                          className="mt-1"
                          value={
                            field.value
                              ? format(new Date(field.value), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(":").map(Number);
                            const d = new Date(field.value!);
                            d.setHours(h, m);
                            field.onChange(d.toISOString());
                          }}
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Priority & Repeat */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Приоритет</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "NONE"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Нет</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="BLOCKER">Blocker</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Повтор</Label>
              <Controller
                control={control}
                name="repeatType"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? null : v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Нет</SelectItem>
                      <SelectItem value="DAILY">Ежедневно</SelectItem>
                      <SelectItem value="WEEKLY">Еженедельно</SelectItem>
                      <SelectItem value="MONTHLY">Ежемесячно</SelectItem>
                      <SelectItem value="YEARLY">Ежегодно</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Existing Attachments */}
          {todo.attachments.length > 0 && (
            <div className="space-y-1.5">
              <Label>Прикреплённые файлы</Label>
              <ul className="space-y-1">
                {todo.attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-sm"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                      {att.fileName}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(att.fileSize)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New File Upload */}
          <div className="space-y-1.5">
            <Label>Добавить файлы</Label>
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Нажмите для выбора файлов
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {newFiles.length > 0 && (
              <ul className="space-y-1 pt-1">
                {newFiles.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-sm"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewFile(i);
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
