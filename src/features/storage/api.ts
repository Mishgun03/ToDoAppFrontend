import { apiClient } from "@/shared/api/client";
import type { UserStorageDto } from "@/shared/api/types";

export function getUserStorage(userId: string): Promise<UserStorageDto> {
  return apiClient<UserStorageDto>(`/user-storage/${userId}`);
}
