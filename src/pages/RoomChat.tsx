import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Send, Loader2, ChevronLeft, ClipboardList,
    UserCircle, Copy, Check, Paperclip, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import {
    BASE_URL,
    getRoomStartMeetingEndpoint,
    getRoomChatEndpoint,
    generateRoomReportEndpoint,
} from '@/configurations/api';

const RoomChat = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [room, setRoom] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        const startMeeting = async () => {
            try {
                setIsInitialLoading(true);
                const res = await axios.get(getRoomStartMeetingEndpoint(roomId!), {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.session_id) setCurrentSessionId(res.data.session_id);
                if (res.data.responses) setMessages(res.data.responses);
                if (res.data.room) setRoom(res.data.room);

            } catch (err) {
                console.error("Failed to start meeting:", err);
            } finally {
                setIsInitialLoading(false);
                setLoading(false);
            }
        };

        if (roomId && token) startMeeting();
    }, [roomId, token]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId) return;

        const userMessage = {
            role: 'user',
            content: input,
            sender_name: 'You',
            sender_type: 'user',
            fileName: selectedFile?.name // UI feedback for attached file
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentFile = selectedFile;

        setInput("");
        setSelectedFile(null);
        setIsTyping(true);

        try {
            const formData = new FormData();
            formData.append('query', currentInput);
            formData.append('session_id', currentSessionId);
            if (currentFile) formData.append('file', currentFile);

            const res = await axios.post(getRoomChatEndpoint(roomId!, currentSessionId), formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
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

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header omitted for brevity - same as previous */}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3 group`}>
                        {msg.role !== 'user' && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border flex-shrink-0">
                                {msg.avatar_url ? (
                                    <img src={`${BASE_URL}${msg.avatar_url}`} alt={msg.sender_name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-full h-full text-gray-400" />
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1 max-w-[75%]">
                            <div className={`p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' ? 'bg-rose-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none'
                            }`}>
                                <span className={`text-[10px] font-bold block mb-1 uppercase opacity-70 ${msg.role === 'user' ? 'text-rose-100' : 'text-gray-500'}`}>
                                    {msg.sender_name}
                                </span>

                                {msg.fileName && (
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-rose-700/30 rounded text-xs border border-rose-400/30">
                                        <FileText size={14} />
                                        <span className="truncate">{msg.fileName}</span>
                                    </div>
                                )}

                                <div className="text-sm leading-relaxed">{msg.content}</div>
                            </div>

                            {/* Copy Button Container */}
                            {msg.role !== 'user' && (
                                <button
                                    onClick={() => handleCopy(msg.content, idx)}
                                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-600 transition-colors ml-1 mt-1 font-medium"
                                >
                                    {copiedIndex === idx ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    {copiedIndex === idx ? 'Copied' : 'Copy Response'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="animate-pulse text-xs text-gray-400">Board members deliberating...</div>}
                <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t">
                {selectedFile && (
                    <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between bg-rose-50 p-2 rounded-lg border border-rose-100">
                        <div className="flex items-center gap-2 text-xs text-rose-700 font-medium truncate">
                            <FileText size={14} />
                            {selectedFile.name}
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-rose-400 hover:text-rose-600 text-xs">Remove</button>
                    </div>
                )}

                <div className="max-w-4xl mx-auto flex gap-2 items-end bg-gray-50 p-2 rounded-2xl border">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Address the board..."
                        className="flex-1 bg-transparent p-2 outline-none resize-none text-sm min-h-[40px]"
                        rows={1}
                    />

                    <button
                        onClick={handleSend}
                        disabled={isTyping || (!input.trim() && !selectedFile)}
                        className="bg-rose-600 text-white p-2 rounded-xl hover:bg-rose-700 disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomChat;