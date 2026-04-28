import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Loader2, Send, Paperclip, X, Sparkles, Bot
} from 'lucide-react';
import { getPublicPersonaEndpoint, getPublicChatEndpoint, API_BASE_URL } from '@/configurations/api';
import { toast } from 'react-hot-toast';

interface PublicChatProps {
    isEmbed?: boolean;
}

const PublicChat = ({ isEmbed = false }: PublicChatProps) => {
    const { personaId } = useParams<{ personaId: string }>();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<{
        role: 'user' | 'assistant',
        content: string,
        senderName?: string
    }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean API URL helper to avoid double slashes
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');

    useEffect(() => {
        const fetchPersona = async () => {
            if (!personaId || personaId === 'undefined') return;
            try {
                setLoading(true);
                const res = await axios.get(getPublicPersonaEndpoint(personaId));
                if (res.data && res.data.persona) {
                    setPersona(res.data.persona);
                    setActiveSessionId(res.data.session_id);
                }
            } catch (err) {
                console.error("Load error", err);
                toast.error("Assistant not found");
            } finally {
                setLoading(false);
            }
        };
        fetchPersona();
    }, [personaId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || !personaId) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        try {
            const formData = new FormData();
            formData.append('query', currentInput);
            if (activeSessionId) formData.append('session_id', activeSessionId);
            if (attachedFile) formData.append('file', attachedFile);

            const res = await axios.post(getPublicChatEndpoint(personaId), formData);

            const aiMsg = {
                role: 'assistant' as const,
                content: res.data.answer || res.data.reply || "No response",
                senderName: persona?.personaName
            };

            setMessages(prev => [...prev, aiMsg]);
            setAttachedFile(null);
        } catch (err) {
            toast.error("Failed to send message");
        } finally {
            setIsTyping(false);
        }
    };

    if (loading && personaId) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!persona && !loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
                <Bot size={48} className="text-gray-200 mb-4" />
                <h2 className="text-lg font-bold text-gray-900">Persona Not Found</h2>
                <p className="text-sm text-gray-500">This persona may be private or the link is invalid.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-white overflow-hidden ${isEmbed ? 'h-screen w-full' : 'h-screen'}`}>

            {/* CLEAN HEADER */}
            <header className={`${isEmbed ? 'p-3' : 'p-4'} border-b flex items-center bg-white sticky top-0 z-10 shadow-sm`}>
                <div className="flex items-center gap-3">
                    {/* AVATAR WITH INITIALS FALLBACK */}
                    <div className={`${isEmbed ? 'w-10 h-10' : 'w-11 h-11'} bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-gray-100 flex-shrink-0`}>
                        {persona?.avatar_url ? (
                            <img
                                src={`${persona.avatar_url}`}
                                alt={persona.personaName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.classList.add('bg-indigo-600', 'text-white');
                                        parent.innerText = persona?.personaName?.charAt(0).toUpperCase() || 'P';
                                    }
                                }}
                            />
                        ) : (
                            <span>{persona?.personaName?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    {/* NAME & ROLE ALIGNMENT */}
                    <div className="flex flex-col">
                        <h1 className={`${isEmbed ? 'text-sm' : 'text-base'} font-bold text-gray-900 leading-none`}>
                            {persona?.personaName}
                        </h1>
                        {persona?.personaRole && (
                            <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider mt-1">
                                {persona.personaRole}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <Sparkles className="mx-auto text-indigo-200 mb-2" size={32} />
                        <p className="text-gray-400 text-sm italic">Message {persona?.personaName} to start...</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex space-x-1 p-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* INPUT FOOTER */}
            <footer className="p-4 bg-white border-t">
                {attachedFile && (
                    <div className="mb-2 flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        <span className="text-xs text-indigo-700 font-medium truncate">{attachedFile.name}</span>
                        <X size={14} className="cursor-pointer text-indigo-400" onClick={() => setAttachedFile(null)}/>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}/>
                    <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-xl ${attachedFile ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <Paperclip size={20}/>
                    </button>
                    <div className="relative flex-1">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full py-3 pl-4 pr-12 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                        />
                        <button onClick={handleSend} className="absolute right-1.5 top-1.5 p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicChat;