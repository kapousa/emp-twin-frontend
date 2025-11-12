import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Button } from "../../components/ui/button"; // Corrected alias path
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthProvider"; // Corrected alias path
import { useToast } from "../../hooks/use-toast"; // Corrected alias path
// FIX: The import is correct based on your existing setup
import { getSessionsByUserAndPersona } from "../../configurations/api"; // Corrected alias path

// Interface for a chat session item
interface SessionItem {
  id: string; 
  persona_id: string;
  title: string;
  start_time: string;
}

interface ConversationListProps {
    currentSessionId: string | null;
    personaId: string | null; 
    onSessionSelected: (sessionId: string) => void;
    onNewConversation: () => void;
    onSessionListUpdated: () => void;
    onInitialSessionSelected: (sessionId: string | null) => void; 
}

const ConversationList: React.FC<ConversationListProps> = ({ 
    currentSessionId, 
    personaId, 
    onSessionSelected, 
    onNewConversation,
    onInitialSessionSelected,
    onSessionListUpdated,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast(); // <-- ADDED
  // FIX: Only need 'token' for the API call, removing 'user' dependency
  const { token } = useAuth(); 
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchSessions = useCallback(async () => {
    const sessionEndpoint = getSessionsByUserAndPersona(personaId); // <-- CALCULATE ENDPOINT

    // FIX: Block only if token or personaId is missing (user.id is no longer required)
    if (!token || !personaId) {
        console.warn("ConversationList: Skipping session fetch. Token or Persona ID is missing.", { token: !!token, personaId });
        setSessions([]); 
        return; 
    }
    
    setIsLoading(true);

    try {
      // LOGGING THE ATTEMPTED URL for debugging network issues
      console.log(`ConversationList: Attempting to fetch sessions from: ${sessionEndpoint}`); 
        
      // FIX: Use the existing function, passing only personaId
      // The user_id is handled by the backend's get_current_user dependency.
      const response = await axios.get(sessionEndpoint, { // <-- Use the calculated endpoint
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchedSessions: SessionItem[] = response.data
        // Sort by timestamp descending (most recent first)
        .sort((a: any, b: any) => new Date(b.start_timestamp).getTime() - new Date(a.start_timestamp).getTime())
        .map((session: any) => ({
          id: session.id,
          persona_id: session.persona_id,
          title: session.title || `${t("personachat.conversations.chat_from")} ${new Date(session.start_timestamp).toLocaleDateString()}`, 
          start_time: session.start_timestamp, 
        }));
      
      setSessions(fetchedSessions);
      onSessionListUpdated();

      if (!currentSessionId && fetchedSessions.length > 0) {
          onInitialSessionSelected(fetchedSessions[0].id);
      } else if (!currentSessionId && fetchedSessions.length === 0) {
          onInitialSessionSelected(null);
      }

    } catch (error) {
      console.error("ConversationList: Failed to fetch sessions:", error);
      toast({
          title: t("common.error"),
          description: t("personachat.conversations.fetch_error"),
          variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  // FIX: Removed user?.id from the dependency array
  }, [token, t, personaId, currentSessionId, onInitialSessionSelected, onSessionListUpdated, toast]); // <-- ADDED toast to dependency array

  useEffect(() => {
    // FIX: Only check for personaId to trigger the fetch
    if (personaId) { 
        fetchSessions();
        // Set an interval to refresh the list every 10 seconds
        const interval = setInterval(fetchSessions, 10000); 
        return () => clearInterval(interval);
    }
  // FIX: Removed user?.id from the dependency array
  }, [fetchSessions, personaId]);


  return (
    <div className="flex flex-col p-4 border-r border-gray-200 h-full">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold">{t("personachat.conversations.header")}</h3>
        <Button variant="outline" size="icon" onClick={onNewConversation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {isLoading ? (
            <li className="flex justify-center items-center h-full py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </li>
        ) : sessions.length === 0 ? (
            <li className="text-sm text-muted-foreground">{t("personachat.conversations.no_chats")}</li>
        ) : (
            sessions.map((session) => (
                <li 
                    key={session.id} 
                    className={`p-2 rounded-md cursor-pointer transition-colors ${currentSessionId === session.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-gray-100"}`}
                    onClick={() => onSessionSelected(session.id)}
                >
                    <div className="text-sm font-medium truncate">{session.title}</div>
                    <div className={`text-xs ${currentSessionId === session.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(session.start_time).toLocaleTimeString()}</div>
                </li>
            ))
        )}
      </ul>
    </div>
  );
};

export default ConversationList;