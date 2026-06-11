import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ApiError, type ApiErrorPayload, type ApiResponse } from "./types";

export const http: AxiosInstance = axios.create({
  baseURL: process.env.APP_API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  const body = response.data;

  if (body.code !== 0) {
    throw new ApiError(body.message || "Business request failed", {
      code: body.code,
      detail: body,
    });
  }

  return body.data;
}

export const request = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(http.get<ApiResponse<T>>(url, config));
  },
  post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return unwrap<T>(http.post<ApiResponse<T>>(url, data, config));
  },
  put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return unwrap<T>(http.put<ApiResponse<T>>(url, data, config));
  },
  patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return unwrap<T>(http.patch<ApiResponse<T>>(url, data, config));
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(http.delete<ApiResponse<T>>(url, config));
  },
};

export function toApiError(error: {
  message?: string;
  response?: {
    status?: number;
    data?: ApiErrorPayload;
  };
}) {
  const status = error.response?.status;
  const payload = error.response?.data;

  return new ApiError(payload?.message || error.message || "Request failed", {
    code: payload?.code,
    status,
    detail: payload?.detail ?? payload,
  });
}
