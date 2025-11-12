import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AskPanel from "./pages/AskPanel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthProvider";
import Login from "./pages/Login";
import PersonaEditPage from "./pages/PersonaEdit";
import PersonaChatPage from "./pages/PersonaChat";
// --- NEW IMPORTS ---\
import DigitalCopyPage from "./pages/DigitalCopy";
import PersonaListPage from "./pages/PersonaList";
import SessionsListPage from "./pages/SessionsList"; // <-- RENAMED IMPORT

const queryClient = new QueryClient();

// A wrapper component to protect routes (no change here)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<Login />} />
              {/* These routes are now protected */}
              <Route path="/ask" element={<ProtectedRoute><AskPanel /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/upload" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

              {/* --- NEW PROTECTED ROUTE FOR DIGITAL COPY --- */}
              <Route
                path="/admin/digital-copy"
                element={<ProtectedRoute><DigitalCopyPage /></ProtectedRoute>}
              />
              <Route
                path="/persona/list"
                element={<ProtectedRoute><PersonaListPage /></ProtectedRoute>}
              />
              <Route path="persona/:id/details"
                element={<ProtectedRoute><PersonaEditPage /></ProtectedRoute>}
              />
              <Route path="persona/:id/chat"
                element={<ProtectedRoute><PersonaChatPage /></ProtectedRoute>}
              />
              <Route path="/sessions-list" // <-- NEW DEDICATED ROUTE
                element={<ProtectedRoute><SessionsListPage /></ProtectedRoute>} // <-- NEW COMPONENT NAME
                />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;