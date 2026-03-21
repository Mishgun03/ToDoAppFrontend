import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Имя пользователя обязательно")
    .max(64, "Имя пользователя не более 64 символов"),
  password: z
    .string()
    .min(8, "Пароль должен быть от 8 до 20 символов")
    .max(20, "Пароль должен быть от 8 до 20 символов")
    .regex(/[A-Z]/, "Пароль должен содержать заглавную букву")
    .regex(/[a-z]/, "Пароль должен содержать строчную букву")
    .regex(/\d/, "Пароль должен содержать цифру")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Пароль должен содержать спецсимвол",
    )
    .regex(/^\S+$/, "Пароль не должен содержать пробелов"),
  email: z
    .string()
    .email("Введите корректный email")
    .max(320, "Email не более 320 символов"),
  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(100, "Имя не более 100 символов"),
  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(100, "Фамилия не более 100 символов"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
