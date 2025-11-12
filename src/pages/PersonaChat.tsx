import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // <-- ADD useLocation
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, Bot, User, FileText, Plus, MessageSquare, Copy, Download, Zap, History } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { 
  getPersonaDetailsEndpoint, 
  getPersonaAnswerEndpoint, 
  CHAT_SESSION_START_ENDPOINT,
  getChatMessagesHistory 
} from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";


// --- Interface Definitions ---
interface PersonaAvatarProps {
  avatarUrl: string | null;
  name: string;
}

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


// --- PersonaAvatar Component ---
const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ avatarUrl, name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-primary-foreground bg-primary/80 overflow-hidden shadow-lg border-2 border-primary/50 shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};


// --- ChatDisplay Component ---
const ChatDisplay = ({
  messages,
  messagesEndRef,
  toast,
  persona,
}: {
  messages: Message[];
  messagesEndRef: any;
  toast: any;
  persona: FullPersonaDetails | null;
}) => {
  const { t } = useTranslation();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t("toast.copy_success.title"), description: t("toast.copy_success.description") });
    } catch (err) {
      toast({ title: t("toast.copy_failed.title"), description: t("toast.copy_failed.description"), variant: "destructive" });
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "video-answer.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t("toast.download_start.title"), description: t("toast.download_start.description") });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Attractive Persona Header */}
      {persona && (
        <div className="flex items-center p-4 border-b bg-card/50 shadow-sm sticky top-0 z-10">
          <PersonaAvatar avatarUrl={persona.avatar_url} name={persona.persona_name} />
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{persona.persona_name}</h2>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center">
                <Zap className="h-3.5 w-3.5 mr-1 text-primary/70" />
                {persona.persona_role}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="italic">{t("personachat.tone_label")}: {persona.persona_tone}</span>
            </div>
          </div>
        </div>
      )}
      {/* END Attractive Persona Header */}

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold">
              {t("personachat.chat_start.title")} {persona?.persona_name || ""}
            </h2>
            <p className="max-w-md mt-2">{t("personachat.chat_start.description")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                persona?.avatar_url ? (
                  <img src={persona.avatar_url} alt="Bot Avatar" className="h-8 w-8 rounded-full object-cover mt-1" />
                ) : (
                  <Bot className="h-8 w-8 text-primary mt-1" />
                )
              )}
              <div className={`p-3 rounded-xl max-w-2/3 flex flex-col ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"}`}>
                {msg.type === "video" ? (
                  <video src={msg.content} controls className="rounded-lg w-full max-h-96" />
                ) : msg.content === "thinking" ? (
                  <div className="flex items-center space-x-1">
                    {/* Simplified thinking animation */}
                    <span className="dot animate-pulse h-2 w-2 bg-primary rounded-full"></span>
                    <span className="dot animate-pulse h-2 w-2 bg-primary rounded-full delay-200"></span>
                    <span className="dot animate-pulse h-2 w-2 bg-primary rounded-full delay-400"></span>
                  </div>
                ) : (
                  <ReactMarkdown>{String(msg.content || "")}</ReactMarkdown>
                )}

                {msg.sender === "bot" && msg.content !== "thinking" && (
                  <div className="flex justify-end mt-2">
                    {msg.type === "video" ? (
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(msg.content)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(msg.content)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === "user" && <User className="h-8 w-8 text-muted-foreground mt-1" />}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};


// --- Document Options ---
const DOCUMENT_OPTIONS_KEYS = [
  { value: "Generate Resume", labelKey: "Generate Resume" },
  { value: "Generate Intro Video", labelKey: "Generate Intro Video" },
  { value: "Reply to my today's Emails", labelKey: "Reply to my today’s Emails" },
  { value: "Send message to freind", labelKey: "Send message to freind" },
];

// --- PersonaChatPage ---
const PersonaChatPage = () => {
  const location = useLocation(); // <-- ADDED
  const [messages, setMessages] = useState<Message[]>([]);
  // Use session ID from URL query if present, otherwise null for a new session
  const [sessionId, setSessionId] = useState<string | null>(getQueryParam(location, 'sessionId')); 
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateVideo, setGenerateVideo] = useState(false);
  const [persona, setPersona] = useState<FullPersonaDetails | null>(null);
  
  // refreshListKey is now obsolete since the list component is separate. Removing its use.
  // const [refreshListKey, setRefreshListKey] = useState(0); 

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { id: personaId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Helper to start a new chat session
  const startNewSession = useCallback(async (pId: string): Promise<string | null> => {
    if (!token || !user?.id) {
        toast({ title: t("toast.error"), description: "Authentication failed. Please log in.", variant: "destructive" });
        return null; 
    }
    try {
      const response = await axios.post(CHAT_SESSION_START_ENDPOINT, {
        persona_id: pId,
        user_id: user.id
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
  }, [token, toast, t, user?.id]);
  
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
        // Assuming video type is determined by content or another flag
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

  useEffect(() => {
    fetchPersonaDetails();
  }, [fetchPersonaDetails]);
  
  // --- EFFECT to handle URL changes and load history ---
  useEffect(() => {
    // 1. Check URL for new sessionId
    const urlSessionId = getQueryParam(location, 'sessionId');
    
    // 2. If URL sessionId changed or is different from current state, update state
    if (urlSessionId !== sessionId) {
        setSessionId(urlSessionId);
    }

    // 3. If a sessionId is set (either from initial state or URL change), load history
    if (urlSessionId) { 
        loadConversationHistory(urlSessionId);
    } else {
        // If there's no session ID in the URL, ensure the chat is clear for a NEW session
        setMessages([]); 
    }
  }, [location.search, loadConversationHistory, sessionId]); 
  // Dependency on `sessionId` is intentional here to prevent infinite loop 
  // if the URL updates but the state hasn't caught up, though `location.search` is the primary trigger.


  const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCheckboxChange = (value: string) => {
    setSelectedDocuments((prev) => (prev.includes(value) ? prev.filter((doc) => doc !== value) : [...prev, value]));
  };

  const handleNewConversation = () => {
    // FIX: Navigate to the correct chat route /persona/:id/chat 
    // without the sessionId query param to signal a fresh session.
    navigate(`/persona/${personaId}/chat`, { replace: true });

    // CRITICAL: Force local state reset for immediate UX
    setMessages([]);
    setInputMessage("");
    setFiles([]); 
    setSelectedDocuments([]); 
    setGenerateVideo(false); 
    setSessionId(null); 
    // The useEffect above will catch the URL change and confirm the reset.
  };

  const handleSubmit = async (e: React.FormEvent, generateVideoOption: boolean) => {
    e.preventDefault();
    if (!inputMessage.trim() && files.length === 0) return;

    // --- Synchronous session check and creation ---
    let finalSessionId = sessionId; 

    // 1. If no session ID exists, we must create one before sending the message
    if (!finalSessionId && personaId) {
        setIsSubmitting(true);
        const newSessionId = await startNewSession(personaId);
        if (newSessionId) {
            finalSessionId = newSessionId;
            setSessionId(newSessionId); // Update state for future submissions
            // CRITICAL: Update the URL *after* session creation so subsequent loads are correct
            navigate(`/persona/${personaId}/chat?sessionId=${newSessionId}`, { replace: true });
        } else {
            // Failed to start session, abort submission
            setIsSubmitting(false);
            toast({ title: t("toast.error"), description: t("personachat.session_start_failed") || "Could not start new chat session.", variant: "destructive" });
            return;
        }
    }
    
    if (!finalSessionId) {
        setIsSubmitting(false);
        return;
    }
    // --- END session check and creation ---


    const newUserMessage: Message = { id: String(Date.now()), sender: "user", content: inputMessage || t("personachat.file_query") };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsSubmitting(true);

    const thinkingMessage: Message = { id: String(Date.now() + 1), sender: "bot", content: "thinking" };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const formData = new FormData();
      formData.append("query", newUserMessage.content);
      
      // Use the guaranteed finalSessionId
      formData.append("session_id", finalSessionId);
      
      // Use current messages + new user message for history
      const currentChatHistory = [...messages, newUserMessage].map(msg => ({ sender: msg.sender, content: msg.content }));
      formData.append("chat_history", JSON.stringify(currentChatHistory));
      
      formData.append("documents", JSON.stringify(selectedDocuments));
      files.forEach((file) => formData.append("user_docs", file));
      formData.append("generate_video", generateVideoOption ? "true" : "false");
      formData.append("save", "true");

      const response = await axios.post(getPersonaAnswerEndpoint(personaId), formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const { answer, video_url, session_id: new_session_id } = response.data;

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
  };
  
  // Logic for the History button click
  const handleViewHistory = () => {
    if (!personaId || !persona?.persona_name) return;
    // Navigate to the new SessionListPage, passing necessary context via state
    navigate(`/sessions-list`, { state: { personaId: personaId, personaName: persona.persona_name } });
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("personachat.ask_persona_link")}
            {persona ? ` - ${persona.persona_name}` : ""}
          </h1>
        </div>

        {/* FIX: Simplified to two-column (Chat + Options) */}
        <div className="flex w-full border rounded-xl shadow-2xl bg-card overflow-hidden h-[calc(100vh-16rem)]">
          
          {/* Center Column: Chat Display and Input (Now the primary focus) */}
          <div className="flex-1 flex flex-col bg-background min-w-[60%]">
            <ChatDisplay messages={messages} messagesEndRef={messagesEndRef} toast={toast} persona={persona} />

            <form onSubmit={(e) => handleSubmit(e, generateVideo)} className="flex flex-col gap-3 p-4 border-t bg-card/50">
              <Textarea
                placeholder={t("personachat.input_placeholder")}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e, generateVideo);
                  }
                }}
                className="flex-1 min-h-[40px] max-h-[150px] bg-background border-input resize-none"
                rows={1}
                disabled={isSubmitting}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* BUTTON: To list old conversions (Now links to the SessionListPage) */}
                    <Button variant="outline" onClick={handleViewHistory} className="text-sm">
                        <History className="h-4 w-4 mr-2" />
                        {t("personachat.view_history") || "View All Sessions"}
                    </Button>
                    {/* BUTTON: To start a completely new empty chat in this window */}
                    <Button variant="outline" onClick={handleNewConversation} className="text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("personachat.start_new") || "New Chat"}
                    </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="generate-video" checked={generateVideo} onCheckedChange={setGenerateVideo} disabled={isSubmitting} />
                    <Label htmlFor="generate-video" className="text-sm font-medium">{t("personachat.generate_video_label")}</Label>
                  </div>
                  <Button type="submit" disabled={isSubmitting || (!inputMessage.trim() && files.length === 0)} className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("personachat.send_button")}
                    {!isSubmitting && <Zap className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Options (Files & Quick Actions) */}
          <div className="w-80 flex-shrink-0 border-l p-4 space-y-6 bg-secondary/10 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">{t("personachat.options_header")}</h3>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground flex items-center">
                <Upload className="h-4 w-4 mr-2" /> {t("personachat.docs_upload.label")}
              </Label>
              <div {...getRootProps()} className="flex flex-col items-center justify-center space-y-2 cursor-pointer border-2 border-dashed border-primary/50 rounded-lg p-5 bg-background/50 text-center hover:bg-background/70 transition-colors">
                <input {...getInputProps()} />
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">{t("personachat.docs_upload.text")}</span>
                <span className="text-xs text-gray-500">({t("personachat.docs_upload.formats")})</span>
              </div>
              {files.length > 0 && (
                <Alert className="border-primary/30 bg-primary/10 mt-2">
                  <AlertDescription className="text-sm">
                    <p className="font-semibold text-primary">{t("personachat.docs_upload.selected_files_label")}:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center text-muted-foreground">
                          <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="mt-2 text-xs text-destructive hover:bg-destructive/10 p-1 h-auto">
                        {t("personachat.clear_files")}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">{t("personachat.quick_actions.label")}</Label>
              <div className="grid grid-cols-1 gap-3">
                {DOCUMENT_OPTIONS_KEYS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/50 transition-colors">
                    <Checkbox
                      id={option.value}
                      value={option.value}
                      checked={selectedDocuments.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange(option.value)}
                      className="w-4 h-4 text-primary bg-background border-input focus:ring-primary"
                    />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
                      {t(option.labelKey)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaChatPage;