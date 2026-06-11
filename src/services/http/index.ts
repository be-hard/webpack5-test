import { installAuthInterceptors } from "./auth-refresh";
import { http } from "./client";

installAuthInterceptors();

export { configureHttp } from "./auth-refresh";
export { http, request } from "./client";
export { ApiError } from "./types";
export type { ApiErrorPayload, ApiResponse, AuthTokens } from "./types";

export default http;
