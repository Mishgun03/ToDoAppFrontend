export type Priority = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW" | "NONE";

export type RepeatType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface FileResponseDto {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface TodoResponseDto {
  id: string;
  todoName: string;
  todoContent: string | null;
  deadline: string | null;
  done: boolean;
  priority: Priority;
  repeatType: RepeatType | null;
  todoUserId: string;
  attachments: FileResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoResponsePageableDto {
  items: TodoResponseDto[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface UserStorageDto {
  userId: string;
  totalUsedBytes: number;
  quotaLimitBytes: number;
  updatedAt: string;
  createdAt: string;
}

export interface RegisterResponseDto {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface JwtResponseDto {
  token: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: {
    fields?: Record<string, string>;
    violations?: { path: string; message: string }[];
  } | null;
}
