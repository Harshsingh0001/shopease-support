import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import type { User, UserRole, UserLanguage } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
    preferredLanguage?: UserLanguage
  ) => Promise<void>;
  logout: () => void;
  quickLogin: (role: "customer" | "customer2" | "agent" | "supervisor" | "admin") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("shopease_user");
      if (!saved || saved === "undefined" || saved === "null") return null;
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("shopease_user");
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem("shopease_token");
    if (!saved || saved === "undefined" || saved === "null") return null;
    return saved;
  });
  // Fast FCP: Only block render if a token exists but no cached user is available to display
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const savedToken = localStorage.getItem("shopease_token");
      const savedUser = localStorage.getItem("shopease_user");
      const hasValidToken = Boolean(savedToken && savedToken !== "undefined" && savedToken !== "null");
      const hasValidUser = Boolean(savedUser && savedUser !== "undefined" && savedUser !== "null");
      return hasValidToken && !hasValidUser;
    } catch {
      return false;
    }
  });

  // Validate token and hydrate user on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("shopease_token");
      if (!storedToken || storedToken === "undefined" || storedToken === "null") {
        localStorage.removeItem("shopease_token");
        localStorage.removeItem("shopease_user");
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response?.user) {
          setUser(response.user);
          localStorage.setItem("shopease_user", JSON.stringify(response.user));
        } else {
          throw new Error("Invalid user profile response");
        }
      } catch {
        localStorage.removeItem("shopease_token");
        localStorage.removeItem("shopease_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res?.token) {
      localStorage.setItem("shopease_token", res.token);
      setToken(res.token);
    }
    if (res?.user) {
      localStorage.setItem("shopease_user", JSON.stringify(res.user));
      setUser(res.user);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
    preferredLanguage?: UserLanguage
  ) => {
    await api.auth.register({ name, email, password, role, preferredLanguage });
    // Automatically log in after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("shopease_token");
    localStorage.removeItem("shopease_user");
    setToken(null);
    setUser(null);
  };

  // Quick Demo Login shortcut for testing
  const quickLogin = async (targetRole: "customer" | "customer2" | "agent" | "supervisor" | "admin") => {
    const credentials = {
      customer: { email: "customer@shopease.local", password: "Password123!" },
      customer2: { email: "customer2@shopease.local", password: "Password123!" },
      agent: { email: "agent@shopease.local", password: "Password123!" },
      supervisor: { email: "supervisor@shopease.local", password: "Password123!" },
      admin: { email: "admin@shopease.local", password: "Password123!" },
    };
    const cred = credentials[targetRole];
    await login(cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, quickLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
