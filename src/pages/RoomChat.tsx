import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Users, Info, Loader2, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';

const RoomChat = () => {
  const { roomId } = useParams();
  const { token } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Room Data (including members)
  useEffect(() => {
    const fetchRoom = async () => {
      const res = await axios.get(`/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(res.data);
    };
    fetchRoom();
  }, [roomId, token]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, sender: 'You' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // API call to your AI Orchestrator
      const res = await axios.post(`/room/${roomId}/chat`, { query: input }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // The backend returns an array of responses from different personas
      setMessages(prev => [...prev, ...res.data.responses]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Presence Bar */}
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-[#E11D48] p-2 rounded-lg text-white"><Users size={20}/></div>
          <div>
            <h1 className="font-black text-gray-900 leading-none">{room?.room_name}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Live Board Session</p>
          </div>
        </div>

        {/* Avatars of experts in this room */}
        <div className="flex -space-x-2">
          {room?.members?.map((m: any) => (
            <div key={m.id} title={m.persona_name} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
              {m.avatar_url ? <img src={m.avatar_url} /> : m.persona_name[0]}
            </div>
          ))}
        </div>
      </header>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-[#E11D48] text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'
            }`}>
              {msg.role !== 'user' && (
                <p className="text-[10px] font-black text-[#E11D48] uppercase mb-1">{msg.sender_name}</p>
              )}
              <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-gray-400 animate-pulse font-bold">The Board is deliberating...</div>}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Address the board..."
            className="flex-1 bg-transparent p-3 outline-none resize-none font-medium text-sm"
            rows={1}
          />
          <button onClick={handleSend} className="bg-[#E11D48] text-white p-3 rounded-xl hover:scale-105 transition-transform">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomChat;