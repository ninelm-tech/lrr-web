import { useState } from "react";
import { apiFetch } from "./api";
import type { User, UserRole, RegisterOperatorRequest } from "../types";

const BASE_API = "/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);


  async function login(email: string, password: string) {
    const data = await apiFetch(`${BASE_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    // API returns { accessToken, user: { id, email, name, role } }
    if (data.accessToken && data.user) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      // Set a session presence cookie so middleware can gate protected routes
      document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
      setUser(data.user);
    }
    
    return data;
  }


  async function registerCustomer(data: {
    phoneNumber: string;
    name?: string;
    email: string;
    password: string;
  }) {
    const res = await apiFetch(`${BASE_API}/register/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Auto-login: backend returns accessToken + user on registration
    if (res.accessToken && res.user) {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("userRole", res.user.role);
      localStorage.setItem("userName", res.user.name || res.user.phoneNumber || "Customer");
      document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
      setUser(res.user);
    }
    return res;
  }

  async function registerOperator(operator: RegisterOperatorRequest) {
    const data = await apiFetch("/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(operator),
    });
    return data;
  }


  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    // Clear session cookie so middleware redirects immediately
    document.cookie = "lrr_session=; path=/; max-age=0; SameSite=Lax";
    setUser(null);
  }

  function isAuthenticated() {
    // Only check token, not role (role can be forged in localStorage)
    return Boolean(localStorage.getItem("accessToken"));
  }

  function getUserRole(): UserRole | null {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("userRole") as UserRole) || null;
  }

  function getUser(): User | null {
    if (typeof window === "undefined") return null;
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole") as UserRole | null;
    
    // We only have limited info in localStorage (name + role for UI)
    // For full user data, fetch from an authenticated endpoint if needed
    if (name && role) {
      return { 
        id: "", // Not stored - only in token
        email: "", // Not stored - security risk
        name, 
        role 
      };
    }
    return null;
  }

  return {
    user,
    login,
    logout,
    isAuthenticated,
    registerOperator,
    registerCustomer,
    getUserRole,
    getUser,
  };
}
