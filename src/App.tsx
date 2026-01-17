import React from "react";
import {Toaster as ShadcnToaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {Toaster} from "react-hot-toast";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PersonaListPage from "./pages/PersonaList";
import PersonaDashboard from "./pages/PersonaDashboard";
import DigitalCopyPage from "./pages/DigitalCopy";
import PersonaChatPage from "./pages/PersonaChat";
import {AuthProvider, useAuth} from "./contexts/AuthProvider";
import PublicChat from "@/pages/PublicChat.tsx";

// --- NEW IMPORTS FOR BOARDROOMS ---
import RoomCreation from "./pages/RoomCreation";
import RoomChat from "./pages/RoomChat";
import RoomList from "./pages/RoomList";
import RoomDetails from "@/pages/RoomDetails.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const {isAuthenticated, loading} = useAuth();
    if (loading) return <div className="p-10 text-center">Loading...</div>;
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace/>;
};

const App: React.FC = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-right" reverseOrder={false}/>
                    <ShadcnToaster/>
                    <Sonner/>

                    <Routes>
                        {/* 1. COMPLETELY PUBLIC/CLEAN ROUTES (No Sidebar) */}
                        // Standard Public Chat Link
                        <Route path="/public/chat/:personaId" element={<PublicChat isEmbed={false}/>}/>
                        // Widget / Embed Link
                        <Route path="/p/public/:personaId" element={<PublicChat isEmbed={true}/>}/>

                        {/* 2. DASHBOARD ROUTES (With Sidebar) */}
                        <Route
                            path="*"
                            element={
                                <div className="flex h-screen bg-white">
                                    <Navbar/> {/* This is your sidebar */}
                                    <main className="flex-1 h-full overflow-y-auto bg-gray-50/30">
                                        <Routes>
                                            <Route path="/" element={<Home/>}/>
                                            <Route path="/login" element={<Login/>}/>

                                            {/* Standard Persona Management */}
                                            <Route path="/persona/list"
                                                   element={<ProtectedRoute><PersonaListPage/></ProtectedRoute>}/>
                                            <Route
                                                path="/persona/:personaId/dashboard"
                                                element={<ProtectedRoute><PersonaDashboard/></ProtectedRoute>}
                                            />
                                            {/* This version has the sidebar */}
                                            <Route path="/persona/:id/chat"
                                                   element={<ProtectedRoute><PersonaChatPage/></ProtectedRoute>}/>

                                            {/* ... rest of your boardroom routes ... */}
                                            <Route path="/room/list"
                                                   element={<ProtectedRoute><RoomList/></ProtectedRoute>}/>
                                            <Route path="/room/create"
                                                   element={<ProtectedRoute><RoomCreation/></ProtectedRoute>}/>
                                            <Route path="/room/:roomId"
                                                   element={<ProtectedRoute><RoomDetails/></ProtectedRoute>}/>
                                            <Route path="/room/:roomId/start"
                                                   element={<ProtectedRoute><RoomChat/></ProtectedRoute>}/>
                                        </Routes>
                                    </main>
                                </div>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;