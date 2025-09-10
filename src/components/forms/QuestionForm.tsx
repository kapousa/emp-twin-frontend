import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, User, Plus, Paperclip, FileText } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { AGENT_ASK_ENDPOINT } from "@/configurations/api";
import { useDropzone } from "react-dropzone";

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
      {/* These are placeholder conversation items. */}
      <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
        Example Chat
      </li>
      <li className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
        Project Analysis
      </li>
    </ul>
  </div>
);

const QuestionForm = ({ files, selectedDocuments, isSubmitting, setIsSubmitting }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  // Function to start a new chat
  const handleNewConversation = () => {
    setMessages([]);
    setInputMessage("");
  };

  // Callback for file uploads using react-dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      // This is where you would handle the file state for the main component.
      // For this example, we'll just log it.
      console.log("Files dropped:", acceptedFiles);
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Scroll to the bottom of the message container whenever a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage = { sender: "user", content: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");
    setIsSubmitting(true);

    const loadingMessage = { sender: "bot", content: "..." };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append('query', newUserMessage.content);
      formData.append('chat_history', JSON.stringify([...messages, newUserMessage]));
      formData.append('documents', JSON.stringify(selectedDocuments));
      files.forEach(file => formData.append('user_docs', file));
      formData.append('save', 'true');

      const response = await axios.post(AGENT_ASK_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
    <div className="flex h-[calc(100vh-10rem)]">
      {/* Left sidebar for conversations */}
      <ConversationList onNewConversation={handleNewConversation} />

      {/* Main chat panel */}
      <div className="flex flex-col flex-1">
        {/* Message display area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && <Bot className="h-8 w-8 text-primary mt-1" />}
              <div className={`p-3 rounded-xl max-w-2/3 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.sender === 'user' && <User className="h-8 w-8 text-muted-foreground mt-1" />}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 pt-0">
          <div {...getRootProps()} className="self-end mb-2">
            <input {...getInputProps()} />
            <Button variant="ghost" type="button" className="h-10 w-10 p-0">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
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
    </div>
  );
};

export default QuestionForm;