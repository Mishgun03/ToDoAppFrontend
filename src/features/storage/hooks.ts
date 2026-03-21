"use client";

import useSWR from "swr";
import type { UserStorageDto } from "@/shared/api/types";
import { getUserStorage } from "./api";

export function useUserStorage(userId: string | null) {
  return useSWR<UserStorageDto>(
    userId ? ["user-storage", userId] : null,
    () => getUserStorage(userId!),
    { revalidateOnFocus: true },
  );
}
