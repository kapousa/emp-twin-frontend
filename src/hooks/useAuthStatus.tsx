import { useState, useEffect } from "react";

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    // Check auth status on component mount
    checkAuthStatus();

    // Listen for custom events that signal a change in auth status
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      // Clean up the event listener
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    // Dispatch custom event to update other components
    window.dispatchEvent(new Event('authChange'));
    setIsAuthenticated(false);
  };

  return { isAuthenticated, logout };
};