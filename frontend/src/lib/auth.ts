import Cookies from "js-cookie";

const ACCESS_KEY = "edu_access";
const REFRESH_KEY = "edu_refresh";
const AUTH_EVENT = "edu-auth-changed";

const notifyAuthChanged = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const setTokens = (tokens: { access: string; refresh: string }) => {
  if (typeof document === "undefined") {
    return;
  }
  Cookies.set(ACCESS_KEY, tokens.access, { expires: 1 / 24 });
  Cookies.set(REFRESH_KEY, tokens.refresh, { expires: 7 });
  notifyAuthChanged();
};

export const getAccessToken = () => {
  if (typeof document === "undefined") {
    return null;
  }
  return Cookies.get(ACCESS_KEY) || null;
};

export const getRefreshToken = () => {
  if (typeof document === "undefined") {
    return null;
  }
  return Cookies.get(REFRESH_KEY) || null;
};

export const clearTokens = () => {
  if (typeof document === "undefined") {
    return;
  }
  Cookies.remove(ACCESS_KEY);
  Cookies.remove(REFRESH_KEY);
  notifyAuthChanged();
};

export const isAuthenticated = () => !!getAccessToken();
export const authChangedEvent = AUTH_EVENT;
