import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

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

type TokenGetter = () => string | null | undefined;
type UnauthorizedHandler = () => void;

let getAccessToken: TokenGetter | undefined;
let onUnauthorized: UnauthorizedHandler | undefined;

export function configureHttp(options: {
  getAccessToken?: TokenGetter;
  onUnauthorized?: UnauthorizedHandler;
}) {
  getAccessToken = options.getAccessToken;
  onUnauthorized = options.onUnauthorized;
}

const http: AxiosInstance = axios.create({
  baseURL: process.env.APP_API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken?.();
  const featureTag = process.env.APP_FEATURE_TAG;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (featureTag) {
    config.headers["feature-tag"] = featureTag;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status;
    const payload = error.response?.data;

    if (status === 401) {
      onUnauthorized?.();
    }

    return Promise.reject(
      new ApiError(payload?.message || error.message || "Request failed", {
        code: payload?.code,
        status,
        detail: payload?.detail ?? payload,
      }),
    );
  },
);

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

export default http;
