import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const QuestionForm = ({
  messages,
  inputMessage,
  setInputMessage,
  isSubmitting,
  handleSubmit,
  messagesEndRef,
}) => {
  const [generateVideo, setGenerateVideo] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    handleSubmit(e, generateVideo) // pass choice to parent handler
  }

  return (
    <>
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <Bot className="h-8 w-8 text-primary mt-1" />
            )}
            <div
              className={`p-3 rounded-xl max-w-2/3 ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.sender === "user" && (
              <User className="h-8 w-8 text-muted-foreground mt-1" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-3 pt-4">
        <Textarea
          placeholder="Type your question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
          className="flex-1 min-h-[40px] max-h-[150px] bg-background border-input"
          rows={1}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between gap-4">
          {/* Checkbox for video generation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-video"
              checked={generateVideo}
              onCheckedChange={setGenerateVideo}
            />
            <Label htmlFor="generate-video">Generate video</Label>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !inputMessage.trim()}
            className="h-10 px-4 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

export default QuestionForm