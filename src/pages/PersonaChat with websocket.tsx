import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios"; 
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
    getPersonaDetailsEndpoint,
    CHAT_SESSION_START_ENDPOINT,
    getChatMessagesHistory,
    getChatWebSocketEndpoint
} from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";

// Import the necessary components (assuming these paths are correct)
import ChatBox from "@/components/persona/ChatBox";
import SessionHistoryPanel from "@/components/chat/SessionHistoryPanel";


// --- Interface Definitions ---
interface FullPersonaDetails {
    id: string;
    persona_name: string;
    persona_role: string;
    persona_tone: string;
    knowledge_text: string;
    avatar_url: string | null;
    status: "queued" | "processing" | "ready" | "failed";
    user_id: string;
    created_at: string;
    updated_at: string;
    knowledge_files?: any[];
}

interface Message {
    id: string;
    sender: "user" | "bot";
    content: string;
    type?: "video"; 
    videoUrl?: string; 
}

// Helper function to parse URL query parameters
const getQueryParam = (location: any, param: string): string | null => {
    return new URLSearchParams(location.search).get(param);
};


// --- PersonaChatPage (Controller/Container Component) ---
const PersonaChatPage = () => {
    const { id: personaId } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { t } = useTranslation();
    
    const { token, loading: isAuthLoading } = useAuth(); 

    // --- State & Ref Initialization ---
    const wsRef = useRef<WebSocket | null>(null);
    const isFetchedRef = useRef(false); 

    const [persona, setPersona] = useState<FullPersonaDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(getQueryParam(location, 'sessionId'));
    
    // --- LOADING STATES ---
    const [isLoadingPersona, setIsLoadingPersona] = useState(true);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // RAG/Video states
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [generateVideo, setGenerateVideo] = useState(false);


    // 1. Session Creation Callback (Uses HTTP POST)
    const startNewSession = useCallback(async (currentPersonaId: string, resetMessages: boolean = true) => {
        if (!token || !currentPersonaId) {
            console.warn("startNewSession skipped: Token or Persona ID missing.");
            return null;
        }

        setIsLoadingSession(true); 
        try {
            const endpoint = CHAT_SESSION_START_ENDPOINT;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    persona_id: currentPersonaId,
                    title: t("personachat.session_title_placeholder"),
                }),
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Failed to start new session. Status: ${response.status}. URL: ${endpoint}. Response:`, errorBody);
                throw new Error(`Failed to start new session: ${response.status}`);
            }
            
            const data = await response.json();
            const newSessionId = data.session_id || data.id; 

            if (!newSessionId) {
                 throw new Error("Session ID missing in API response.");
            }

            setSessionId(newSessionId);
            navigate(location.pathname + `?sessionId=${newSessionId}`, { replace: true }); 

            if (resetMessages) {
                setMessages([]);
                setSelectedDocuments([]);
                setFiles([]);
                setGenerateVideo(false);
            }

            return newSessionId;
        } catch (error) {
            console.error('Error starting new chat session:', error);
            toast({ title: t("common.error_prefix"), description: t("personachat.error.session_start_failed"), variant: "destructive" });
            return null;
        } finally {
            setIsLoadingSession(false);
        }
    }, [token, toast, t, navigate, location.pathname]);


    // 2. WebSocket Connection and Message Handler
    const connectWebSocket = useCallback((currentSessionId: string): Promise<WebSocket> => {
        return new Promise((resolve, reject) => {
            if (!token || !currentSessionId) {
                return reject(new Error("Token or Session ID missing for WebSocket connection."));
            }

            // Close any existing connection before opening a new one
            if (wsRef.current) {
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close();
                }
            }

            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsBaseUrl = getChatWebSocketEndpoint(currentSessionId) 
                .replace('http:', wsProtocol)
                .replace('https:', wsProtocol);
            
            const wsUrl = `${wsBaseUrl}?token=${token}`; 
            
            console.log("WebSocket attempting connection to:", wsUrl);
            let newWs = new WebSocket(wsUrl);
            wsRef.current = newWs;

            newWs.onopen = () => {
                console.log("WebSocket connection established for session:", currentSessionId);
                resolve(newWs);
            };

            newWs.onmessage = (event) => {
                try {
                    const messageData = JSON.parse(event.data);
                    
                    // --- NEW: Handle PONG response from server ---
                    if (messageData.type === 'pong') {
                        // Successfully received PONG. Connection is confirmed healthy.
                        return; 
                    }
                    // ---------------------------------------------
                    
                    if (messageData.content) {
                        // NOTE: This logic assumes simple message updates; for full streaming, 
                        // you would need logic to FIND and UPDATE a message by its message_id.
                        setMessages(prevMessages => {
                            return [...prevMessages, {
                                id: messageData.message_id || Date.now().toString(),
                                sender: messageData.sender || "bot",
                                content: messageData.content,
                                type: messageData.type,
                                videoUrl: messageData.video_url || undefined,
                            }];
                        });
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            newWs.onerror = (error) => {
                console.error("WebSocket Error:", error);
                toast({ title: t("common.error_prefix"), description: t("personachat.error.ws_error"), variant: "destructive" });
            };

            newWs.onclose = (event) => {
                console.log(`WebSocket connection closed. Code: ${event.code}. Reason: ${event.reason}`);
                // If it closes immediately with 1006, reject the promise to fail the handleSubmit call
                if (event.code === 1006 && newWs.readyState !== WebSocket.OPEN) {
                    reject(new Error(`WebSocket failed to connect (1006 Abnormal Closure). Check server auth/route.`));
                }
            };
        });
    }, [token, t, toast]);


    // 3. Initial Data Fetch and Session Start Logic (HTTP fetch)
    useEffect(() => {
        if (!personaId || !token || isAuthLoading) { 
            return; 
        }

        if (isFetchedRef.current) {
            return;
        }
        
        isFetchedRef.current = true; 

        // --- Fetching Functions ---
        const fetchPersonaDetails = async () => {
            setIsLoadingPersona(true);
            try {
                const endpoint = getPersonaDetailsEndpoint(personaId);
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setPersona(data);
            } catch (error) {
                console.error("Failed to fetch persona details:", error);
                toast({ title: t("common.error_prefix"), description: t("personachat.error.persona_not_loaded"), variant: "destructive" });
            } finally {
                setIsLoadingPersona(false);
            }
        };

        const fetchChatHistory = async (currentSessionId: string) => {
            if (!token || !currentSessionId) return;
            setIsLoadingSession(true); 
            try {
                const endpoint = getChatMessagesHistory(currentSessionId);
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const loadedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    sender: msg.sender,
                    content: msg.content,
                    videoUrl: msg.video_url || undefined,
                }));
                setMessages(loadedMessages);
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
                toast({ title: t("common.error_prefix"), description: t("personachat.error.history_load_failed"), variant: "destructive" });
            } finally {
                setIsLoadingSession(false); 
            }
        };

        // --- Execution ---
        fetchPersonaDetails(); 

        if (sessionId) {
            fetchChatHistory(sessionId);
        } else {
            startNewSession(personaId, false); 
        }

    }, [personaId, sessionId, token, t, toast, startNewSession, isAuthLoading]); 
    
    
    // 4. WebSocket Keep-Alive (Ping/Pong) Logic (CRITICAL FIX FOR 1006)
    useEffect(() => {
        // Ping interval should be shorter than the shortest expected network timeout (e.g., 30s)
        const PING_INTERVAL_MS = 15000; 
        const pingPayload = JSON.stringify({ type: 'ping' });

        const interval = setInterval(() => {
            const ws = wsRef.current;
            
            // Send ping only if the connection is open
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(pingPayload);
                } catch (error) {
                    console.warn("Failed to send WS PING:", error);
                }
            }
        }, PING_INTERVAL_MS);

        // Cleanup function
        return () => {
            clearInterval(interval);
        };
    }, []); 


    // 5. handleSubmit: CONNECTS WS IF NECESSARY, THEN SENDS MESSAGE
   const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputMessage.trim() || !sessionId || !token || !personaId) return;

    const query = inputMessage.trim();
    // 1. Add user message to state immediately
    const userMessage: Message = { id: `temp-${Date.now()}`, sender: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSubmitting(true);
    
    // 2. Check and Open WebSocket Connection (if not open)
    let ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        
        if (!personaId || !token || !sessionId) {
            console.error("Cannot connect WS: Missing dependencies.");
            setIsSubmitting(false);
            return;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsBaseUrl = getChatWebSocketEndpoint(sessionId) 
            .replace('http:', wsProtocol)
            .replace('https:', wsProtocol);
        const wsUrl = `${wsBaseUrl}?token=${token}`; 

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const connectionPromise = new Promise<void>((resolve, reject) => {
            ws!.onopen = () => { resolve(); };
            ws!.onerror = (err) => { reject(err); };
            ws!.onclose = (event) => {
                 if (event.code === 1006) {
                    reject(new Error("WebSocket connection failed (Abnormal Closure 1006)."));
                }
            };
        });

        try {
            await connectionPromise; // Wait for connection to open
        } catch(error) {
            console.error("Failed to connect WS:", error);
            toast({ title: t("common.error_prefix"), description: t("personachat.error.ws_connect_failed"), variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
    }
    
    // 3. Connection is guaranteed open: SEND THE MESSAGE
    try {
        const messagePayload = {
            query: query,
            persona_id: personaId,
            selected_docs: selectedDocuments,
            generate_video: generateVideo,
        };
        
        ws.send(JSON.stringify({ type: 'message', data: messagePayload })); 
        
    } catch (error) {
        console.error("Error sending message over WebSocket:", error);
        toast({ title: t("common.error_prefix"), description: t("personachat.error.ws_send_failed"), variant: "destructive" });
        setIsSubmitting(false);
    }
}, [inputMessage, isSubmitting, sessionId, token, personaId, generateVideo, selectedDocuments, toast, t]);

    // 6. handleNewConversation: Closes old WS connection, starts new HTTP session
    const handleNewConversation = useCallback(async () => {
        // Close the current WebSocket connection if open
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            wsRef.current.close();
            wsRef.current = null;
        }
        await startNewSession(personaId!, true);
    }, [personaId, startNewSession]);


    // 7. Other handlers (omitted for brevity)
    const handleViewHistory = useCallback(() => {
        navigate(`/chat/history/${personaId}`);
    }, [navigate, personaId]);

    const handleCheckboxChange = useCallback((documentId: string) => {
        setSelectedDocuments(prev => 
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    }, []);

    // Dropzone setup
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles);
        },
        noClick: files.length > 0,
        disabled: isSubmitting,
    });


    // --- RENDER ---
    
    if (isAuthLoading) { 
        return <div className="loading-message flex justify-center items-center h-full">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t("common.loading_auth") || "Verifying authentication..."}
        </div>;
    }

    if (isLoadingPersona || (sessionId && isLoadingSession) || (!sessionId && isLoadingSession)) {
        return <div className="loading-message flex justify-center items-center h-full">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t("common.loading_persona_chat") || "Loading persona chat..."}
        </div>;
    }
    
    if (!persona) {
        return <div className="error-message text-center p-8 text-destructive">{t("common.error_persona_not_found") || "Error: Persona not found or failed to load."}</div>;
    }

    return (
        <div className="flex h-full w-full">
            {/* Left Sidebar for Session History */}
            <div className="hidden lg:block w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <SessionHistoryPanel
                    personaId={personaId!}
                    currentSessionId={sessionId}
                    onNewSession={handleNewConversation}
                    onSessionSelect={(newId: string) => {
                        setSessionId(newId);
                        navigate(location.pathname + `?sessionId=${newId}`, { replace: true });
                    }}
                    t={t}
                    toast={toast}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col h-full">

                    <div className="text-center mb-4">
                        <h1 className="text-3xl font-bold text-foreground">
                            {t("personachat.ask_persona_link")}
                            {persona ? ` - ${persona.persona_name}` : ""}
                        </h1>
                    </div>

                    {/* Chat and Options Box */}
                    <ChatBox
                        messages={messages}
                        persona={persona}
                        messagesEndRef={messagesEndRef}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        isSubmitting={isSubmitting}
                        handleSubmit={handleSubmit} 
                        handleNewConversation={handleNewConversation}
                        handleViewHistory={handleViewHistory}
                        // RAG Options
                        files={files}
                        setFiles={setFiles}
                        selectedDocuments={selectedDocuments}
                        handleCheckboxChange={handleCheckboxChange}
                        generateVideo={generateVideo}
                        setGenerateVideo={setGenerateVideo}
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        toast={toast}
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonaChatPage;