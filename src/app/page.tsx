import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  Paperclip,
  Repeat,
  ArrowRight,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: AlertTriangle,
    title: "Умные списки",
    description:
      "Автоматическое отслеживание просроченных и срочных задач — ничего не забудете.",
  },
  {
    icon: Paperclip,
    title: "Файловые вложения",
    description:
      "Прикрепляйте документы, изображения и другие файлы прямо к задачам.",
  },
  {
    icon: Repeat,
    title: "Повторяющиеся задачи",
    description:
      "Настройте ежедневное, еженедельное, ежемесячное или ежегодное повторение.",
  },
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("todoapi_token")?.value;
  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2 text-primary">
          <CheckSquare className="size-6" />
          <span className="text-lg font-bold tracking-tight">TodoAPI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Войти
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Регистрация
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CheckSquare className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Организуйте задачи,
            <br />
            <span className="text-muted-foreground">упростите жизнь</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Удобный менеджер задач с умными списками, вложениями файлов и
            повторяющимися задачами. Всё, что нужно — в одном месте.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-1.5",
              )}
            >
              Начать бесплатно
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
            Возможности
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 bg-card shadow-sm">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        TodoAPI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
