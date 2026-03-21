import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
  differenceInDays,
} from "date-fns";
import { ru } from "date-fns/locale";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy", { locale: ru });
}

export function formatRelativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ru });
}

export function formatDeadline(iso: string): {
  text: string;
  isOverdue: boolean;
} {
  const date = new Date(iso);

  if (isToday(date)) {
    return { text: "Сегодня", isOverdue: false };
  }

  if (isTomorrow(date)) {
    return { text: "Завтра", isOverdue: false };
  }

  if (isPast(date)) {
    const days = differenceInDays(new Date(), date);
    return {
      text: `Просрочено на ${days} дн.`,
      isOverdue: true,
    };
  }

  const days = differenceInDays(date, new Date());
  if (days <= 7) {
    return { text: `Через ${days} дн.`, isOverdue: false };
  }

  return {
    text: format(date, "d MMM yyyy", { locale: ru }),
    isOverdue: false,
  };
}
