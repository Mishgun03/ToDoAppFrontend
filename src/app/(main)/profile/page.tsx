"use client";

import { User, Mail, Calendar, HardDrive } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { useAuth } from "@/shared/lib/useAuth";
import { useUserStorage } from "@/features/storage/hooks";
import { formatBytes, formatDate } from "@/shared/lib/format";

function getStorageColor(percent: number) {
  if (percent > 80) return "bg-red-500";
  if (percent >= 60) return "bg-yellow-500";
  return "bg-green-500";
}

function StorageSection({ userId }: { userId: string }) {
  const { data: storage, isLoading, error } = useUserStorage(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="size-5" />
            Хранилище
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (error || !storage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="size-5" />
            Хранилище
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Не удалось загрузить данные о хранилище.
          </p>
        </CardContent>
      </Card>
    );
  }

  const percent =
    storage.quotaLimitBytes > 0
      ? (storage.totalUsedBytes / storage.quotaLimitBytes) * 100
      : 0;
  const colorClass = getStorageColor(percent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="size-5" />
          Хранилище
        </CardTitle>
        <CardDescription>
          Хранилище включает все файлы, прикреплённые к вашим задачам
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percent} max={100}>
          <ProgressTrack className="h-3">
            <ProgressIndicator className={colorClass} />
          </ProgressTrack>
        </Progress>

        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">
            {formatBytes(storage.totalUsedBytes)} /{" "}
            {formatBytes(storage.quotaLimitBytes)} использовано
          </p>
          <span className="text-sm tabular-nums text-muted-foreground">
            {percent.toFixed(1)}%
          </span>
        </div>

        {percent > 80 && (
          <p className="text-sm text-red-500">
            Хранилище почти заполнено. Удалите ненужные задачи с вложениями,
            чтобы освободить место.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { userId, username, token, isAuthenticated } = useAuth();

  if (!isAuthenticated || !token) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Загрузка...
          </CardContent>
        </Card>
      </div>
    );
  }

  let email: string | null = null;
  let firstName: string | null = null;
  let lastName: string | null = null;
  let createdAt: string | null = null;

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      email = payload.email ?? null;
      firstName = payload.firstName ?? null;
      lastName = payload.lastName ?? null;
      createdAt = payload.createdAt ?? null;
    }
  } catch {
    // JWT may not contain extended claims
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Информация о пользователе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <InfoRow label="Имя пользователя" value={username} />
            {email && (
              <InfoRow
                label="Электронная почта"
                value={email}
                icon={<Mail className="size-4 text-muted-foreground" />}
              />
            )}
            {(firstName || lastName) && (
              <InfoRow
                label="Полное имя"
                value={[firstName, lastName].filter(Boolean).join(" ")}
              />
            )}
            {createdAt && (
              <InfoRow
                label="Дата регистрации"
                value={formatDate(createdAt)}
                icon={<Calendar className="size-4 text-muted-foreground" />}
              />
            )}
          </dl>
        </CardContent>
      </Card>

      {userId && <StorageSection userId={userId} />}
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-44 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {value}
      </dd>
    </div>
  );
}
