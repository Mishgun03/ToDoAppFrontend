import { z } from "zod";

export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(128, "Не более 128 символов"),
  content: z
    .string()
    .max(2048, "Не более 2048 символов")
    .optional()
    .or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  priority: z
    .enum(["BLOCKER", "HIGH", "MEDIUM", "LOW", "NONE"])
    .optional(),
  repeatType: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
});

export type CreateTodoFormData = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z.object({
  title: z
    .string()
    .max(128, "Не более 128 символов")
    .optional()
    .refine((val) => val === undefined || val.trim().length > 0, {
      message: "Название не может быть пустым",
    }),
  content: z
    .string()
    .max(2048, "Не более 2048 символов")
    .optional()
    .or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  done: z.boolean().optional(),
  priority: z
    .enum(["BLOCKER", "HIGH", "MEDIUM", "LOW", "NONE"])
    .optional(),
  repeatType: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
});

export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>;
