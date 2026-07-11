import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  authHeader: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authHeader, setAuthHeader] = useState<string | null>(
    sessionStorage.getItem("authHeader")
  );

  async function login(username: string, password: string): Promise<boolean> {
    const header = "Basic " + btoa(`${username}:${password}`);

    const res = await fetch("http://localhost:8080/api/machines", {
      headers: { Authorization: header },
    });

    if (res.ok) {
      sessionStorage.setItem("authHeader", header);
      setAuthHeader(header);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem("authHeader");
    setAuthHeader(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!authHeader, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}