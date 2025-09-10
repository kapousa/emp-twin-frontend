import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

const QuestionForm = ({ messages, inputMessage, setInputMessage, isSubmitting, handleSubmit, messagesEndRef }) => {
  return (
    <>
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
          className="flex-1 min-h-[40px] max-h-[150px] bg-background border-input"
          rows={1}
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !inputMessage.trim()}
          className="h-10 px-4 bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </form>
    </>
  );
};

export default QuestionForm;