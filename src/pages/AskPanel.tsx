import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, Bot, User, FileText, Plus, MessageSquare, Copy, Download } from "lucide-react";
import TipsSection from "@/components/shared/TipsSection";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { AGENT_ASK_ENDPOINT } from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next"; // <-- NEW IMPORT

const AGENT_ASK_ENDPOINT_CONST = AGENT_ASK_ENDPOINT;

// Separate component for rendering the chat messages
const ChatDisplay = ({ messages, messagesEndRef, toast }) => {
  const { t } = useTranslation(); // <-- USE HOOK

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ 
        title: t("toast.copy_success.title"), 
        description: t("toast.copy_success.description") 
      });
    } catch (err) {
      toast({ 
        title: t("toast.copy_failed.title"), 
        description: t("toast.copy_failed.description"), 
        variant: "destructive" 
      });
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    // Download filename remains hardcoded, but description is translated
    link.download = 'video-answer.mp4'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ 
      title: t("toast.download_start.title"), 
      description: t("toast.download_start.description") 
    });
  };
  
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold">{t("askpanel.chat_start.title")}</h2>
          <p className="max-w-md mt-2">
            {t("askpanel.chat_start.description")}
          </p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <Bot className="h-8 w-8 text-primary mt-1" />}
            <div className={`p-3 rounded-xl max-w-2/3 flex flex-col ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
              
              {/* === MESSAGE CONTENT === */}
              {msg.type === 'video' ? (
                <video src={msg.content} controls className="rounded-lg w-full max-h-96" />
              ) : msg.content === "thinking" ? (
                <div className="flex items-center space-x-1">
                  <span className="dot animate-pulse-dot-1"></span>
                  <span className="dot animate-pulse-dot-2"></span>
                  <span className="dot animate-pulse-dot-3"></span>
                </div>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}

              {/* === ICONS FOR COPY/DOWNLOAD === */}
              {msg.sender === 'bot' && msg.content !== 'thinking' && (
                <div className="flex justify-end mt-2">
                  {msg.type === 'video' ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(msg.content)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleCopy(msg.content)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && <User className="h-8 w-8 text-muted-foreground mt-1" />}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Component for the conversation list sidebar
const ConversationList = ({ onNewConversation }) => {
  const { t } = useTranslation(); // <-- USE HOOK
  
  return (
    <div className="flex flex-col p-4 border-r border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("askpanel.conversations.header")}</h3>
        <Button variant="outline" size="icon" onClick={onNewConversation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          {t("askpanel.conversations.example_chat")}
        </li>
        <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          {t("askpanel.conversations.project_analysis")}
        </li>
      </ul>
    </div>
  );
};

// Data structures for quick actions (Labels MUST be translated)
const DOCUMENT_OPTIONS_KEYS = [
  { value: "Business Plan", labelKey: "askpanel.docs.business_plan" },
  { value: "Franchise Manual", labelKey: "askpanel.docs.franchise_manual" },
  { value: "Staff Manual", labelKey: "askpanel.docs.staff_manual" },
  { value: "Quality Assurance Guideline", labelKey: "askpanel.docs.qa_guideline" },
  { value: "Branding Guideline", labelKey: "askpanel.docs.branding_guideline" },
  { value: "All other possible documents", labelKey: "askpanel.docs.other_docs" },
];


const AskPanel = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateVideo, setGenerateVideo] = useState(false);
  
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const { t } = useTranslation(); // <-- USE HOOK
  const { token } = useAuth();

  // Tips section now uses translated text
  const tips = [
    { text: t("askpanel.tips.tip1") },
    { text: t("askpanel.tips.tip2") },
    { text: t("askpanel.tips.tip3") },
    { text: t("askpanel.tips.tip4") }
  ];

  const handleNewConversation = () => {
    setMessages([]);
    setInputMessage("");
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCheckboxChange = (value) => {
    setSelectedDocuments(prev => {
      if (prev.includes(value)) {
        return prev.filter(doc => doc !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleSubmit = async (e, generateVideoOption) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage = { sender: "user", content: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");
    setIsSubmitting(true);

    const thinkingMessage = { sender: "bot", content: "thinking" };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const formData = new FormData();
      formData.append('query', newUserMessage.content);
      formData.append('chat_history', JSON.stringify([...messages, newUserMessage]));
      formData.append('documents', JSON.stringify(selectedDocuments));
      files.forEach(file => formData.append('user_docs', file));
      formData.append('generate_video', generateVideoOption ? 'true' : 'false');
      formData.append('save', 'true');

      const response = await axios.post(AGENT_ASK_ENDPOINT_CONST, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      const { answer, video_url } = response.data;
      
      if (video_url) {
        toast({
          title: t("toast.video_generating.title"), // Translated
          description: t("toast.video_generating.description"), // Translated
        });

        setTimeout(() => {
          const videoMessage = { sender: "bot", content: video_url, type: 'video' };
          setMessages(prev => prev.slice(0, -1).concat([videoMessage]));
          toast({ 
            title: t("toast.video_ready.title"), // Translated
            description: t("toast.video_ready.description") // Translated
          });
          setIsSubmitting(false);
        }, 10000); 

      } else {
        const botAnswer = answer || t("askpanel.bot_fallback_error"); // Translated fallback
        setMessages(prev => prev.slice(0, -1).concat([{ sender: "bot", content: botAnswer }]));
        toast({ 
          title: t("toast.question_sent.title"), // Translated
          description: t("toast.question_sent.description") // Translated
        });
        setIsSubmitting(false);
      }

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : t("toast.unexpected_error_short"); // Translated
      
      setMessages(prev => prev.slice(0, -1).concat([{ sender: "bot", content: `${t("askpanel.error_prefix")}: ${errorMessage}` }])); // Translated prefix
      toast({ 
        title: t("toast.submission_failed.title"), // Translated
        description: errorMessage, 
        variant: "destructive" 
      });
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    // We pass the event object which is expected by handleSubmit
    handleSubmit(e, generateVideo); 
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          {/* Using the translated Navbar key, which is Ask Croconus */}
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("navbar.ask_faleh_link")}</h1> 
        </div>

        <div className="flex w-full border rounded-lg shadow-lg bg-card overflow-hidden h-[calc(100vh-16rem)]">
          {/* Left sidebar for conversations */}
          <ConversationList onNewConversation={handleNewConversation} />

          {/* Main Chat Panel */}
          <div className="flex-1 flex flex-col p-4 bg-background">
            <ChatDisplay messages={messages} messagesEndRef={messagesEndRef} toast={toast} />
            
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 pt-4">
              <Textarea
                placeholder={t("askpanel.input_placeholder")} // Translated
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                className="flex-1 min-h-[40px] max-h-[150px] bg-background border-input resize-none"
                rows={1}
                disabled={isSubmitting}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generate-video"
                    checked={generateVideo}
                    onCheckedChange={setGenerateVideo}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="generate-video">{t("askpanel.generate_video_label")}</Label> {/* Translated */}
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !inputMessage.trim()}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("askpanel.send_button")} {/* Translated */}
                </Button>
              </div>
            </form>
          </div>

          {/* Tips and Options Panel (Right) */}
          <div className="w-80 border-l p-4 space-y-6 bg-secondary/20 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground">{t("askpanel.options_header")}</h3> {/* Translated */}
            
            <TipsSection title={t("askpanel.tips.header")} tips={tips} /> {/* Translated header */}

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("askpanel.docs_upload.label")} {/* Translated */}
              </Label>
              <div {...getRootProps()} className="flex items-center space-x-2 cursor-pointer border border-dashed rounded-md p-4 bg-background/50 text-center hover:bg-background/70">
                <input {...getInputProps()} />
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mx-auto">
                  <Upload className="h-4 w-4" />
                  <span>{t("askpanel.docs_upload.text")}</span> {/* Translated */}
                </div>
              </div>
              {files.length > 0 && (
                <Alert className="border-primary/20 bg-primary/5 mt-2">
                  <AlertDescription className="text-sm">
                    {t("askpanel.docs_upload.selected_files_label")} {/* Translated */}
                    <ul className="list-disc list-inside mt-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Quick Action Generator */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {t("askpanel.quick_actions.label")} {/* Translated */}
              </Label>
              <div className="grid grid-cols-1 gap-4">
                {DOCUMENT_OPTIONS_KEYS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    {/* Using Checkbox component's internal logic for input type checkbox */}
                    <Checkbox
                      id={option.value}
                      value={option.value}
                      checked={selectedDocuments.includes(option.value)}
                      onCheckedChange={() => handleCheckboxChange(option.value)}
                      className="w-4 h-4 text-primary bg-background border-input focus:ring-primary"
                    />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer">
                      {t(option.labelKey)} {/* Translated label */}
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

export default AskPanel;