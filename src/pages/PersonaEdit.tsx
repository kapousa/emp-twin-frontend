// src/pages/PersonaEditPage.tsx (FINAL REVISION - JSX Comment Fix)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, XCircle, Brain, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthProvider';
import {
  getPersonaDetailsEndpoint,
  getPersonaUpdateEndpoint
} from "@/configurations/api";

// --- REVISED FullPersonaDetails INTERFACE (MUST MATCH BACKEND'S ACTUAL JSON OUTPUT) ---
// Based on LOG 1, the backend is sending snake_case for persona_name, persona_role, etc.
interface FullPersonaDetails {
    id: string;
    persona_name: string;      // Back to snake_case to match actual JSON
    persona_role: string;      // Back to snake_case
    persona_tone: string;      // Back to snake_case
    knowledge_text: string;    // Back to snake_case
    avatar_url: string | null; // This one was already correct
    status: 'queued' | 'processing' | 'ready' | 'failed'; // Already correct
    user_id: string;           // Back to snake_case
    created_at: string;        // Back to snake_case
    updated_at: string;        // Back to snake_case
    knowledge_files?: any[];   // Matching knowledge_files from LOG 1
}

// Interface for update payload - keep as camelCase IF your PersonaUpdate schema
// on the backend has aliases to convert them to snake_case for the DB.
// If your PersonaUpdate *also* expects snake_case, you'd change this too.
// For now, let's assume PersonaUpdate is still expecting camelCase with aliases.
interface PersonaUpdatePayload {
    personaName?: string;
    personaRole?: string;
    personaTone?: string;
    knowledgeText?: string;
}

const PersonaEditPage = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const [persona, setPersona] = useState<FullPersonaDetails | null>(null);
    const [formData, setFormData] = useState<PersonaUpdatePayload>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Dynamic Avatar Placeholder Logic (No change) ---
    const numberOfStaticAvatars = 5;
    const basePlaceholderName = "/user-placeholder-";
    const getDynamicAvatarIndex = (personaId: string, totalAvatars: number): number => {
        let hash = 0;
        for (let i = 0; i < personaId.length; i++) {
            hash = personaId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % totalAvatars) + 1;
    };
    const dynamicAvatarIndex = id ? getDynamicAvatarIndex(id, numberOfStaticAvatars) : 1;
    const dynamicStaticAvatarSrc = `${basePlaceholderName}${dynamicAvatarIndex}.png`;
    // --- End Dynamic Avatar Placeholder Logic ---

    // --- Date Formatting Utility (No change) ---
    const formatDate = useCallback((dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleString();
        } catch (e) {
            console.error("Failed to parse date:", dateString, e);
            return 'Invalid Date';
        }
    }, []);

    // --- Fetch Persona Details ---
    const fetchPersonaDetails = useCallback(async () => {
        if (!id) {
            setError(t("persona_edit.error.missing_id"));
            setIsLoading(false);
            return;
        }
        if (!token) {
            setError(t("persona_edit.error.auth_missing"));
            setIsLoading(false);
            logout();
            navigate('/login');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(getPersonaDetailsEndpoint(id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                setError(t("persona_edit.error.session_expired"));
                logout();
                navigate('/login');
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || t("persona_edit.error.fetch_failed"));
            }

            const data: FullPersonaDetails = await response.json();
            console.log("LOG 1: API response 'data':", data);
            // THESE LOGS WILL NOW CORRECTLY SHOW VALUES
            console.log("LOG 1.1: data.persona_tone:", data.persona_tone);
            console.log("LOG 1.2: data.knowledge_text:", data.knowledge_text);


            setPersona(data);

            const initialFormData = {
                personaName: data.persona_name, // Now mapping from snake_case data
                personaRole: data.persona_role, // Now mapping from snake_case data
                personaTone: data.persona_tone, // Now mapping from snake_case data
                knowledgeText: data.knowledge_text, // Now mapping from snake_case data
            };
            console.log("LOG 2: Initial formData set with:", initialFormData);

            setFormData(initialFormData);

        } catch (err: any) {
            console.error("Failed to fetch persona details:", err);
            setError(err.message || t("persona_edit.error.unknown"));
        } finally {
            setIsLoading(false);
        }
    }, [id, token, logout, navigate, t]);

    useEffect(() => {
        document.title = t("persona_edit.document_title");
        fetchPersonaDetails();
    }, [fetchPersonaDetails, t]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string, field: keyof PersonaUpdatePayload) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // --- Handle Persona Update ---
    const handleUpdate = async () => {
        if (!id) return;
        if (!token) {
            setError(t("persona_edit.error.auth_missing_update"));
            logout();
            navigate('/login');
            return;
        }

        setIsSaving(true);
        setError(null);

        const updatedFields: PersonaUpdatePayload = {};
        // Compare with current 'persona' state (which is now snake_case) and update formData (camelCase)
        // This assumes your PersonaUpdatePayload (camelCase) will be correctly aliased by backend.
        if (formData.personaName !== persona?.persona_name) updatedFields.personaName = formData.personaName;
        if (formData.personaRole !== persona?.persona_role) updatedFields.personaRole = formData.personaRole;
        if (formData.personaTone !== persona?.persona_tone) updatedFields.personaTone = formData.personaTone;
        if (formData.knowledgeText !== persona?.knowledge_text) updatedFields.knowledgeText = formData.knowledgeText;


        if (Object.keys(updatedFields).length === 0) {
            toast.info(t("persona_edit.no_changes_toast"));
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(getPersonaUpdateEndpoint(id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedFields)
            });

            if (response.status === 401 || response.status === 403) {
                setError(t("persona_edit.error.session_expired_update"));
                logout();
                navigate('/login');
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || t("persona_edit.error.update_failed"));
            }

            toast.success(t("persona_edit.update_success_toast"));
            await fetchPersonaDetails();
        } catch (err: any) {
            console.error("Failed to update persona:", err);
            setError(err.message || t("persona_edit.error.unknown_update"));
            toast.error(t("persona_edit.update_error_toast"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3 text-xl">{t("persona_edit.loading_details")}</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 text-lg">{error}</p>
                <Button onClick={() => navigate('/admin/personas')} className="mt-4">
                    {t("persona_edit.back_to_list_button")}
                </Button>
            </div>
        );
    }
    if (!persona) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 text-lg">{t("persona_edit.error.persona_not_found")}</p>
                <Button onClick={() => navigate('/admin/personas')} className="mt-4">
                    {t("persona_edit.back_to_list_button")}
                </Button>
            </div>
        );
    }

    console.log("LOG 3: Current formData at render:", formData);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-primary" />
                {t("persona_edit.title", { personaName: persona.persona_name })}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative p-2 bg-gradient-to-br from-background to-secondary rounded-lg shadow-md">
                            <img
                                src={persona.avatar_url || dynamicStaticAvatarSrc}
                                alt={`${persona.persona_name}'s avatar`} // JSX Comment Fixed Here
                                className="w-40 h-40 object-cover rounded-md"
                                onError={(e) => { e.currentTarget.src = "/placeholder-avatar.png"; }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 text-center">
                        {/*
                        <p className="text-lg"><strong>ID:</strong> {persona.id}</p>
                        <p className="flex items-center justify-center text-muted-foreground">
                            <UserIcon className="h-4 w-4 mr-2" />
                            <strong>User ID:</strong> {persona.user_id || 'N/A'}
                        </p>
                        */}
                        <p className="text-muted-foreground">
                            <strong>Status:</strong> {persona.status?.toUpperCase() || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            <strong>Created:</strong> {formatDate(persona.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            <strong>Last Updated:</strong> {formatDate(persona.updated_at)}
                        </p>
                    </div>
                </div>

                {/* Right Column: Editable Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="personaName">{t("persona_edit.form.name_label")}</Label>
                        <Input
                            id="personaName"
                            value={formData.personaName || ''}
                            onChange={handleInputChange}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="personaRole">{t("persona_edit.form.role_label")}</Label>
                        <Input
                            id="personaRole"
                            value={formData.personaRole || ''}
                            onChange={handleInputChange}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="personaTone">{t("persona_edit.form.tone_label")}</Label>
                        <Select
                            value={formData.personaTone || ''} // Comment removed
                            onValueChange={(value) => handleSelectChange(value, 'personaTone')}
                            disabled={isSaving}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("persona_edit.form.select_tone_placeholder")}>
                                    {formData.personaTone || t("persona_edit.form.select_tone_placeholder")}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">{t("digital_copy_wizard.step1.tone_professional")}</SelectItem>
                                <SelectItem value="friendly">{t("digital_copy_wizard.step1.tone_friendly")}</SelectItem>
                                <SelectItem value="expert">{t("digital_copy_wizard.step1.tone_expert")}</SelectItem>
                                <SelectItem value="concise">{t("digital_copy_wizard.step1.tone_concise")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="knowledgeText">{t("persona_edit.form.knowledge_text_label")}</Label>
                        <Textarea
                            id="knowledgeText"
                            value={formData.knowledgeText || ''} // Comment removed
                            onChange={handleInputChange}
                            rows={8}
                            disabled={isSaving}
                        />
                        <p className="text-sm text-muted-foreground">
                            {t("persona_edit.form.knowledge_text_description")}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/personas')}
                            disabled={isSaving}
                        >
                            <XCircle className="h-4 w-4 mr-2" /> {t("persona_edit.cancel_button")}
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {t("persona_edit.save_changes_button")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonaEditPage;