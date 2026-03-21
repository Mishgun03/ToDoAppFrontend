import { Skeleton } from "@/components/ui/skeleton";

export default function TodoDetailLoading() {
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
      <div className="flex gap-6 border-t pt-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
