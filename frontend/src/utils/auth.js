export const AUTH_CHANGED_EVENT = "slicehub-auth-changed";

export const getAuthUser = () => {
  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

export const hasAuthSession = () => Boolean(getAuthToken() && getAuthUser());

export const isCustomer = (user = getAuthUser()) => user?.role === "customer";

export const emitAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authUser");
  emitAuthChanged();
};
