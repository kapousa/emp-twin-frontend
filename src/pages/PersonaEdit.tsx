import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Loader2, Save, UserCircle, Upload, Settings} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/contexts/AuthProvider';
import axios from 'axios';
import {getPersonaDetailsEndpoint, getPersonaUpdateEndpoint, BASE_URL} from "@/configurations/api";

const PersonaEdit = () => {
    const {personaId} = useParams<{ personaId: string }>();
    const {token} = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        personaName: '',
        personaRole: '',
        personaTone: 'Professional',
        knowledgeText: '',
        avatarFile: null as File | null
    });

    const fetchPersonaDetails = useCallback(async () => {
        if (!personaId || !token) return;
        try {
            setLoading(true);
            const res = await axios.get(getPersonaDetailsEndpoint(personaId), {
                headers: {Authorization: `Bearer ${token}`}
            });

            const data = res.data;
            console.log("Mapping data now...", data);

            // KEY FIX: Map backend (snake_case) to frontend (camelCase)
            setFormData({
                personaName: data.persona_name || '',
                personaRole: data.persona_role || '',
                // Ensure the tone matches the Select options (capitalize first letter)
                personaTone: data.persona_tone
                    ? data.persona_tone.charAt(0).toUpperCase() + data.persona_tone.slice(1)
                    : 'Professional',
                knowledgeText: data.knowledge_text || '',
                avatarFile: null
            });

            if (data.avatar_url) {
                setPreviewUrl(data.avatar_url);
            }
        } catch (error) {
            toast.error("Failed to load details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [personaId, token]);

    useEffect(() => {
        fetchPersonaDetails();
    }, [fetchPersonaDetails]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();
            // Backend expects these specific keys in the form
            data.append('personaName', formData.personaName);
            data.append('personaRole', formData.personaRole);
            data.append('personaTone', formData.personaTone.toLowerCase()); // Backend often prefers lowercase
            data.append('knowledgeText', formData.knowledgeText);
            if (formData.avatarFile) data.append('avatarFile', formData.avatarFile);

            await axios.put(getPersonaUpdateEndpoint(personaId!), data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Persona Updated Successfully");
        } catch (e) {
            toast.error("Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-rose-600" size={48}/>
            <p className="text-slate-500 font-medium">Loading persona data...</p>
        </div>
    );

    return (
        <div
            className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-6">
                <h3 className="text-2xl font-black text-slate-800">Basic Information</h3>
                <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover"/>
                        ) : (
                            <UserCircle className="w-full h-full text-slate-300"/>
                        )}
                    </div>
                    <label
                        className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl cursor-pointer hover:bg-rose-600 transition-colors shadow-lg">
                        <Upload size={14}/>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFormData({...formData, avatarFile: file});
                                    setPreviewUrl(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label className="text-slate-600 font-bold uppercase text-xs tracking-wider">Persona Name</Label>
                    <Input
                        value={formData.personaName}
                        onChange={(e) => setFormData({...formData, personaName: e.target.value})}
                        placeholder="e.g. Winter Wolf"
                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-rose-500"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-slate-600 font-bold uppercase text-xs tracking-wider">Role / Title</Label>
                    <Input
                        value={formData.personaRole}
                        onChange={(e) => setFormData({...formData, personaRole: e.target.value})}
                        placeholder="e.g. Tech Consultant"
                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-rose-500"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-slate-600 font-bold uppercase text-xs tracking-wider">Tone of Voice</Label>
                <Select
                    value={formData.personaTone}
                    onValueChange={(v) => setFormData({...formData, personaTone: v})}
                >
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl">
                        <SelectValue placeholder="Select tone"/>
                    </SelectTrigger>
                    <SelectContent>
                        {['Professional', 'Friendly', 'Critical', 'Creative', 'Humorous'].map(tone => (
                            <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <Label className="text-slate-600 font-bold uppercase text-xs tracking-wider">Core Knowledge Base</Label>
                <Textarea
                    value={formData.knowledgeText}
                    onChange={(e) => setFormData({...formData, knowledgeText: e.target.value})}
                    rows={6}
                    placeholder="Describe the persona's background and expertise..."
                    className="bg-slate-50 border-none rounded-2xl focus-visible:ring-rose-500 resize-none p-4"
                />
            </div>

            <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-50">
                {/* Save Button */}
                <Button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-100 w-fit h-auto"
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin mr-2" size={18}/>
                    ) : (
                        <Save className="mr-2" size={18}/>
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                {/* Advanced Settings Button */}
                <Button
        type="button"
        variant="outline"
        onClick={() => navigate(`/persona/${personaId}/advancedsettings`)}
        className="px-6 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all h-auto flex items-center gap-2"
    >
        <Settings size={18} className="text-slate-400" />
        Advanced Settings
    </Button>
            </div>
        </div>
    );
};

export default PersonaEdit;