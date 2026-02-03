import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode, JwtPayload } from "jwt-decode";
import { AUTH_VERIFY_ENDPOINT } from "@/configurations/api";

// Define custom interface to fix the "email" property error
interface CustomJwtPayload extends JwtPayload {
  email?: string;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        await axios.get(AUTH_VERIFY_ENDPOINT, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        // Cast to CustomJwtPayload
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        setUser({ email: decodedToken.email });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("authToken");
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    const decodedToken = jwtDecode<CustomJwtPayload>(newToken);
    setUser({ email: decodedToken.email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);