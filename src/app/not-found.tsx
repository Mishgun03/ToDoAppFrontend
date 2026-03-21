import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
      <FileQuestion className="size-16 text-muted-foreground/50" />
      <h1 className="mt-6 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants())}
        >
          К задачам
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
