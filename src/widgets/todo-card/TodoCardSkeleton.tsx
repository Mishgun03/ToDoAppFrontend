import { Skeleton } from "@/components/ui/skeleton";

export function TodoCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="mt-0.5 size-4 rounded-[4px]" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TodoListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TodoCardSkeleton key={i} />
      ))}
    </div>
  );
}
