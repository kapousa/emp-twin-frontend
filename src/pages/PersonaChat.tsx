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

import ChatBox from "@/components/persona/ChatBox";
import SessionHistoryPanel from "@/components/chat/SessionHistoryPanel";

// --- Interface Definitions ---
interface Message {
    id: string;
    sender: "user" | "bot";
    content: string;
    type?: "video";
    suggestions?: string[]; // Always defined in bot responses
}

interface FullPersonaDetails {
    id: string;
    persona_name: string;
    persona_role: string;
    persona_tone: string;
    avatar_url: string | null;
}

const getQueryParam = (location: any, param: string): string | null => {
    return new URLSearchParams(location.search).get(param);
};

const PersonaChatPage = () => {
    const location = useLocation();
    const { id: personaId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { token } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(getQueryParam(location, 'sessionId'));
    const [inputMessage, setInputMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generateVideo, setGenerateVideo] = useState(false);
    const [persona, setPersona] = useState<FullPersonaDetails | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Session & History Logic ---
    const startNewSession = useCallback(async (pId: string) => {
        try {
            const res = await axios.post(CHAT_SESSION_START_ENDPOINT, { persona_id: pId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.id;
        } catch (e) { return null; }
    }, [token]);

    const loadHistory = useCallback(async (sId: string) => {
        if (!token) return;
        try {
            const res = await axios.get(getChatMessagesHistory(sId), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const history = res.data.map((msg: any) => ({
                id: msg.id,
                sender: msg.sender === 'user' ? 'user' : 'bot',
                content: msg.content,
                suggestions: msg.suggestions || [],
                type: msg.type || undefined
            }));
            setMessages(history);
        } catch (e) { console.error(e); }
    }, [token]);

    const fetchPersona = useCallback(async () => {
        if (!personaId || !token) return;
        try {
            const res = await fetch(getPersonaDetailsEndpoint(personaId), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPersona(data);
        } catch (e) { console.error(e); }
    }, [personaId, token]);

    // --- Submission Logic ---
    // 1. Update the function signature to accept 'overrideQuery'
const handleSubmit = useCallback(async (e: React.FormEvent, generateVideoOption: boolean, overrideQuery?: string) => {
    e.preventDefault();

    // 2. Determine the query: use the suggestion (overrideQuery) if it exists,
    // otherwise use the typed inputMessage.
    const currentQuery = overrideQuery || inputMessage || t("personachat.file_query");

    // 3. Update the guard to check currentQuery instead of just inputMessage
    if (!currentQuery.trim() && files.length === 0) return;

    // Capture history before resets
    const historyToSend = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
    }));

    let finalSessionId = sessionId;
    setIsSubmitting(true);

    // Handle Session Creation
    if (!finalSessionId && personaId) {
        const newSessionId = await startNewSession(personaId);
        if (newSessionId) {
            finalSessionId = newSessionId;
            setSessionId(newSessionId);
            navigate(`/persona/${personaId}/chat?sessionId=${newSessionId}`, { replace: true });
        } else {
            setIsSubmitting(false);
            return;
        }
    }

    // 4. Update Local UI with the correct query
    const newUserMessage: Message = { id: String(Date.now()), sender: "user", content: currentQuery };
    setMessages((prev) => [...prev, newUserMessage, { id: "thinking", sender: "bot", content: "thinking" }]);

    // Only clear input if we didn't use a suggestion (keeps UI clean)
    if (!overrideQuery) setInputMessage("");

    try {
        const formData = new FormData();
        formData.append("query", currentQuery); // Now sends the suggestion correctly!
        formData.append("session_id", finalSessionId!);
        formData.append("chat_history", JSON.stringify(historyToSend));
        formData.append("documents", JSON.stringify(selectedDocuments));
        files.forEach((file) => formData.append("user_docs", file));
        formData.append("generate_video", generateVideoOption ? "true" : "false");
        formData.append("save", "true");

        const response = await axios.post(getPersonaAnswerEndpoint(personaId!), formData, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });

        const { answer, video_url, suggestions } = response.data;

        setMessages((prev) => {
            const historyWithoutThinking = prev.filter(m => m.id !== "thinking");
            const botMsg: Message = video_url
                ? { id: String(Date.now()), sender: "bot", content: video_url, type: "video", suggestions: suggestions || [] }
                : { id: String(Date.now()), sender: "bot", content: answer || t("personachat.bot_fallback_error"), suggestions: suggestions || [] };
            return [...historyWithoutThinking, botMsg];
        });

        setFiles([]);
    } catch (error: any) {
        setMessages((prev) => prev.filter(m => m.id !== "thinking"));
        toast({ title: t("toast.error"), description: "Failed to get answer", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
}, [sessionId, inputMessage, messages, personaId, token, t, navigate, startNewSession, files, selectedDocuments]);

    useEffect(() => { fetchPersona(); }, [fetchPersona]);
    useEffect(() => {
        const urlSid = getQueryParam(location, 'sessionId');
        if (urlSid && urlSid !== sessionId) {
            setSessionId(urlSid);
            loadHistory(urlSid);
        }
    }, [location.search, loadHistory]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop: (accepted) => setFiles(accepted) });

    return (
        <div className="w-full min-h-screen bg-background p-4 sm:p-8">
            <div className="flex h-[80vh] border rounded-xl shadow-xl overflow-hidden bg-card">
                {personaId && (
                    <SessionHistoryPanel
                        personaId={personaId}
                        currentSessionId={sessionId}
                        onNewSession={() => { setMessages([]); setSessionId(null); navigate(`/persona/${personaId}/chat`); }}
                        onSessionSelect={(id) => navigate(`/persona/${personaId}/chat?sessionId=${id}`)}
                        t={t} toast={toast}
                    />
                )}
                <ChatBox
                    messages={messages} persona={persona} messagesEndRef={messagesEndRef}
                    inputMessage={inputMessage} setInputMessage={setInputMessage}
                    isSubmitting={isSubmitting} handleSubmit={handleSubmit}
                    files={files} setFiles={setFiles}
                    selectedDocuments={selectedDocuments} handleCheckboxChange={(val) => setSelectedDocuments(prev => prev.includes(val) ? prev.filter(v => v!==val) : [...prev, val])}
                    generateVideo={generateVideo} setGenerateVideo={setGenerateVideo}
                    getRootProps={getRootProps} getInputProps={getInputProps} toast={toast}
                    handleNewConversation={() => {}} handleViewHistory={() => {}}
                />
            </div>
        </div>
    );
};

export default PersonaChatPage;