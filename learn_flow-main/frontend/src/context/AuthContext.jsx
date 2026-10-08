import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../utils/api.js";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const refresh =
    async () => {
      try {
        const { data } =
          await api.get(
            "/auth/me",
          );

        setUser(data.user);

        return data.user;
      } catch {
        setUser(null);

        return null;
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    refresh();

    const handleUnauthorized =
      () => {
        setUser(null);
      };

    window.addEventListener(
      "learnflow:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "learnflow:unauthorized",
        handleUnauthorized,
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,

      login: async (payload) => {
        const { data } =
          await api.post(
            "/auth/login",
            payload,
          );

        setUser(data.user);

        return data.user;
      },

      register:
        async (payload) => {
          const { data } =
            await api.post(
              "/auth/register",
              payload,
            );

          return data;
        },

      logout: async () => {
        try {
          await api.post(
            "/auth/logout",
          );
        } finally {
          setUser(null);
        }
      },
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}