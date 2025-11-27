import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
    getPersonaDetailsEndpoint,
    getPersonaAnswerEndpoint,
    CHAT_SESSION_START_ENDPOINT,
    getChatMessagesHistory
} from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";

// Import the new ChatBox component
import ChatBox from "@/components/persona/PersonaChatBox"; 


// --- Interface Definitions (Kept here for data/logic) ---
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
}

// Helper function to parse URL query parameters
const getQueryParam = (location: any, param: string): string | null => {
    return new URLSearchParams(location.search).get(param);
};


// --- PersonaChatPage (Controller/Container Component) ---
const PersonaChatPage = () => {
    const location = useLocation();
    const { id: personaId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { token, user } = useAuth();
    
    // State Management
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(getQueryParam(location, 'sessionId'));
    const [inputMessage, setInputMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generateVideo, setGenerateVideo] = useState(false);
    const [persona, setPersona] = useState<FullPersonaDetails | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    
    // --- Handlers for Logic ---
    
    // Helper to start a new chat session
    const startNewSession = useCallback(async (pId: string): Promise<string | null> => {
        if (!token) {
            toast({ title: t("toast.error"), description: "Authentication failed. Please log in.", variant: "destructive" });
            return null;
        }
        try {
            const response = await axios.post(CHAT_SESSION_START_ENDPOINT, {
                persona_id: pId,
            }, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            return response.data.id as string;
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.detail || error.message
                : "An unexpected network error occurred.";
            console.error("Failed to start new session:", errorMessage);
            toast({ title: t("toast.error"), description: `Failed to start session. Server detail: ${errorMessage}`, variant: "destructive" });
            return null;
        }
    }, [token, toast, t]);

    // Helper to fetch and load messages for a session
    const loadConversationHistory = useCallback(async (sId: string) => {
        if (!token) return;
        setMessages([]); // Clear current messages while loading

        try {
            const response = await axios.get(getChatMessagesHistory(sId), {
                headers: { Authorization: `Bearer ${token}` },
            });

            const history: Message[] = response.data.map((msg: any) => ({
                id: msg.id,
                sender: msg.sender === 'user' ? 'user' : 'bot',
                content: msg.content,
                type: msg.type || (msg.content?.startsWith('http') && (msg.content.includes('.mp4') || msg.content.includes('/video'))) ? 'video' : undefined,
            }));
            setMessages(history);
        } catch (error) {
            console.error("Failed to load conversation history:", error);
            toast({ title: t("toast.history_load_failed"), description: t("toast.history_load_error_desc"), variant: "destructive" });
        }
    }, [token, toast, t]);

    // --- Fetch Persona Details ---
    const fetchPersonaDetails = useCallback(async () => {
        if (!personaId || !token) return;

        try {
            const response = await fetch(getPersonaDetailsEndpoint(personaId), {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch persona");
            const data: FullPersonaDetails = await response.json();
            setPersona(data);
        } catch (err) {
            console.error(err);
        }
    }, [personaId, token]);

    // Logic for the History button click
    const handleViewHistory = useCallback(() => {
        if (!personaId || !persona?.persona_name) return;
        navigate(`/sessions-list`, { state: { personaId: personaId, personaName: persona.persona_name } });
    }, [personaId, persona?.persona_name, navigate]);

    const handleNewConversation = useCallback(() => {
        navigate(`/persona/${personaId}/chat`, { replace: true });
        setMessages([]);
        setInputMessage("");
        setFiles([]);
        setSelectedDocuments([]);
        setGenerateVideo(false);
        setSessionId(null);
    }, [personaId, navigate]);

    const handleCheckboxChange = useCallback((value: string) => {
        setSelectedDocuments((prev) => (prev.includes(value) ? prev.filter((doc) => doc !== value) : [...prev, value]));
    }, []);


    const handleSubmit = useCallback(async (e: React.FormEvent, generateVideoOption: boolean) => {
        e.preventDefault();
        if (!inputMessage.trim() && files.length === 0) return;

        let finalSessionId = sessionId;

        // 1. If no session ID exists, create one before sending the message
        if (!finalSessionId && personaId) {
            setIsSubmitting(true);
            const newSessionId = await startNewSession(personaId);
            if (newSessionId) {
                finalSessionId = newSessionId;
                setSessionId(newSessionId);
                // CRITICAL: Update the URL *after* session creation so subsequent loads are correct
                navigate(`/persona/${personaId}/chat?sessionId=${newSessionId}`, { replace: true });
            } else {
                setIsSubmitting(false);
                toast({ title: t("toast.error"), description: t("personachat.session_start_failed") || "Could not start new chat session.", variant: "destructive" });
                return;
            }
        }

        if (!finalSessionId) {
            setIsSubmitting(false);
            return;
        }

        const newUserMessage: Message = { id: String(Date.now()), sender: "user", content: inputMessage || t("personachat.file_query") };
        setMessages((prev) => [...prev, newUserMessage]);
        setInputMessage("");
        // Set submitting AFTER adding the message, so the `useEffect` doesn't interfere
        setIsSubmitting(true); 

        const thinkingMessage: Message = { id: String(Date.now() + 1), sender: "bot", content: "thinking" };
        setMessages((prev) => [...prev, thinkingMessage]);

        try {
            const formData = new FormData();
            formData.append("query", newUserMessage.content);
            formData.append("session_id", finalSessionId);

            const currentChatHistory = [...messages, newUserMessage].map(msg => ({ sender: msg.sender, content: msg.content }));
            formData.append("chat_history", JSON.stringify(currentChatHistory));

            formData.append("documents", JSON.stringify(selectedDocuments));
            files.forEach((file) => formData.append("user_docs", file));
            formData.append("generate_video", generateVideoOption ? "true" : "false");
            formData.append("save", "true");

            const response = await axios.post(getPersonaAnswerEndpoint(personaId), formData, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
            });

            const { answer, video_url } = response.data;

            setMessages((prev) => prev.slice(0, -1)); // Remove 'thinking'

            if (video_url) {
                toast({ title: t("toast.video_generating.title"), description: t("toast.video_generating.description") });
                setTimeout(() => {
                    const videoMessage: Message = { id: String(Date.now()), sender: "bot", content: video_url, type: "video" };
                    setMessages((prev) => prev.concat(videoMessage));
                    toast({ title: t("toast.video_ready.title"), description: t("toast.video_ready.description") });
                    setIsSubmitting(false);
                    setFiles([]);
                }, 10000); // Mock video generation delay
            } else {
                const botAnswer = answer || t("personachat.bot_fallback_error");
                setMessages((prev) => prev.concat({ id: String(Date.now()), sender: "bot", content: botAnswer }));
                toast({ title: t("toast.question_sent.title"), description: t("toast.question_sent.description") });
                setIsSubmitting(false);
                setFiles([]);
            }
        } catch (error: any) {
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : t("toast.unexpected_error_short");
            setMessages((prev) => prev.slice(0, -1).concat({ id: String(Date.now()), sender: "bot", content: `${t("personachat.error_prefix")}: ${errorMessage}` }));
            toast({ title: t("toast.submission_failed.title"), description: errorMessage, variant: "destructive" });
            setIsSubmitting(false);
        }
    }, [sessionId, inputMessage, files, selectedDocuments, personaId, token, toast, t, navigate, messages, startNewSession]);


    // --- EFFECTS ---

    // Effect to fetch persona details on mount/ID change
    useEffect(() => {
        fetchPersonaDetails();
    }, [fetchPersonaDetails]);
    
    // EFFECT to handle URL changes and load history (FIX APPLIED HERE)
    useEffect(() => {
        const urlSessionId = getQueryParam(location, 'sessionId');

        // 1. Update session ID state if the URL has changed
        if (urlSessionId !== sessionId) {
            setSessionId(urlSessionId);
        }

        // 2. Load history or clear chat based on URL
        if (urlSessionId) {
            
            // CRITICAL FIX: If we are currently submitting, we assume the messages are correct 
            // locally and the server is saving them. We skip history load 
            // to prevent wiping out the un-saved Q1/thinking message.
            if (isSubmitting) {
                return;
            }
            
            // For all other cases (e.g., initial load with a session ID, or navigating between sessions), load history.
            loadConversationHistory(urlSessionId);
        } else {
            // If there's no session ID in the URL, ensure the chat is clear for a NEW session
            setMessages([]);
        }
    }, [location.search, loadConversationHistory, sessionId, isSubmitting]); // ADDED isSubmitting to dependencies

    // Effect to scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
            <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        {t("personachat.ask_persona_link")}
                        {persona ? ` - ${persona.persona_name}` : ""}
                    </h1>
                </div>

                {/* Render the new ChatBox component, passing all props down */}
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
                    files={files}
                    setFiles={setFiles}
                    selectedDocuments={selectedDocuments}
                    handleCheckboxChange={handleCheckboxChange}
                    generateVideo={generateVideo}
                    setGenerateVideo={setGenerateVideo}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    toast={toast} // Pass toast down for use in copy/download handlers
                />

            </div>
        </div>
    );
};

export default PersonaChatPage;