import type { Priority, RepeatType } from "@/shared/api/types";

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; text: string; border: string }
> = {
  BLOCKER: {
    label: "Blocker",
    color: "bg-red-600",
    text: "text-white",
    border: "border-red-600",
  },
  HIGH: {
    label: "High",
    color: "bg-orange-500",
    text: "text-white",
    border: "border-orange-500",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-yellow-400",
    text: "text-black",
    border: "border-yellow-400",
  },
  LOW: {
    label: "Low",
    color: "bg-green-500",
    text: "text-white",
    border: "border-green-500",
  },
  NONE: {
    label: "None",
    color: "bg-gray-300",
    text: "text-gray-700",
    border: "border-gray-300",
  },
};

export const REPEAT_LABELS: Record<RepeatType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};
