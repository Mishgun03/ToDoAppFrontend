"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CheckSquare,
  ListTodo,
  AlertTriangle,
  User,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/shared/lib/useAuth";
import { PRIORITY_CONFIG } from "@/shared/lib/constants";
import type { Priority } from "@/shared/api/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Все задачи", icon: ListTodo },
  {
    href: "/dashboard?view=smart",
    label: "Умный список",
    icon: AlertTriangle,
  },
];

const PRIORITY_FILTERS: { key: Priority; dot: string }[] = [
  { key: "BLOCKER", dot: "bg-red-600" },
  { key: "HIGH", dot: "bg-orange-500" },
  { key: "MEDIUM", dot: "bg-yellow-400" },
  { key: "LOW", dot: "bg-green-500" },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { username, logout } = useAuth();

  const currentView = searchParams.get("view");
  const currentPriority = searchParams.get("priority");

  function isActive(href: string) {
    if (href.includes("?view=smart")) {
      return pathname === "/dashboard" && currentView === "smart";
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard" && !currentView && !currentPriority;
    }
    return pathname === href;
  }

  function isPriorityActive(priority: Priority) {
    return pathname === "/dashboard" && currentPriority === priority;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5 text-primary">
        <CheckSquare className="size-6" />
        <span className="text-lg font-bold tracking-tight">TodoAPI</span>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        <Separator className="my-3" />

        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Приоритет
        </p>
        {PRIORITY_FILTERS.map(({ key, dot }) => {
          const active = isPriorityActive(key);
          return (
            <Link
              key={key}
              href={`/dashboard?priority=${key}`}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${active ? "bg-primary-foreground" : dot}`}
              />
              {PRIORITY_CONFIG[key].label}
            </Link>
          );
        })}

        <Separator className="my-3" />

        <Link
          href="/profile"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User className="size-4" />
          Профиль
        </Link>
      </nav>

      <div className="border-t p-4">
        <div className="mb-2 truncate px-1 text-sm font-medium">
          {username ?? "Пользователь"}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          <LogOut className="size-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
}
