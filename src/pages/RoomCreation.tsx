import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {Users, CheckCircle2, ArrowRight, Loader2, FileText, Upload, Target, X} from 'lucide-react';
import {toast} from 'react-hot-toast';
import {
    PERSONA_LIST_ENDPOINT,
    ROOM_CREATE_ENDPOINT
} from '@/configurations/api';
import {useAuth} from '@/contexts/AuthProvider';

const RoomCreation = () => {
    const {token, logout} = useAuth();
    const navigate = useNavigate();

    const [roomName, setRoomName] = useState("");
    const [topic, setTopic] = useState("");
    const [personas, setPersonas] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const fetchPersonas = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(PERSONA_LIST_ENDPOINT, {
                headers: {Authorization: `Bearer ${token}`}
            });

            const cleanData = res.data.map((item: any) => {
                // If it's already an object, return it
                if (typeof item === 'object' && item !== null) return item;

                // PARSING THE STRING: <PersonaModel(id='...', personaName='...')>
                const obj: any = {};

                // This regex is very aggressive to catch any key='value' or key=value
                const regex = /(\w+)=['"]?([^'"]+?)['"]?(?=[,)]|\s|$)/g;
                let match;
                while ((match = regex.exec(item)) !== null) {
                    obj[match[1]] = match[2];
                }
                return obj;
            });

            setPersonas(cleanData);
        } catch (err: any) {
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
            toast.error("Failed to load experts");
        } finally {
            setLoading(false);
        }
    }, [token, logout, navigate]);
    useEffect(() => {
        fetchPersonas();
    }, [fetchPersonas]);

    const togglePersona = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!token) return;
        if (!roomName.trim()) return toast.error("Please name the boardroom");
        if (selectedIds.length < 2) return toast.error("Select at least 2 specialists");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('room_name', roomName);
            formData.append('topic', topic);
            // Send as a JSON string so the backend can parse it easily
            formData.append('persona_ids', JSON.stringify(selectedIds));

            attachedFiles.forEach(file => {
                formData.append('files', file);
            });

            const res = await axios.post(ROOM_CREATE_ENDPOINT, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Crucial for FormData
                }
            });

            toast.success("Boardroom Initialized!");
            navigate(`/rooms/${res.data.room_id}`);
        } catch (err) {
            toast.error("Failed to create boardroom. Check backend logs.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2
        className="animate-spin text-[#E11D48]" size={40}/></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto pb-20">
            <header className="mb-10">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-4">
                    <div className="p-3 bg-[#E11D48] text-white rounded-2xl shadow-lg shadow-red-100">
                        <Users size={28}/>
                    </div>
                    New Boardroom
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-[#E11D48]">
                            <Target size={20}/>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Strategy Briefing</h2>
                        </div>

                        <input
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Boardroom Title (e.g. Project Alpha)"
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#E11D48] outline-none font-bold transition-all text-lg"
                        />

                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Define the primary objective for the board..."
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#E11D48] outline-none font-medium h-48 resize-none transition-all"
                        />
                    </section>

                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-[#E11D48]">
                            <FileText size={20}/>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Shared Documents</h2>
                        </div>
                        <label
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                            <Upload className="w-8 h-8 text-gray-300 mb-2"/>
                            <p className="text-xs font-black text-gray-400 uppercase">Attach Resources
                                ({attachedFiles.length})</p>
                            <input type="file" multiple className="hidden"
                                   onChange={(e) => e.target.files && setAttachedFiles(Array.from(e.target.files))}/>
                        </label>
                    </section>
                </div>

                {/* Right Column (Persona List) */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm sticky top-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Invite Experts
                            ({selectedIds.length})</h2>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {personas.map((p) => {
                                const isSelected = selectedIds.includes(p.id);
                                const name = p.persona_name || "Unnamed Persona";
                                const role = p.persona_role || "Specialist";

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => togglePersona(p.id)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                            isSelected ? 'border-[#E11D48] bg-red-50' : 'border-gray-50 bg-white hover:border-gray-200'
                                        }`}
                                    >
                                        {/* AVATAR FIX: Check for avatar_url first */}
                                        <div
                                            className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-black text-white ${
                                                isSelected ? 'bg-[#E11D48]' : 'bg-gray-200'
                                            }`}>
                                            {p.avatar_url ? (
                                                <img src={p.avatar_url} alt={name}
                                                     className="w-full h-full object-cover"/>
                                            ) : (
                                                <span>{name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-black text-gray-900 text-sm leading-tight">{name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase truncate tracking-tight">{role}</p>
                                        </div>
                                        {isSelected && <CheckCircle2 size={18} className="text-[#E11D48]"/>}
                                    </div>
                                );
                            })}            </div>

                        <button
  onClick={handleCreate}
  disabled={uploading || selectedIds.length < 2 || !roomName.trim()}
  className="w-full mt-8 py-5 bg-[#E11D48] text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all"
>
  {uploading ? (
    <Loader2 className="animate-spin" />
  ) : (
    <>
      Assemble Board
      <ArrowRight size={20} /> {/* This replaces the "->" text arrow */}
    </>
  )}
</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomCreation;