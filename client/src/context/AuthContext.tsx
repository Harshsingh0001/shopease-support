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
    const saved = localStorage.getItem("shopease_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("shopease_token")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate token and hydrate user on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("shopease_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        setUser(response.user);
        localStorage.setItem("shopease_user", JSON.stringify(response.user));
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
    localStorage.setItem("shopease_token", res.token);
    localStorage.setItem("shopease_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
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
