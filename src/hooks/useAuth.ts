import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import * as authSlice from "@/store/slices/authSlice";
import { authApi, apiClient } from "@/lib/api-client";
import type { AuthResponse, User } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string; details?: Record<string, string> } } }).response;
    const details = response?.data?.details;

    if (details) {
      return Object.values(details).join(" ");
    }

    return response?.data?.message || fallback;
  }

  return fallback;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("SUPER_ADMIN");
  const isSeller = user?.roles?.includes("SELLER");

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(authSlice.setLoading(true));
      dispatch(authSlice.clearError());
      try {
        const response = await authApi.login(email, password);
        const data = response.data as AuthResponse;

        const user: User = {
          id: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roles: Array.from(data.roles),
          profilePictureUrl: data.profilePictureUrl,
        };

        dispatch(
          authSlice.setAuth({
            user,
            accessToken: data.accessToken,
          })
        );

        localStorage.setItem(
          "auth",
          JSON.stringify({
            user,
            accessToken: data.accessToken,
          })
        );

        return { success: true, user, roles: data.roles };
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Login failed");
        dispatch(authSlice.setError(message));
        dispatch(authSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      accountType: "customer" | "seller" = "customer"
    ) => {
      dispatch(authSlice.setLoading(true));
      dispatch(authSlice.clearError());
      try {
        const response = accountType === "seller"
          ? await authApi.registerSeller(email, password, firstName, lastName)
          : await authApi.register(email, password, firstName, lastName);
        const data = response.data as AuthResponse;

        const user: User = {
          id: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roles: Array.from(data.roles),
          profilePictureUrl: data.profilePictureUrl,
        };

        dispatch(
          authSlice.setAuth({
            user,
            accessToken: data.accessToken,
          })
        );

        localStorage.setItem(
          "auth",
          JSON.stringify({
            user,
            accessToken: data.accessToken,
          })
        );

        return { success: true, user, roles: data.roles };
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Registration failed");
        dispatch(authSlice.setError(message));
        dispatch(authSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(authSlice.logout());
    apiClient.clearAuth();
    localStorage.removeItem("auth");
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [dispatch]);

  const initializeAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("auth");
      if (auth) {
        const authData = JSON.parse(auth);
        dispatch(
          authSlice.setAuth({
            user: authData.user,
            accessToken: authData.accessToken,
          })
        );
      }
    }
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    isSeller,
    isLoading,
    error,
    login,
    register,
    logout,
    initializeAuth,
  };
};
