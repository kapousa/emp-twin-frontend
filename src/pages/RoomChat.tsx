import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Button} from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Send, Loader2, ChevronLeft, ClipboardList,
    UserCircle, Copy, Check, Paperclip, FileText, Brain, LogOut, Mail, XCircle
} from 'lucide-react';
import {useAuth} from '@/contexts/AuthProvider';
import {toast} from 'sonner';
import {
    BASE_URL,
    getRoomStartMeetingEndpoint,
    getRoomChatEndpoint,
    generateRoomReportEndpoint,
} from '@/configurations/api';

const RoomChat = () => {
    const {roomId} = useParams();
    const navigate = useNavigate();
    const {token} = useAuth();

    const [room, setRoom] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isMeetingEnded, setIsMeetingEnded] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isTyping, isMeetingEnded]);

    // Initialize Meeting
    useEffect(() => {
        const startMeeting = async () => {
            if (!roomId || !token) return;
            try {
                setIsInitialLoading(true);
                const res = await axios.get(getRoomStartMeetingEndpoint(roomId), {
                    headers: {Authorization: `Bearer ${token}`}
                });

                if (res.data.session_id) setCurrentSessionId(res.data.session_id);
                if (res.data.responses) setMessages(res.data.responses);
                if (res.data.room) setRoom(res.data.room);

            } catch (err) {
                console.error("Failed to start meeting:", err);
                toast.error("Could not connect to the boardroom.");
            } finally {
                setIsInitialLoading(false);
                setLoading(false);
            }
        };

        startMeeting();
    }, [roomId, token]);

    // Handle Report Generation & Ending Meeting
const handleGenerateReport = async () => {
    if (!roomId || !currentSessionId || isGeneratingReport) return;

    // 1. Capture the unique ID of the loading toast
    const reportToastId = toast.loading("Finalizing deliberations and compiling report...");

    try {
        setIsGeneratingReport(true);

        // API call to the backend
        await axios.post(generateRoomReportEndpoint(roomId, currentSessionId), {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 2. SUCCESS: Dismiss the loading toast so it doesn't stay on screen
        toast.dismiss(reportToastId);

        // Change UI state to show the "Meeting Concluded" card
        setIsMeetingEnded(true);

    } catch (err) {
        console.error("Report Error:", err.response?.data?.detail);

        // 3. ERROR: Update the existing loading toast to show the error message
        toast.error(err.response?.data?.detail || "The board encountered an error finalizing the report.", {
            id: reportToastId, // This replaces the spinner with an error icon
        });
    } finally {
        setIsGeneratingReport(false);
    }
};

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId || isMeetingEnded) return;

        const userMessage = {
            role: 'user',
            content: input,
            sender_name: 'You',
            sender_type: 'user',
            fileName: selectedFile?.name
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
            formData.append('history', JSON.stringify(messages));
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
            toast.error("The board is currently unavailable.");
        } finally {
            setIsTyping(false);
        }
    };

    // INITIAL LOADING STATE
    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 text-rose-600 animate-spin"/>
                    <Brain
                        className="w-8 h-8 text-rose-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Convening the Board</h2>
                <p className="text-gray-500 max-w-xs mx-auto animate-pulse text-sm">
                    Your digital personas are reviewing the agenda and preparing their initial insights...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="p-4 bg-white border-b flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={20}/>
                    </button>
                    <div>
                        <h1 className="font-black text-lg text-gray-900 leading-none mb-1">{room?.room_name || 'Boardroom'}</h1>
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${isMeetingEnded ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></span>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                {isMeetingEnded ? 'Session Concluded' : 'Active Board Session'}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    disabled={isGeneratingReport || isMeetingEnded}
                    onClick={handleGenerateReport}
                    className={`gap-2 rounded-xl px-4 py-5 text-xs font-bold transition-all shadow-sm ${
                        isMeetingEnded
                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                    }`}
                >
                    {isGeneratingReport ? (
                        <Loader2 size={16} className="animate-spin"/>
                    ) : isMeetingEnded ? (
                        <Check size={16}/>
                    ) : (
                        <LogOut size={16}/>
                    )}
                    {isGeneratingReport ? "Finalizing Report..." : isMeetingEnded ? "Report Generated" : "End Meeting & Generate Report"}
                </Button>
            </header>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx}
                         className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3 group`}>
                        {msg.role !== 'user' && (
                            <div
                                className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border flex-shrink-0 shadow-sm">
                                {msg.avatarPath ? (
                                    <img src={`${BASE_URL}${msg.avatarPath}`} alt={msg.sender_name}
                                         className="w-full h-full object-cover"/>
                                ) : (
                                    <UserCircle className="w-full h-full text-gray-400"/>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1 max-w-[80%]">
                            <div className={`p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' ? 'bg-rose-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none'
                            }`}>
                                <span
                                    className={`text-[10px] font-black block mb-2 uppercase tracking-tight opacity-70 ${msg.role === 'user' ? 'text-rose-100' : 'text-rose-600'}`}>
                                    {msg.sender_name}
                                </span>

                                {msg.fileName && (
                                    <div
                                        className="flex items-center gap-2 mb-3 p-2 bg-black/10 rounded text-xs border border-white/10 italic">
                                        <FileText size={14}/>
                                        <span className="truncate">{msg.fileName}</span>
                                    </div>
                                )}

                                <div className={`text-sm leading-relaxed prose prose-sm max-w-none 
                                    ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} 
                                    prose-headings:font-black prose-headings:text-inherit prose-strong:text-inherit`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {msg.role !== 'user' && (
                                <button
                                    onClick={() => handleCopy(msg.content, idx)}
                                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-600 transition-colors ml-1 mt-1 font-bold"
                                >
                                    {copiedIndex === idx ? <Check size={12} className="text-green-500"/> :
                                        <Copy size={12}/>}
                                    {copiedIndex === idx ? 'Copied to clipboard' : 'Copy response'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Thinking State */}
                {isTyping && (
                    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div
                            className="w-10 h-10 rounded-full bg-white border flex items-center justify-center shadow-sm">
                            <Loader2 size={18} className="text-rose-600 animate-spin"/>
                        </div>
                        <div className="bg-white border p-4 rounded-2xl rounded-bl-none shadow-sm">
                            <div className="flex gap-1.5 mb-2">
                                <span
                                    className="w-2 h-2 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span
                                    className="w-2 h-2 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-rose-600 rounded-full animate-bounce"></span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Board is
                                deliberating...</p>
                        </div>
                    </div>
                )}

                {/* MEETING CONCLUDED SUCCESS CARD */}
                {isMeetingEnded && (
                    <div className="flex justify-center p-8 animate-in fade-in zoom-in duration-700">
                        <div
                            className="max-w-md bg-white border-2 border-emerald-100 p-8 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                            <div
                                className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Mail size={40} className="animate-pulse"/>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Meeting Successfully
                                Concluded</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed px-4">
                                The board has finished its analysis. Due to the depth of our strategic review,
                                <strong> it may take a few minutes</strong> to finalize your document.
                            </p>
                            <div
                                className="bg-emerald-50 rounded-[24px] p-5 flex items-center gap-4 text-left border border-emerald-100">
                                <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm flex-shrink-0">
                                    <ClipboardList size={24}/>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">Executive
                                        Report</p>
                                    <p className="text-[11px] text-emerald-600 leading-tight">A detailed PDF summary is
                                        being sent to your inbox now.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef}/>
            </div>

            {/* Input Footer */}
            <div
                className={`p-4 bg-white border-t transition-all duration-500 ${isMeetingEnded ? 'grayscale opacity-50 bg-gray-100 pointer-events-none' : ''}`}>
                <div className="max-w-4xl mx-auto">
                    {selectedFile && (
                        <div
                            className="mb-2 flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-xs text-rose-700 font-bold truncate">
                                <FileText size={16}/>
                                {selectedFile.name}
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="text-rose-400 hover:text-rose-600">
                                <XCircle size={18}/>
                            </button>
                        </div>
                    )}

                    <div
                        className="flex gap-2 items-end bg-gray-50 p-2 rounded-2xl border transition-all focus-within:border-rose-200 focus-within:bg-white focus-within:shadow-md">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <button
                            onClick={() => !isMeetingEnded && fileInputRef.current?.click()}
                            disabled={isMeetingEnded}
                            className="p-3 text-gray-400 hover:text-rose-600 transition-colors"
                        >
                            <Paperclip size={22}/>
                        </button>

                        <textarea
                            value={input}
                            disabled={isMeetingEnded}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isMeetingEnded ? "This session is now closed." : "Address the board..."}
                            className="flex-1 bg-transparent p-3 outline-none resize-none text-sm min-h-[48px] max-h-[200px]"
                            rows={1}
                        />

                        <button
                            onClick={handleSend}
                            disabled={isTyping || isMeetingEnded || (!input.trim() && !selectedFile)}
                            className="bg-rose-600 text-white p-4 rounded-xl hover:bg-rose-700 disabled:opacity-50 shadow-lg shadow-rose-200 transition-all active:scale-90"
                        >
                            {isTyping ? <Loader2 className="animate-spin" size={22}/> : <Send size={22}/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomChat;