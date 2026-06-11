import type { InternalAxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  code?: number | string;
  message?: string;
  detail?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export type TokenGetter = () => string | null | undefined;
export type UnauthorizedHandler = () => void;
export type TokenRefreshHandler = (refreshToken: string) => Promise<AuthTokens>;

export interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuthRefresh?: boolean;
  hasRetried?: boolean;
}

export class ApiError extends Error {
  code?: number | string;
  status?: number;
  detail?: unknown;

  constructor(message: string, options: ApiErrorPayload & { status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.detail = options.detail;
  }
}
