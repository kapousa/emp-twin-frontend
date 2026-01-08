import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, XCircle, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthProvider';
import axios from 'axios';
import {
  getPersonaDetailsEndpoint,
  getPersonaUpdateEndpoint
} from "@/configurations/api";

interface FullPersonaDetails {
    id: string;
    persona_name: string;
    persona_role: string;
    persona_tone: string;
    knowledge_text: string;
    avatar_url: string | null;
    status: 'queued' | 'processing' | 'ready' | 'failed';
    user_id: string;
    created_at: string;
    updated_at: string;
    knowledge_files?: string[];
}

interface PersonaUpdatePayload {
    personaName: string;
    personaRole: string;
    personaTone: string;
    knowledgeText: string;
    avatarFile?: File | null;
}

const INITIAL_STATE: PersonaUpdatePayload = {
    personaName: '',
    personaRole: '',
    personaTone: '',
    knowledgeText: '',
    avatarFile: null
};

const PersonaEditPage = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [persona, setPersona] = useState<FullPersonaDetails | null>(null);
    const [formData, setFormData] = useState<PersonaUpdatePayload>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPersonaDetails = useCallback(async () => {
        if (!id || !token) return;
        setIsLoading(true);
        try {
            const response = await axios.get(getPersonaDetailsEndpoint(id), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data: FullPersonaDetails = response.data;
            setPersona(data);

            setFormData({
                personaName: data.persona_name || '',
                personaRole: data.persona_role || '',
                // CRITICAL FIX: Ensure value is lowercase to match SelectItem values
                personaTone: (data.persona_tone || '').toLowerCase(),
                knowledgeText: data.knowledge_text || '',
                avatarFile: null
            });
        } catch (err) {
            toast.error("Failed to load persona");
        } finally {
            setIsLoading(false);
        }
    }, [id, token]);

    useEffect(() => { fetchPersonaDetails(); }, [fetchPersonaDetails]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Dedicated handler for Select components
    const handleToneChange = (value: string) => {
        setFormData(prev => ({ ...prev, personaTone: value }));
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('personaName', formData.personaName);
            data.append('personaRole', formData.personaRole);
            data.append('personaTone', formData.personaTone);
            data.append('knowledgeText', formData.knowledgeText);

            const response = await fetch(getPersonaUpdateEndpoint(id!), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) throw new Error('Update failed');
            toast.success("Saved successfully");
            fetchPersonaDetails();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#0A121E]" /></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0A121E] p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <Brain className="w-8 h-8 text-[#FF0000]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Edit Digital Twin</h1>
                            <p className="text-slate-500 text-sm">Update {persona?.persona_name}'s profile and knowledge</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                            <div className="relative inline-block mb-4">
                                <img
                                    src={persona?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`}
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-md mx-auto object-cover"
                                    alt="Avatar"
                                />
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <h3 className="font-bold text-lg">{formData.personaName || 'New Persona'}</h3>
                            <p className="text-slate-500 text-sm mb-4">{formData.personaRole}</p>

                            <div className="pt-4 border-t border-slate-100 text-left text-xs text-slate-400 space-y-2">
                                <p><strong>Status:</strong> <span className="text-blue-600 font-medium capitalize">{persona?.status}</span></p>
                                <p><strong>Last Updated:</strong> {new Date(persona?.updated_at || '').toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="personaName" className="text-slate-700 font-semibold">Persona Name</Label>
                                <Input id="personaName" value={formData.personaName} onChange={handleInputChange} className="bg-white border-slate-200 focus:ring-red-500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personaRole" className="text-slate-700 font-semibold">Role / Title</Label>
                                <Input id="personaRole" value={formData.personaRole} onChange={handleInputChange} className="bg-white border-slate-200 focus:ring-red-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold">Tone of Voice</Label>
                            {/* FIX: Ensure value is provided to the Select component */}
                            <Select
                                value={formData.personaTone}
                                onValueChange={handleToneChange}
                            >
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">{t("digital_copy_wizard.step1.tone_professional")}</SelectItem>
                                    <SelectItem value="friendly">{t("digital_copy_wizard.step1.tone_friendly")}</SelectItem>
                                    <SelectItem value="expert">{t("digital_copy_wizard.step1.tone_expert")}</SelectItem>
                                    <SelectItem value="concise">{t("digital_copy_wizard.step1.tone_concise")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="knowledgeText" className="text-slate-700 font-semibold">Knowledge Base Content</Label>
                            <Textarea
                                id="knowledgeText"
                                value={formData.knowledgeText}
                                onChange={handleInputChange}
                                rows={8}
                                className="bg-white border-slate-200 resize-none focus:ring-red-500"
                                placeholder="Add custom instructions or context here..."
                            />
                        </div>

                        <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
                            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-500 hover:bg-slate-50">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={isSaving} className="bg-[#FF0000] hover:bg-red-700 text-white min-w-[140px] shadow-lg shadow-red-500/20">
                                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonaEditPage;