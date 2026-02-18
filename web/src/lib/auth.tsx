"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export interface Consultant {
  consultant_id: string;
  username: string;
  display_name: string;
  role: "consultant" | "senior" | "admin";
}

interface AuthContextValue {
  consultant: Consultant | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
const TOKEN_KEY = "fta_token";

const MOCK_CONSULTANT: Consultant = {
  consultant_id: "mock-001",
  username: "sarah.k",
  display_name: "Sarah K.",
  role: "senior",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (MOCK_MODE) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) setConsultant(MOCK_CONSULTANT);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setConsultant(await res.json());
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      if (MOCK_MODE) {
        // Accept any credentials in mock mode
        if (!username || !password) throw new Error("Enter credentials");
        localStorage.setItem(TOKEN_KEY, "mock-token");
        setConsultant(MOCK_CONSULTANT);
        router.push("/");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Invalid credentials");
      }

      const { token, consultant: c } = await res.json();
      localStorage.setItem(TOKEN_KEY, token);
      setConsultant(c);
      router.push("/");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setConsultant(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ consultant, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
