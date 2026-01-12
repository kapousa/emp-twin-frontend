import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, Send, Bot, Sparkles, Paperclip, User,
  Copy, FileText, Check, FileDown, X
} from 'lucide-react';
import { getPublicPersonaEndpoint, getPublicChatEndpoint } from '@/configurations/api';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const PublicChat = () => {
    const { personaId } = useParams<{ personaId: string }>();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, senderName?: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await axios.get(getPublicPersonaEndpoint(personaId!));
                // Extracting the nested persona object that now includes avatar_url
                const data = res.data.persona;
                setPersona(data);
                setActiveSessionId(res.data.session_id);
            } catch (err) {
                console.error("Load error", err);
                toast.error("Could not load persona");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [personaId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast.success("Copied!");
    };

    const downloadFullChatPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Chat History: ${persona?.personaName || 'Assistant'}`, 15, 15);
        let y = 25;
        messages.forEach(m => {
            const name = m.role === 'user' ? 'You' : (m.senderName || 'Assistant');
            const lines = doc.splitTextToSize(`${name}: ${m.content}`, 180);
            if (y + (lines.length * 7) > 280) { doc.addPage(); y = 20; }
            doc.text(lines, 15, y);
            y += (lines.length * 7) + 5;
        });
        doc.save('chat-history.pdf');
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() && !attachedFile) return;

        setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        setInput("");
        setSuggestions([]);
        setIsTyping(true);

        try {
            const formData = new FormData();
            formData.append("query", textToSend);
            formData.append("session_id", activeSessionId || "");

            // CRITICAL FIX: Map 'role' to 'sender' for backend rag_services.py compatibility
            const historyForBackend = messages.slice(-6).map(m => ({
                sender: m.role, // Backend expects msg['sender']
                content: m.content
            }));
            formData.append("chat_history", JSON.stringify(historyForBackend));

            if (attachedFile) formData.append("user_docs", attachedFile);

            const res = await axios.post(getPublicChatEndpoint(personaId!), formData);

            let botAnswer = res.data.answer;
            if (botAnswer.toLowerCase().startsWith("answer:")) {
                botAnswer = botAnswer.replace(/^answer:\s*/i, "");
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: botAnswer,
                senderName: res.data.persona_name
            }]);

            setSuggestions(Array.isArray(res.data.suggestions) ? res.data.suggestions : []);
            setAttachedFile(null);
        } catch (err) {
            toast.error("Internal Server Error - Check Connection");
        } finally {
            setIsTyping(false);
        }
    };

// In PublicChat.tsx
const PersonaAvatar = ({ size = "w-6 h-6" }: { size?: string }) => {
    // Standardize the backend URL
    const BACKEND_URL = "http://localhost:8000";

    // Use the same logic as PersonaCard: look for avatar_url
    const avatarUrl = persona?.avatar_url;

    // Construct full URL if it's a relative path
    const fullSrc = avatarUrl
        ? (avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_URL}${encodeURI(avatarUrl)}`)
        : null;

    return (
        <div className={`${size} rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-indigo-100`}>
            {fullSrc ? (
                <img
                    src={fullSrc}
                    alt={persona?.personaName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <span className="text-white font-bold uppercase" style={{ fontSize: '40%' }}>
                    {persona?.personaName?.charAt(0) || 'P'}
                </span>
            )}
        </div>
    );
};

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
            {/* HEADER */}
            <header className="px-6 py-4 border-b bg-white flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <PersonaAvatar size="w-10 h-10" />
                    <div>
                        <h2 className="font-bold text-gray-900 leading-tight">{persona?.personaName || "Assistant"}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Online Now</p>
                        </div>
                    </div>
                </div>
                <button onClick={downloadFullChatPDF} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 border border-transparent hover:border-gray-200 transition-all">
                    <FileDown size={20} />
                </button>
            </header>

            <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <Bot size={48} className="mb-2" />
                        <p className="text-sm font-medium">How can {persona?.personaName || "I"} help you today?</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                            {m.role === 'user' ? (
                                <><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">You</span><div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"><User size={10} className="text-gray-500" /></div></>
                            ) : (
                                <><PersonaAvatar size="w-5 h-5" /><span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{m.senderName || persona?.personaName}</span></>
                            )}
                        </div>
                        <div className={`group relative max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm border ${
                            m.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                        }`}>
                            {m.content}
                            <button onClick={() => handleCopy(m.content, i)} className={`absolute top-0 ${m.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 p-1.5 bg-white border rounded-md shadow-sm transition-opacity`}>
                                {copiedIndex === i ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-gray-400"/>}
                            </button>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                            <PersonaAvatar size="w-5 h-5" />
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Typing...</span>
                        </div>
                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl flex gap-1 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 border-t bg-white shrink-0">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    {suggestions.length > 0 && !isTyping && (
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, idx) => (
                                <button key={idx} onClick={() => handleSend(s)} className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1">
                                    <Sparkles size={10} /> {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {attachedFile && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-2 rounded-lg w-fit">
                            <Paperclip size={14} className="text-indigo-600"/>
                            <span className="text-xs font-bold text-indigo-700 truncate max-w-[150px]">{attachedFile.name}</span>
                            <X size={14} className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={() => setAttachedFile(null)}/>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files?.[0] || null)} />
                        <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-xl transition-colors ${attachedFile ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <Paperclip size={20} />
                        </button>
                        <div className="relative flex-1">
                            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Message ${persona?.personaName || 'Persona'}...`} className="w-full py-3.5 pl-4 pr-12 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-100" />
                            <button onClick={() => handleSend()} className="absolute right-1.5 top-1.5 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"><Send size={18} /></button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicChat;