import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, Bot, User, FileText, Plus, MessageSquare, Copy, Download, Zap, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";

// --- Interface Definitions (Moved from PersonaChatPage) ---
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

interface PersonaAvatarProps {
    avatarUrl: string | null;
    name: string;
}

// --- Component Props for ChatBox ---
interface ChatBoxProps {
    messages: Message[];
    persona: FullPersonaDetails | null;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    inputMessage: string;
    setInputMessage: (message: string) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent, generateVideoOption: boolean) => Promise<void>;
    handleNewConversation: () => void;
    handleViewHistory: () => void;
    
    // File/Options related props
    files: File[];
    setFiles: (files: File[]) => void;
    selectedDocuments: string[];
    handleCheckboxChange: (value: string) => void;
    generateVideo: boolean;
    setGenerateVideo: (checked: boolean) => void;
    getRootProps: any; // from useDropzone
    getInputProps: any; // from useDropzone
    toast: any; // useToast hook result
}

// --- Internal Helper Components ---
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

// --- Internal Message Display Component (Refactored from original ChatDisplay) ---
const ChatMessagesDisplay = ({
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


// --- Document Options (Moved from PersonaChatPage) ---
const DOCUMENT_OPTIONS_KEYS = [
    { value: "Generate Resume", labelKey: "Generate Resume" },
    { value: "Generate Intro Video", labelKey: "Generate Intro Video" },
    { value: "Reply to my today's Emails", labelKey: "Reply to my today’s Emails" },
    { value: "Send message to freind", labelKey: "Send message to freind" },
];


// --- Main ChatBox Component ---
const ChatBox: React.FC<ChatBoxProps> = ({
    messages,
    persona,
    messagesEndRef,
    inputMessage,
    setInputMessage,
    isSubmitting,
    handleSubmit,
    handleNewConversation,
    handleViewHistory,
    files,
    setFiles,
    selectedDocuments,
    handleCheckboxChange,
    generateVideo,
    setGenerateVideo,
    getRootProps,
    getInputProps,
    toast,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex w-full border rounded-xl shadow-2xl bg-card overflow-hidden h-[calc(100vh-16rem)]">

            {/* Center Column: Chat Display and Input */}
            <div className="flex-1 flex flex-col bg-background min-w-[60%]">
                <ChatMessagesDisplay 
                    messages={messages} 
                    messagesEndRef={messagesEndRef} 
                    toast={toast} 
                    persona={persona} 
                />

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
                            <Button variant="outline" onClick={handleViewHistory} className="text-sm">
                                <History className="h-4 w-4 mr-2" />
                                {t("personachat.view_history") || "View All Sessions"}
                            </Button>
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
    );
};

export default ChatBox;