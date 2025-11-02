// PersonaChatPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// NO configuredAxios import, we'll use raw fetch
import { getPersonaAnswerEndpoint, PERSONA_ENDPOINT } from '@/configurations/api'; // Your API endpoints
import { useAuth } from '@/contexts/AuthProvider';

// Import the presentational PersonaChatBox component
import PersonaChatBox from './PersonaChatBox'; // Adjust path as needed

interface Persona { // Renamed from FullPersonaDetails to match my previous Persona type
    id: string;
    persona_name: string;
    persona_role: string;
    persona_tone: string;
    knowledge_text: string;
    avatar_url: string | null;
    status: 'queued' | 'processing' | 'ready' | 'failed';
    user_id: string;
    created_at: string;
    updated_at: string;
    knowledge_files?: any[];
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  videoUrl?: string;
}

const PersonaChatPage: React.FC = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from your auth hook

  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  // Redirect if no token or personaId
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (!personaId) {
      setError("Persona ID is missing.");
      // You might want to navigate back to a list of personas or display a more specific error
      return;
    }
  }, [token, personaId, navigate]);


  // 1. Fetch persona details when the page loads (using manual fetch and headers)
  useEffect(() => {
    if (!personaId || !token) return;

    const fetchPersonaDetails = async () => {
      try {
        const response = await fetch(`${PERSONA_ENDPOINT}/${personaId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Manual Authorization header
          }
        });

        if (!response.ok) { // Manually check if the response was successful
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          if (response.status === 401 || response.status === 403) {
            navigate('/login', { replace: true });
          }
          throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        setPersona(data);
      } catch (err: any) {
        console.error("Failed to fetch persona details:", err);
        setError("Failed to load persona details.");
      }
    };
    fetchPersonaDetails();
  }, [personaId, token, navigate]);


  // 2. This is the main handler called by PersonaChatBox when "Send" is clicked
  const handleSubmit = useCallback(async (e: React.FormEvent, generateVideo: boolean) => {
    e.preventDefault();

    if (!inputMessage.trim() || !personaId || !token) {
      // Potentially show a toast error if inputMessage is empty
      return;
    }

    const userMessage: Message = { id: Date.now().toString() + 'user', sender: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(getPersonaAnswerEndpoint(personaId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Manual Authorization header for chat
        },
        body: JSON.stringify({
          question: userMessage.content,
          generateVideo: generateVideo,
        }),
      });

      if (!response.ok) { // Manually check if the response was successful
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        if (response.status === 401 || response.status === 403) {
          navigate('/login', { replace: true });
        }
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const personaResponse: Message = {
        id: Date.now().toString() + 'bot',
        sender: 'bot',
        content: data.answer,
        videoUrl: data.videoUrl,
      };
      setMessages((prev) => [...prev, personaResponse]);
    } catch (err: any) {
      console.error("Error getting persona answer:", err);
      setError("Failed to get a response from the persona. Please try again.");
      const errorMessage: Message = {
        id: Date.now().toString() + 'error',
        sender: 'bot',
        content: "I apologize, I wasn't able to generate a response. Please try again or rephrase your query."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  }, [inputMessage, personaId, token, navigate]);


  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!persona) {
    return <div className="loading-message">Loading persona chat...</div>;
  }

  return (
    <div className="persona-chat-page flex flex-col h-full">
      <h2 className="text-2xl font-bold p-4 border-b">Chat with {persona.name}</h2>
      <PersonaChatBox
        messages={messages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default PersonaChatPage;