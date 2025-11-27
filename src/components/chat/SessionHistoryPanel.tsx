// src/components/chat/SessionHistoryPanel.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Plus, Loader2, MessageSquare, History as HistoryIcon, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getSessionsByUserAndPersona } from "@/configurations/api"; 
import { Button } from "@/components/ui/button";

// Interface for a chat session item (copied from SessionsList.tsx)
interface SessionItem {
    id: string; 
    persona_id: string;
    title: string;
    start_timestamp: string; // Ensure this is expected to be an ISO string
}

interface SessionHistoryPanelProps {
    personaId: string;
    currentSessionId: string | null;
    onNewSession: () => void;
    onSessionSelect: (sessionId: string) => void;
    // Props passed from PersonaChatPage
    t: (key: string) => string; 
    toast: any;
}

const SessionHistoryPanel: React.FC<SessionHistoryPanelProps> = ({ 
    personaId, 
    currentSessionId, 
    onNewSession, 
    onSessionSelect, 
    t, 
    toast 
}) => {
    const { token } = useAuth(); 
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = useCallback(async () => {
        if (!token || !personaId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(getSessionsByUserAndPersona(personaId), {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Sort by start_time descending (newest first)
            const sortedSessions = response.data.sort((a: SessionItem, b: SessionItem) => 
                new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
            );
            setSessions(sortedSessions);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast({ 
                title: t("toast.error_fetch_history_title") || "Error", 
                description: t("toast.error_fetch_history_desc") || "Could not load chat history for this persona.", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    }, [token, personaId, toast, t]);

    useEffect(() => {
        // Fetch sessions immediately on mount and on personaId change
        fetchSessions();
        // Optionally set up a refresh interval
        const intervalId = setInterval(fetchSessions, 60000); 
        return () => clearInterval(intervalId);
    }, [fetchSessions]);


    return (
        <div className="w-80 flex-shrink-0 border-r p-4 space-y-4 bg-gray-50 dark:bg-gray-800 h-full overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-between border-b pb-2">
                <HistoryIcon className="h-5 w-5 mr-2" />
                {t("sessionslist.header") || "Chat Sessions"}
            </h3>

            <div className="flex space-x-2">
                <Button 
                    onClick={onNewSession} 
                    className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("personachat.start_new") || "New Chat"}
                </Button>
                <Button 
                    onClick={fetchSessions} 
                    variant="outline"
                    size="icon"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center py-6 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        {t("sessionslist.loading") || "Loading sessions..."}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-6">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        {t("sessionslist.no_sessions") || "No sessions found yet."}
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {sessions.map((session) => {
                            // --- START OF FIX ---
                            const sessionDate = new Date(session.start_timestamp);
                            const isDateValid = !isNaN(sessionDate.getTime());
                            // --- END OF FIX ---

                            return (
                                <li
                                    key={session.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border shadow-sm flex flex-col justify-between ${
                                        currentSessionId === session.id 
                                            ? "bg-primary text-primary-foreground border-primary/50 shadow-lg scale-[1.01]" 
                                            : "bg-card hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-700"
                                    }`}
                                    onClick={() => onSessionSelect(session.id)}
                                >
                                    <div>
                                        <div className="text-sm font-semibold truncate mb-1">{session.title}</div>
                                        <div className={`text-xs ${currentSessionId === session.id ? "text-primary-foreground/80" : "text-muted-foreground dark:text-gray-400"}`}>
                                            {t("personachat.last_updated") || "Last Update"}:{" "}
                                            {/* --- Display conditionally based on validity --- */}
                                            {isDateValid 
                                                ? sessionDate.toLocaleDateString() 
                                                : (session.start_timestamp ? t("common.invalid_date_format") || "Invalid Date Format" : t("common.no_date_available") || "No Date Available")
                                            }
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SessionHistoryPanel;