import { CheckSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 flex items-center gap-2 text-primary">
        <CheckSquare className="size-8" />
        <span className="text-2xl font-bold tracking-tight">TodoAPI</span>
      </div>
      {children}
    </div>
  );
}
