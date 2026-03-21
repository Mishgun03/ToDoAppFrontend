"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
      <AlertCircle className="size-16 text-destructive/60" />
      <h1 className="mt-6 text-2xl font-bold">Что-то пошло не так</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу.
      </p>
      <Button className="mt-8" onClick={reset}>
        <RotateCcw className="size-4" />
        Попробовать снова
      </Button>
    </div>
  );
}
