import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PersonaCard from '@/components/persona/PersonaCard';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { PERSONA_LIST_ENDPOINT } from "@/configurations/api";
import { useAuth } from '@/contexts/AuthProvider'; // Import useAuth

const PERSONA_LIST_ENDPOINT_URL = `${PERSONA_LIST_ENDPOINT}`;

// Type definition (should match your PersonaCard type and backend model)
interface Persona {
  id: string;
  personaName: string;
  personaRole: string;
  avatar_url: string | null;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  // Add any other fields your Persona schema returns that you use
}

const PersonaListPage = () => {
  const { t } = useTranslation();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { token, logout } = useAuth(); // Get token and logout from AuthContext
  const navigate = useNavigate(); // For redirecting on specific auth issues

  // --- Data Fetching ---
  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError(t("admin.personas.error_auth_missing")); // Use translation key
      setLoading(false);
      logout();
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(PERSONA_LIST_ENDPOINT_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        setError(t("admin.personas.error_session_expired")); // Use translation key
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || t("admin.personas.error_fetch_failed")); // Use translation key
      }
      const data: Persona[] = await response.json();
      setPersonas(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || t("admin.personas.error_unknown_fetch")); // Use translation key
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate, t]); // Added 't' to dependencies

  useEffect(() => {
    document.title = t("admin.personas.title"); // Use translation key
    fetchPersonas();
  }, [fetchPersonas, t]);

  // --- Delete Handler ---
  const handleDeletePersona = async (id: string) => {
    // Use translation key for confirmation message
    if (!window.confirm(t("admin.personas.delete_confirm", { id }))) {
      return;
    }

    setDeletingId(id);
    try {
      if (!token) {
          setError(t("admin.personas.error_auth_missing")); // Use translation key
          setDeletingId(null);
          logout();
          navigate('/login');
          return;
      }

      const response = await fetch(`${PERSONA_LIST_ENDPOINT_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError(t("admin.personas.error_delete_auth_failed")); // Use translation key
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || t("admin.personas.error_delete_failed", { message: errorData.detail || 'Unknown error' })); // Use translation key
      }

      setPersonas(prev => prev.filter(p => p.id !== id));

    } catch (err: any) {
      console.error("Delete error:", err);
      setError(t("admin.personas.error_delete_failed", { message: err.message || t("admin.personas.error_unknown_delete") })); // Use translation key
    } finally {
      setDeletingId(null);
    }
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">{t("admin.personas.loading")}</p> {/* Use translation key */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto mt-10">
        <p className="text-red-600 font-semibold">{error}</p>
        <Button onClick={fetchPersonas} className="mt-4">
            {t("admin.personas.error_try_reloading")} {/* Use translation key */}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header and Call to Action */}
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            <Brain className="h-8 w-8 inline mr-3 text-primary" />
            {t("admin.personas.header")} {/* Use translation key */}
          </h1>
          <p className="text-muted-foreground mt-1">{t("admin.personas.description")}</p> {/* Use translation key */}
        </div>
        <Link to="/admin/digital-copy">
          <Button size="lg" className="shadow-lg">
            {t("admin.personas.new_button")} {/* Use translation key */}
          </Button>
        </Link>
      </div>

      {/* Persona Grid */}
      {personas.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed border-border rounded-xl mt-10">
          <p className="text-xl text-muted-foreground">{t("admin.personas.empty_state_message")}</p> {/* Use translation key */}
          <Link to="/admin/digital-copy">
            <Button className="mt-6 text-lg">{t("admin.personas.empty_state_button")}</Button> {/* Use translation key */}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onDelete={handleDeletePersona}
              isDeleting={deletingId === persona.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonaListPage;