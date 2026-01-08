import React from "react";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PersonaListPage from "./pages/PersonaList";
import PersonaDashboard from "./pages/PersonaDashboard"; // New Page
import DigitalCopyPage from "./pages/DigitalCopy";
import PersonaChatPage from "./pages/PersonaChat";
import { AuthProvider, useAuth } from "./contexts/AuthProvider";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />
          <ShadcnToaster />
          <Sonner />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/persona/list" element={<ProtectedRoute><PersonaListPage /></ProtectedRoute>} />

              {/* ⭐️ Unified Dashboard Route */}
              <Route
                path="/persona/:personaId/dashboard"
                element={<ProtectedRoute><PersonaDashboard /></ProtectedRoute>}
              />

              <Route path="/persona/:id/chat" element={<ProtectedRoute><PersonaChatPage /></ProtectedRoute>} />
              <Route path="/admin/digital-copy" element={<ProtectedRoute><DigitalCopyPage /></ProtectedRoute>} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;