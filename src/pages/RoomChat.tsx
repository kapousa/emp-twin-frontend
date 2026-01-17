import React, {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Send, Users, Info, Loader2, Bot, ChevronLeft, Sparkles} from 'lucide-react';
import {useAuth} from '@/contexts/AuthProvider';
import { getRoomChatEndpoint, API_BASE_URL } from '@/configurations/api';

const RoomChat = () => {
    const {roomId} = useParams();
    const {token} = useAuth();

    // State for room details
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    // Only trigger if room is loaded, we have members, and no messages yet
    if (room && messages.length === 0) {
        const initialPrompt = `
            The boardroom meeting has started. 
            Topic: ${room.topic || "General Discussion"}
            Agenda: ${room.agenda || "Introduce yourselves and provide expert feedback."}
            
            Please provide your initial thoughts on this topic and agenda based on any documents provided.
        `;

        handleSend(initialPrompt);
    }
}, [room]);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                // Using the endpoint defined in your router: /room/{room_id}/start_meeting
                const res = await axios.get(`${API_BASE_URL}/room/${roomId}/start_meeting`, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                // This will contain: { room_name, topic, members: [...] }
                setRoom(res.data);
            } catch (err) {
                console.error("Error fetching room details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId && token) {
            fetchRoomDetails();
        }
    }, [roomId, token]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isTyping]);


const handleSend = async (overrideInput?: string) => {
    const queryText = overrideInput || input;
    if (!queryText.trim()) return;

    // Only show the message in the UI if it came from the user typing,
    // not the hidden initial system prompt.
    if (!overrideInput) {
        const userMsg = { role: 'user', content: queryText, sender_name: 'You' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
    }

    setIsTyping(true);

    try {
        const res = await axios.post(getRoomChatEndpoint(roomId!), {
            query: queryText,
            history: messages // This passes the context to the RAG service
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.responses) {
            setMessages(prev => [...prev, ...res.data.responses]);
        }
    } catch (err) {
        console.error("Chat error:", err);
    } finally {
        setIsTyping(false);
    }
};

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-rose-500" size={32}/>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Dynamic Header */}
            <header className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-gray-500"/>
                    </button>
                    <div>
  <h1 className="text-lg font-bold text-gray-900 leading-tight">
    {room?.room_name || "Boardroom Session"}
  </h1>
  <div className="flex flex-col gap-0.5 mt-1">
    <p className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
      <Sparkles size={12} className="text-rose-500" />
      Topic: {room?.topic || "Not set"}
    </p>
    {room?.agenda && (
       <p className="text-[10px] text-gray-400 flex items-center gap-1 italic">
         <Info size={10} /> Agenda: {room.agenda}
       </p>
    )}
  </div>
</div>
                </div>

                <div className="flex items-center gap-4">
  {/* 1. THE AVATAR STACK WITH BOTTOM TOOLTIPS */}
  <div className="flex -space-x-3">
    {room?.members?.map((member: any, i: number) => {
      const baseUrl = API_BASE_URL.replace(/\/$/, '');

      // Safety URL construction matching PersonaCard
      const fileName = member.avatar_url?.split('/').pop();
      const fullUrl = fileName ? `${baseUrl}/static/avatars/${fileName}` : null;

      return (
        <div
          key={i}
          className="group relative w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm transition-all hover:scale-110 hover:z-50 cursor-pointer"
          style={{ zIndex: 10 - i }}
        >
          {/* THE TOOLTIP - NOW POSITIONED AT THE BOTTOM */}
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-[100] min-w-[140px] pointer-events-none">
            <div className="bg-gray-900/95 backdrop-blur-sm text-white p-2.5 rounded-xl shadow-2xl text-center border border-white/10">
              <p className="text-[11px] font-bold whitespace-nowrap">{member.persona_name}</p>
              <p className="text-[9px] text-indigo-300 whitespace-nowrap leading-none mt-1 font-bold uppercase tracking-wider">
                {member.persona_role}
              </p>

              {/* Tooltip Arrow (Pointing Up) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900/95" />
            </div>
          </div>

          {fullUrl ? (
            <img
              src={fullUrl}
              alt={member.persona_name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) parent.innerText = member.persona_name?.charAt(0) || 'E';
              }}
            />
          ) : (
            <span>{member.persona_name?.charAt(0) || 'E'}</span>
          )}
        </div>
      );
    })}
  </div>

  {/* 2. MEMBER COUNT BUTTON */}
  <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-md flex-shrink-0">
    <Users size={14} />
    <span>{room?.members?.length || 0} Board Members</span>
  </button>
</div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <Bot size={48} className="mb-4"/>
                        <p className="font-bold">The board is ready for your input.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${
                            msg.role === 'user'
                                ? 'bg-rose-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 shadow-sm rounded-tl-none'
                        }`}>
                            {msg.role !== 'user' && (
                                <p className="text-[10px] font-black text-rose-600 uppercase mb-1">{msg.sender_name}</p>
                            )}
                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse font-bold">
                        <Loader2 size={12} className="animate-spin"/>
                        The Board is deliberating...
                    </div>
                )}
                <div ref={scrollRef}/>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t">
                <div
                    className="max-w-4xl mx-auto flex gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
              placeholder="Address the board..."
              className="flex-1 bg-transparent p-3 outline-none resize-none font-medium text-sm"
              rows={1}
          />
                    <button
                        onClick={handleSend}
                        className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                    >
                        <Send size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomChat;