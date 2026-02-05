import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthProvider';
import axios from 'axios';
import { getPersonaDetailsEndpoint, getPersonaUpdateEndpoint } from "@/configurations/api";

interface PersonaEditProps {
    personaId: string;
    onUpdateSuccess?: () => void;
}

const PersonaEditComponent: React.FC<PersonaEditProps> = ({ personaId, onUpdateSuccess }) => {
    const { token } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        personaName: '',
        personaRole: '',
        personaTone: 'Professional',
        knowledgeText: '',
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(getPersonaDetailsEndpoint(personaId), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormData({
                    personaName: res.data.persona_name || '',
                    personaRole: res.data.persona_role || '',
                    personaTone: res.data.persona_tone || 'Professional',
                    knowledgeText: res.data.knowledge_text || '',
                });
            } catch (error) {
                toast.error("Failed to load persona details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [personaId, token]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('personaName', formData.personaName);
            data.append('personaRole', formData.personaRole);
            data.append('personaTone', formData.personaTone);
            data.append('knowledgeText', formData.knowledgeText);

            await axios.put(getPersonaUpdateEndpoint(personaId), data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Persona updated successfully");
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Persona Name</Label>
                    <Input
                        value={formData.personaName}
                        onChange={(e) => setFormData({...formData, personaName: e.target.value})}
                        className="bg-slate-50 border-none h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Role / Title</Label>
                    <Input
                        value={formData.personaRole}
                        onChange={(e) => setFormData({...formData, personaRole: e.target.value})}
                        className="bg-slate-50 border-none h-12"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Tone of Voice</Label>
                <Select
                    value={formData.personaTone}
                    onValueChange={(v) => setFormData({...formData, personaTone: v})}
                >
                    <SelectTrigger className="bg-slate-50 border-none h-12">
                        <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                        {['Professional', 'Friendly', 'Critical', 'Creative', 'Humorous'].map(tone => (
                            <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Core Knowledge Base</Label>
                <Textarea
                    value={formData.knowledgeText}
                    onChange={(e) => setFormData({...formData, knowledgeText: e.target.value})}
                    rows={6}
                    className="bg-slate-50 border-none resize-none"
                />
            </div>

            <Button onClick={handleUpdate} disabled={isSaving} className="w-full bg-[#FF0000] hover:bg-red-700 text-white h-14 rounded-2xl">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
            </Button>
        </div>
    );
};

export default PersonaEditComponent;