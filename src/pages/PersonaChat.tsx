import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, Bot, User, FileText, Plus, MessageSquare, Copy, Download, Zap } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { getPersonaDetailsEndpoint, getPersonaAnswerEndpoint } from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

// Define an interface for the avatar props for clarity in the ChatDisplay
interface PersonaAvatarProps {
  avatarUrl: string | null;
  name: string;
}

// Mock Avatar Component for an attractive look (assuming you have a way to render a nice circle avatar)
const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ avatarUrl, name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-primary-foreground bg-primary/80 overflow-hidden shadow-lg border-2 border-primary/50">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};


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
  id: number;
  sender: "user" | "bot";
  content: string;
  type?: "video";
}

// --- ChatDisplay Component (Updated to include persona details display logic) ---
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
      {/* NEW: Attractive Persona Header */}
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
      {/* END NEW: Attractive Persona Header */}

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
                    {/* Simplified thinking animation for clarity */}
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

// --- ConversationList Component ---
const ConversationList = ({ onNewConversation }: { onNewConversation: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col p-4 border-r border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("personachat.conversations.header")}</h3>
        <Button variant="outline" size="icon" onClick={onNewConversation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {/* These should ideally be dynamic conversations */}
        <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">{t("personachat.conversations.example_chat")}</li>
        <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">{t("personachat.conversations.project_analysis")}</li>
      </ul>
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateVideo, setGenerateVideo] = useState(false);
  const [persona, setPersona] = useState<FullPersonaDetails | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // --- Fetch Persona Details ---
  const fetchPersonaDetails = useCallback(async () => {
    if (!id || !token) return;

    try {
      const response = await fetch(getPersonaDetailsEndpoint(id), {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch persona");
      const data: FullPersonaDetails = await response.json();
      setPersona(data);
    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPersonaDetails();
  }, [fetchPersonaDetails]);

  const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCheckboxChange = (value: string) => {
    setSelectedDocuments((prev) => (prev.includes(value) ? prev.filter((doc) => doc !== value) : [...prev, value]));
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputMessage("");
    setFiles([]); // Clear files on new conversation
    setSelectedDocuments([]); // Clear documents on new conversation
    setGenerateVideo(false); // Reset video option
  };

  const handleSubmit = async (e: React.FormEvent, generateVideoOption: boolean) => {
    e.preventDefault();
    if (!inputMessage.trim() && files.length === 0) return; // Allow submission with just files

    const newUserMessage: Message = { id: Date.now(), sender: "user", content: inputMessage || t("personachat.file_query") };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsSubmitting(true);

    const thinkingMessage: Message = { id: Date.now() + 1, sender: "bot", content: "thinking" };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const formData = new FormData();
      formData.append("query", newUserMessage.content);
      // Pass only the message content and sender for chat_history to avoid passing file data.
      // Ensure your backend can handle the structure of `chat_history`.
      const cleanHistory = [...messages, newUserMessage].map(msg => ({ sender: msg.sender, content: msg.content }));
      formData.append("chat_history", JSON.stringify(cleanHistory));
      formData.append("documents", JSON.stringify(selectedDocuments));
      files.forEach((file) => formData.append("user_docs", file));
      formData.append("generate_video", generateVideoOption ? "true" : "false");
      formData.append("save", "true");

      const response = await axios.post(getPersonaAnswerEndpoint(id), formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const { answer, video_url } = response.data;

      // Immediately remove the 'thinking' message
      setMessages((prev) => prev.slice(0, -1));

      if (video_url) {
        toast({ title: t("toast.video_generating.title"), description: t("toast.video_generating.description") });
        // NOTE: A real-world scenario would use polling or websockets to check video status.
        // I've kept the original timeout logic but flagged it as a simple mock.
        setTimeout(() => {
          const videoMessage: Message = { id: Date.now(), sender: "bot", content: video_url, type: "video" };
          setMessages((prev) => prev.concat(videoMessage));
          toast({ title: t("toast.video_ready.title"), description: t("toast.video_ready.description") });
          setIsSubmitting(false);
          setFiles([]); // Clear files after successful submission
        }, 10000); // Mock video generation delay
      } else {
        const botAnswer = answer || t("personachat.bot_fallback_error");
        setMessages((prev) => prev.concat({ id: Date.now(), sender: "bot", content: botAnswer }));
        toast({ title: t("toast.question_sent.title"), description: t("toast.question_sent.description") });
        setIsSubmitting(false);
        setFiles([]); // Clear files after successful submission
      }
    } catch (error: any) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : t("toast.unexpected_error_short");
      setMessages((prev) => prev.slice(0, -1).concat({ id: Date.now(), sender: "bot", content: `${t("personachat.error_prefix")}: ${errorMessage}` }));
      toast({ title: t("toast.submission_failed.title"), description: errorMessage, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          {/* Kept the original title but the main persona details are in the chat display */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("personachat.ask_faleh_link")}
            {persona ? ` - ${persona.persona_name}` : ""}
          </h1>
        </div>

        <div className="flex w-full border rounded-xl shadow-2xl bg-card overflow-hidden h-[calc(100vh-16rem)]">
          
          {/* Left Column: Conversation History/List */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white/50">
             <ConversationList onNewConversation={handleNewConversation} />
          </div>

          {/* Center Column: Chat Display and Input */}
          <div className="flex-1 flex flex-col bg-background">
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
                <div className="flex items-center space-x-2">
                  <Checkbox id="generate-video" checked={generateVideo} onCheckedChange={setGenerateVideo} disabled={isSubmitting} />
                  <Label htmlFor="generate-video" className="text-sm font-medium">{t("personachat.generate_video_label")}</Label>
                </div>
                <Button type="submit" disabled={isSubmitting || (!inputMessage.trim() && files.length === 0)} className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("personachat.send_button")}
                  {!isSubmitting && <Zap className="h-4 w-4 ml-2" />}
                </Button>
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