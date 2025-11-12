import React, { useState, useEffect, useCallback } from "react";
// FIX: Reverting to direct external package import, assuming it should be available.
import { useTranslation } from "react-i18next";
import axios from "axios";
// FIX: Reverting to project-specific alias imports (e.g., @/...) to standardize the path resolution relative to the base directory (src).
import { Button } from "@/components/ui/button"; 
import { Plus, Loader2, ArrowLeft, Zap, MessageSquare, History as HistoryIcon } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getSessionsByUserAndPersona } from "@/configurations/api"; 

// Interface for a chat session item
interface SessionItem {
  id: string; 
  persona_id: string;
  title: string;
  start_time: string;
}

const SessionsListPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // We only need 'token' for fetching data.
  const { token } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();

  // Assuming personaId is passed via location state
  const personaId = location.state?.personaId as string | undefined;
  const personaName = location.state?.personaName as string | "Unknown Persona";

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the current session ID from the URL query if available for highlighting
  const currentSessionId = new URLSearchParams(location.search).get('sessionId');

  const fetchSessions = useCallback(async () => {
    if (!token || !personaId) {
        console.warn("SessionsListPage: Skipping session fetch inside callback. Token or Persona ID is missing.");
        return; 
    }
    
    setIsLoading(true);

    try {
      const sessionEndpoint = getSessionsByUserAndPersona(personaId);
      console.log(`SessionsListPage: Attempting to fetch sessions from: ${sessionEndpoint}`);

      // Fetch sessions filtered by the current persona
      const response = await axios.get(sessionEndpoint, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchedSessions: SessionItem[] = response.data
        // Sort sessions by start_timestamp descending
        .sort((a: any, b: any) => new Date(b.start_timestamp).getTime() - new Date(a.start_timestamp).getTime())
        .map((session: any) => ({
          id: session.id,
          persona_id: session.persona_id,
          // Use a default title if none is provided by the backend
          title: session.title || `${t("personachat.conversations.chat_from")} ${new Date(session.start_timestamp).toLocaleDateString()}`, 
          start_time: session.start_timestamp, 
        }));
      
      setSessions(fetchedSessions);

    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast({ title: t("toast.error"), description: t("toast.history_load_error_desc"), variant: "destructive" });
      setSessions([]); // Clear sessions on failure
    } finally {
        setIsLoading(false);
    }
  }, [token, t, personaId, toast]); 

  useEffect(() => {
    // The list will now load once when the component mounts and dependencies are ready.
    if (token && personaId) {
        // Initial fetch
        fetchSessions();
    } else {
        // If not authenticated or no persona context, stop loading and clear state
        setIsLoading(false);
        setSessions([]);
    }
    // No return function needed as there is no interval to clear.
  }, [fetchSessions, personaId, token]);

  const handleSessionSelected = (sessionId: string) => {
    if (!personaId) {
        toast({ title: t("toast.error"), description: t("personachat.no_persona_context"), variant: "destructive" });
        return;
    }
    // Navigate to the correct chat route with the session ID query parameter
    navigate(`/persona/${personaId}/chat?sessionId=${sessionId}`, { state: { personaName: personaName } });
  };

  const handleNewChat = () => {
    if (!personaId) return;
    // Navigate back to the persona chat page without a session ID to start new chat
    navigate(`/persona/${personaId}/chat`, { state: { personaName: personaName } });
  }

  // Fallback if no persona context is available
  if (!personaId) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background p-8">
            <Zap className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">{t("personachat.list_error.title")}</h1>
            <p className="text-muted-foreground mb-8">{t("personachat.list_error.desc")}</p>
            {/* Added type="button" to prevent form submission warning */}
            <Button onClick={() => navigate('/')} type="button">{t("personachat.list_error.button")}</Button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                {/* Added type="button" */}
                <Button variant="ghost" onClick={handleNewChat} type="button"> 
                    <ArrowLeft className="h-4 w-4 mr-2" /> 
                    {t("personachat.back_to_chat") || "Back to New Chat"}
                </Button>
                <h1 className="text-3xl font-extrabold text-foreground flex items-center">
                    <HistoryIcon className="h-6 w-6 mr-3 text-primary" />
                    {t("personachat.conversations.header")}
                </h1>
                {/* Added type="button" */}
                <Button variant="default" onClick={handleNewChat} type="button"> 
                    <Plus className="h-4 w-4 mr-2" />
                    {t("personachat.start_new") || "Start New Chat"}
                </Button>
            </div>

            <h2 className="text-xl font-semibold text-muted-foreground mb-4">
                {t("personachat.list_for")}: <span className="text-primary">{personaName}</span>
            </h2>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3 text-lg text-muted-foreground">{t("personachat.loading_sessions")}</span>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-lg text-muted-foreground">{t("personachat.conversations.no_chats")}</p>
                        {/* Added type="button" */}
                        <Button variant="link" onClick={handleNewChat} className="mt-2" type="button">{t("personachat.start_new")}</Button>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sessions.map((session) => (
                            <li 
                                key={session.id} 
                                className={`p-4 rounded-lg cursor-pointer transition-all border shadow-sm flex flex-col justify-between ${
                                    currentSessionId === session.id ? "bg-primary text-primary-foreground border-primary/50 shadow-lg scale-[1.01]" : "bg-card hover:bg-gray-50 border-gray-200"
                                }`}
                                onClick={() => handleSessionSelected(session.id)}
                            >
                                <div>
                                    <div className="text-base font-bold truncate mb-1">{session.title}</div>
                                    <div className={`text-xs ${currentSessionId === session.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                        {t("personachat.last_updated")}: {new Date(session.start_time).toLocaleString()}
                                    </div>
                                </div>
                                {/*<span className={`mt-2 text-xs font-mono p-1 rounded ${currentSessionId === session.id ? "bg-primary-foreground/10 text-primary-foreground" : "bg-gray-100 text-gray-500"}`}>
                                    ID: {session.id.substring(0, 8)}...
                                </span>*/}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
  );
};

export default SessionsListPage;