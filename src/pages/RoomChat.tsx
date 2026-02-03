import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader2, ChevronLeft, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import {
    API_BASE_URL,
    getRoomStartMeetingEndpoint,
    getRoomChatEndpoint,
    generateRoomReportEndpoint
} from '@/configurations/api';

const RoomChat = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [room, setRoom] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // Added for UI feedback
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(getRoomStartMeetingEndpoint(roomId!), {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setRoom(res.data.room || res.data);
                setMessages(res.data.history || []);
                setCurrentSessionId(res.data.session_id || res.data.id);
            } catch (err) {
                console.error("Failed to load boardroom:", err);
            } finally {
                setLoading(false);
            }
        };
        if (roomId && token) fetchRoomDetails();
    }, [roomId, token]);

    const generateMinutes = async () => {
        if (!roomId || !currentSessionId) return;
        setIsGeneratingReport(true);
        try {
            const res = await axios.post(generateRoomReportEndpoint(roomId, currentSessionId), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const systemNotice = {
                sender_name: "System",
                sender_type: "system",
                role: "system",
                content: res.data.message || "Minutes are being generated and will be emailed to you shortly.",
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, systemNotice]);
        } catch (err) {
            console.error("Report Error:", err);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // FIXED: Added defensive type check to handle the "text.trim is not a function" error
    const handleSend = async (customPrompt?: string | React.MouseEvent | React.KeyboardEvent) => {
        const text = typeof customPrompt === 'string' ? customPrompt : input;

        if (!text || !text.trim()) return;

        const userMsg = {
            sender_name: "You",
            content: text.trim(),
            role: "user",
            sender_type: "user"
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Updated endpoint to include session_id in URL as per your chat_room_routers.py
            const endpoint = `${API_BASE_URL}/room/${roomId}/${currentSessionId}/chat`;
            const res = await axios.post(endpoint, {
                query: text,
                history: messages // Sending history for RAG context
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // FIXED: Handling the 'responses' array returned by chat_in_room
            const newResponses = res.data.responses || res.data;
            if (Array.isArray(newResponses)) {
                setMessages(prev => [...prev, ...newResponses]);
            }
        } catch (err) {
            console.error("Chat Error:", err);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-rose-600" size={32} />
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b px-6 py-4 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{room?.room_name}</h1>
                            <p className="text-xs text-gray-400 italic">{room?.topic}</p>
                        </div>
                    </div>
                    <button
                        onClick={generateMinutes}
                        disabled={isGeneratingReport}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg font-semibold hover:bg-rose-100 disabled:opacity-50"
                    >
                        {isGeneratingReport ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                        End & Genrate Minutes
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-2xl ${
                            msg.role === 'system' || msg.sender_type === 'system' ? 'bg-blue-50 text-blue-800 italic' :
                            msg.role === 'user' ? 'bg-rose-600 text-white' : 'bg-white border shadow-sm'
                        }`}>
                            <span className="text-[10px] font-bold block mb-1 uppercase opacity-70">{msg.sender_name}</span>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border shadow-sm p-4 rounded-2xl flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                            <span className="text-xs text-gray-400">Board members deliberating...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-6 bg-white border-t">
                <div className="max-w-4xl mx-auto flex gap-4 bg-gray-50 p-2 rounded-2xl border">
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
                        className="flex-1 bg-transparent p-3 outline-none resize-none text-sm"
                        rows={1}
                    />
                    <button
                        onClick={() => handleSend()}
                        className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-700 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomChat;