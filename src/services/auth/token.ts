import type { AuthTokens } from "../http";

const ACCESS_TOKEN_KEY = "webpack5_learn_access_token";
const REFRESH_TOKEN_KEY = "webpack5_learn_refresh_token";

function getStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(tokens: AuthTokens) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  if (tokens.refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function clearAuthTokens() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
