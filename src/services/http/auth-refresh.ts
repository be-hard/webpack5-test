import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "../auth/token";
import { http, toApiError } from "./client";
import { ApiError } from "./types";
import type {
  ApiErrorPayload,
  RetryableAxiosRequestConfig,
  TokenGetter,
  TokenRefreshHandler,
  UnauthorizedHandler,
} from "./types";

let getToken: TokenGetter = getAccessToken;
let onUnauthorized: UnauthorizedHandler = () => {
  clearAuthTokens();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};
let refreshAccessToken: TokenRefreshHandler | undefined;
let refreshingTokenPromise: Promise<string> | undefined;

export function configureHttp(options: {
  getAccessToken?: TokenGetter;
  onUnauthorized?: UnauthorizedHandler;
  refreshAccessToken?: TokenRefreshHandler;
}) {
  getToken = options.getAccessToken ?? getToken;
  onUnauthorized = options.onUnauthorized ?? onUnauthorized;
  refreshAccessToken = options.refreshAccessToken ?? refreshAccessToken;
}

export function installAuthInterceptors() {
  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken?.();
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
    async (error: AxiosError<ApiErrorPayload>) => {
      const status = error.response?.status;
      const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

      if (status === 401 && originalRequest && !originalRequest.skipAuthRefresh) {
        if (!originalRequest.hasRetried) {
          try {
            const accessToken = await getRefreshedAccessToken();

            originalRequest.hasRetried = true;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return http(originalRequest);
          } catch {
            onUnauthorized();
          }
        } else {
          onUnauthorized();
        }
      }

      return Promise.reject(toApiError(error));
    },
  );
}

async function getRefreshedAccessToken() {
  if (!refreshAccessToken) {
    throw new ApiError("Token refresh handler is not configured", { status: 401 });
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError("Refresh token is missing", { status: 401 });
  }

  refreshingTokenPromise ??= refreshAccessToken(refreshToken)
    .then((tokens) => {
      setAuthTokens(tokens);
      return tokens.accessToken;
    })
    .finally(() => {
      refreshingTokenPromise = undefined;
    });

  return refreshingTokenPromise;
}
