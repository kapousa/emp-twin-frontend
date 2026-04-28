import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Bot, User, FileText, Plus, Copy, Download, Paperclip, X, Video, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";

interface Message {
    id: string;
    sender: "user" | "bot";
    content: string;
    type?: "video";
    suggestions?: string[];
}

interface ChatBoxProps {
    messages: Message[];
    persona: any;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    inputMessage: string;
    setInputMessage: (msg: string) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent, video: boolean, override?: string) => Promise<void>;
    files: File[];
    setFiles: (files: File[]) => void;
    selectedDocuments: string[];
    handleCheckboxChange: (val: string) => void;
    generateVideo: boolean;
    setGenerateVideo: (val: boolean) => void;
    getRootProps: any;
    getInputProps: any;
    toast: any; // This is passed from PersonaChat.tsx
    handleNewConversation: () => void;
    handleViewHistory: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = (props) => {
    const { t } = useTranslation();

    // --- FIX: Added 'toast' to this destructuring list ---
    const {
        messages,
        persona,
        isSubmitting,
        handleSubmit,
        inputMessage,
        setInputMessage,
        generateVideo,
        toast,
        messagesEndRef
    } = props;

    // --- PDF Helper ---
    const handleDownloadPDF = (content: string) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const maxLineWidth = pageWidth - margin * 2;

            doc.setFont("helvetica", "bold");
            doc.text(`${persona?.persona_name || "FALEH"} Report`, margin, 20);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(content, maxLineWidth);
            doc.text(splitText, margin, 30);

            doc.save("Consultation.pdf");

            // Now toast will work because it is defined above
            toast({
                title: t("toast.download_success") || "PDF Downloaded",
                description: t("toast.pdf_ready") || "Your report is ready.",
            });
        } catch (error) {
            console.error("PDF Error:", error);
            toast({
                title: "Error",
                description: "Failed to generate PDF.",
                variant: "destructive"
            });
        }
    };

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const suggestions = (lastMsg?.sender === "bot" && Array.isArray(lastMsg.suggestions)) ? lastMsg.suggestions : [];

    return (
        <div className="flex flex-col flex-1 bg-background h-full">
            {/* --- NEW HEADER SECTION --- */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {persona?.avatarPath ? (
                        <img
                            src={persona.avatarPath}
                            alt={persona.persona_name}
                            className="h-10 w-10 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {persona?.persona_name || "Assistant"}
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {persona?.persona_role || t("personachat.online")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Existing Message List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                            {msg.content === "thinking" ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    <span className="text-xs italic">Thinking...</span>
                                </div>
                            ) : msg.type === "video" ? (
                                <video src={msg.content} controls className="rounded-lg w-full" />
                            ) : (
                                <div className="prose prose-sm dark:prose-invert">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            )}

                            {msg.sender === "bot" && msg.content !== "thinking" && (
                                <div className="flex gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Download PDF" onClick={() => handleDownloadPDF(msg.content)}>
                                        {/* Custom PDF SVG Icon */}
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4 text-red-600" // Set color to Red for PDF
                                        >
                                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <path d="M9 13v2" />
                                            <path d="M9 17v-2h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9" />
                                            <path d="M13 13v4h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1z" />
                                            <path d="M17 13h2" />
                                            <path d="M17 15h2" />
                                        </svg>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Copy Text" onClick={() => {
                                        navigator.clipboard.writeText(msg.content);
                                        toast({ title: "Copied", description: "Text copied to clipboard" });
                                    }}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                {/* Suggestion Chips */}
                {suggestions.length > 0 && !isSubmitting && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => handleSubmit(e, generateVideo, s)}
                                className="text-xs bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e, generateVideo)} className="relative bg-muted/50 border rounded-xl p-2 focus-within:ring-1 focus-within:ring-primary/20">
                    {/* --- ADD THIS: File Preview Chips --- */}
{props.files.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-2 px-2">
        {props.files.map((file, index) => (
            <div
                key={index}
                className="flex items-center gap-2 bg-background border rounded-md px-2 py-1 text-xs"
            >
                <FileText className="h-3 w-3 text-primary" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                    type="button"
                    onClick={() => {
                        const newFiles = [...props.files];
                        newFiles.splice(index, 1);
                        props.setFiles(newFiles);
                    }}
                    className="hover:text-destructive transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        ))}
    </div>
)}
                    <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={t("personachat.input_placeholder") || "Ask something..."}
                        className="bg-transparent border-none focus-visible:ring-0 min-h-[60px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e, generateVideo);
                            }
                        }}
                    />
                    <div className="flex justify-between items-center mt-2 px-2 pb-1">
                        <div {...props.getRootProps()} className="cursor-pointer hover:text-primary transition-colors">
                            <input {...props.getInputProps()} />
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => props.setGenerateVideo(!generateVideo)}
                                className={`h-8 px-3 rounded-full ${generateVideo ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "text-muted-foreground"}`}
                            >
                                <Video className="h-4 w-4 mr-2" />
                                <span className="text-xs font-semibold">AI Video</span>
                            </Button>
                            <Button type="submit" disabled={isSubmitting || (!inputMessage.trim() && props.files.length === 0)} size="icon" className="rounded-full h-8 w-8">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;