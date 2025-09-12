import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Loader2, Bot, User, FileText, Plus, MessageSquare } from "lucide-react";
import TipsSection from "@/components/shared/TipsSection";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { AGENT_ASK_ENDPOINT } from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";


const AGENT_ASK_ENDPOINT_CONST = AGENT_ASK_ENDPOINT;

// Separate component for rendering the chat messages
const ChatDisplay = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold">Start a conversation</h2>
          <p className="max-w-md mt-2">
            Submit your business questions along with supporting documents to get AI-powered insights.
          </p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <Bot className="h-8 w-8 text-primary mt-1" />}
            <div className={`p-3 rounded-xl max-w-2/3 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
              {msg.content === "thinking" ? (
                <div className="flex items-center space-x-1">
                  <span className="dot animate-pulse-dot-1"></span>
                  <span className="dot animate-pulse-dot-2"></span>
                  <span className="dot animate-pulse-dot-3"></span>
                </div>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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
const ConversationList = ({ onNewConversation }) => (
  <div className="flex flex-col p-4 border-r border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Conversations</h3>
      <Button variant="outline" size="icon" onClick={onNewConversation}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
    <ul className="space-y-2">
      <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
        Example Chat
      </li>
      <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
        Project Analysis
      </li>
    </ul>
  </div>
);

const documentOptions = [
  { value: "Business Plan", label: "Business Plan" },
  { value: "Franchise Manual", label: "Franchise Manual" },
  { value: "Staff Manual", label: "Staff Manual" },
  { value: "Quality Assurance Guideline", label: "Quality Assurance Guideline" },
  { value: "Branding Guideline", label: "Branding Guideline" },
  { value: "All other possible documents", label: "All other possible documents" },
];

const AskPanel = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const { token } = useAuth();


  const tips = [
    { text: "Be specific about your business context and goals" },
    { text: "Include relevant financial data or market information" },
    { text: "Mention your location and target market" },
    { text: "Upload business plans, financial statements, or market research" }
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

  const handleSubmit = async (e) => {
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
      formData.append('save', 'true');

      const response = await axios.post(AGENT_ASK_ENDPOINT_CONST, formData, {
        headers: { 'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
         },
      });

      const result = response.data;
      const botAnswer = result.answer || "Sorry, I couldn't generate a response.";
      
      setMessages(prev => prev.slice(0, -1).concat([{ sender: "bot", content: botAnswer }]));
      
      toast({ title: "Question sent!", description: "Answer received." });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Please try again later.";
      
      setMessages(prev => prev.slice(0, -1).concat([{ sender: "bot", content: `Error: ${errorMessage}` }]));
      toast({ title: "Submission failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Ask Faleh</h1>
        </div>

        <div className="flex w-full border rounded-lg shadow-lg bg-card overflow-hidden h-[calc(100vh-16rem)]">
          {/* Left sidebar for conversations */}
          <ConversationList onNewConversation={handleNewConversation} />

          {/* Main Chat Panel */}
          <div className="flex-1 flex flex-col p-4 bg-background">
            <ChatDisplay messages={messages} messagesEndRef={messagesEndRef} />
            <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-4">
              <Textarea
                placeholder="Type your question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 min-h-[40px] max-h-[150px] bg-background border-input resize-none"
                rows={1}
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !inputMessage.trim()}
                className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground self-end"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
            </form>
          </div>

          {/* Tips and Options Panel (Right) */}
          <div className="w-80 border-l p-4 space-y-6 bg-secondary/20 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground">Query Options</h3>
            
            <TipsSection title="Tips for Best Results:" tips={tips} />

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Supporting Documents (Optional)
              </Label>
              <div {...getRootProps()} className="flex items-center space-x-2 cursor-pointer border border-dashed rounded-md p-4 bg-background/50 text-center hover:bg-background/70">
                <input {...getInputProps()} />
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mx-auto">
                  <Upload className="h-4 w-4" />
                  <span>Click or drag files to upload</span>
                </div>
              </div>
              {files.length > 0 && (
                <Alert className="border-primary/20 bg-primary/5 mt-2">
                  <AlertDescription className="text-sm">
                    Selected files:
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
                Quick Action Generator (Optional)
              </Label>
              <div className="grid grid-cols-1 gap-4">
                {documentOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id={option.value}
                      value={option.value}
                      checked={selectedDocuments.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="w-4 h-4 text-primary bg-background border-input focus:ring-primary"
                    />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer">
                      {option.label}
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