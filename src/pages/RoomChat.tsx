import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Users, Loader2, ChevronLeft, Copy, FileText, Download, ClipboardList, Check, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { API_BASE_URL } from '@/configurations/api';
import jsPDF from 'jspdf';

const RoomChat = () => {
    const { roomId } = useParams();
    const { token } = useAuth();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Meeting Start Logic
    useEffect(() => {
        if (room && messages.length === 0 && !isTyping) {
            const initialPrompt = `Boardroom meeting started. Topic: ${room.topic}. Agenda: ${room.agenda}. Expert introduce yourselves and provide feedback.`;
            handleSend(initialPrompt);
        }
    }, [room]);

    // Helper Functions
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopyId(id);
        setTimeout(() => setCopyId(null), 2000);
    };

    const exportMessageToPDF = (sender: string, content: string) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Response from: ${sender}`, 10, 20);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 10, 30);
        doc.save(`${sender}_response.pdf`);
    };

    const exportFullChatToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Meeting Transcript: ${room?.room_name}`, 10, 20);
        doc.setFontSize(12);
        let yPos = 30;
        messages.forEach((msg) => {
            const text = `${msg.sender_name || 'AI'}: ${msg.content}`;
            const lines = doc.splitTextToSize(text, 180);
            if (yPos + lines.length * 7 > 280) { doc.addPage(); yPos = 20; }
            doc.text(lines, 10, yPos);
            yPos += lines.length * 7 + 5;
        });
        doc.save(`Meeting_Transcript.pdf`);
    };

    const generateMinutes = () => {
        handleSend("Please summarize our meeting so far, listing key decisions and action items as 'MINUTES OF MEETING'.");
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim()) return;
        if (!overrideInput) {
            setMessages(prev => [...prev, { role: "user", content: textToSend, sender_name: "You" }]);
            setInput("");
        }
        setIsTyping(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/room/${roomId}/chat`, {
                query: textToSend,
                history: messages.map(m => ({ role: m.role, content: m.content, sender_name: m.sender_name }))
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.responses) setMessages(prev => [...prev, ...res.data.responses]);
        } catch (err) { console.error(err); } finally { setIsTyping(false); }
    };

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_BASE_URL}/room/${roomId}/start_meeting`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoom(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        if (roomId && token) fetchRoomDetails();
    }, [roomId, token]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex flex-col gap-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-rose-600" size={20} />
                                {room?.room_name || "Boardroom"}
                            </h1>
                            <p className="text-xs text-gray-400 italic">{room?.topic}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={generateMinutes} className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-sm font-semibold">
                            <ClipboardList size={16} /> Minutes
                        </button>
                        <button onClick={exportFullChatToPDF} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">
                            <Download size={16} /> Export All
                        </button>
                    </div>
                </div>

                {/* RESTORED: Meeting Members List */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Active Board:</span>
                    {room?.members?.map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                            {member.avatar_url ? (
                                <img src={`${API_BASE_URL}${member.avatar_url}`} alt="" className="w-6 h-6 rounded-full object-cover border border-rose-100" />
                            ) : (
                                <UserCircle size={20} className="text-gray-300" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-800 leading-none">{member.persona_name}</span>
                                <span className="text-[9px] text-rose-500 font-medium uppercase tracking-tighter">{member.persona_role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest px-1">{msg.sender_name}</span>
                            <div className={`relative p-4 rounded-2xl border ${msg.role === 'user' ? 'bg-rose-600 text-white border-rose-500 rounded-tr-none' : 'bg-white text-gray-800 border-gray-100 rounded-tl-none shadow-sm'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <div className={`absolute -bottom-8 ${msg.role === 'user' ? 'right-0' : 'left-0'} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border rounded-lg p-1 z-20`}>
                                    <button onClick={() => copyToClipboard(msg.content, `msg-${idx}`)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                        {copyId === `msg-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                    <button onClick={() => exportMessageToPDF(msg.sender_name, msg.content)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                        <FileText size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-gray-400 animate-pulse font-bold flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Board Deliberating...</div>}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t">
                <div className="max-w-4xl mx-auto flex gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Address the board..." className="flex-1 bg-transparent p-3 outline-none resize-none font-medium text-sm" rows={1} />
                    <button onClick={() => handleSend()} className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"><Send size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default RoomChat;