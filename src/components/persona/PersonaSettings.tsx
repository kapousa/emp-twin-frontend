import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthProvider';
import {
  getPersonaDetailsEndpoint,
  getUpdatePersonaSettingsEndpoint
} from '@/configurations/api';
import { Save, Zap, ShieldCheck, Share2, Copy, Globe, Loader2, Info, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PersonaEditComponent from '@/components/persona/PersonaEdit';

const PersonaSettings = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const currentOrigin = window.location.origin;

  // Initialize state with all fields required by your backend
  const [settings, setSettings] = useState({
    status_mode: 'normal',
    max_tokens: 500,
    temperature: 0.7,
    is_public: false,
    daily_token_limit: 10000,
    supported_docs: ['pdf', 'docx', 'txt']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!personaId || !token) return;
      try {
        const res = await axios.get(getPersonaDetailsEndpoint(personaId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          // Map backend camelCase (Persona.py) to our internal snake_case state
          setSettings({
            status_mode: res.data.status_mode || 'normal',
            max_tokens: res.data.maxTokens || 500,
            temperature: res.data.temperature || 0.7,
            is_public: res.data.is_public ?? false,
            daily_token_limit: res.data.dailyLimit || 10000,
            supported_docs: res.data.supported_docs || ['pdf', 'docx', 'txt']
          });
        }
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchSettings();
  }, [personaId, token]);

  const saveSettings = async () => {
    if (!personaId || !token) return;
    setLoading(true);

    // THE FIX: Payload must match the ALIASES in PersonaSchema.py
    const payload = {
      status_mode: settings.status_mode,
      max_tokens: settings.max_tokens,       // Alias for maxTokens
      temperature: settings.temperature,
      is_public: settings.is_public,
      daily_token_limit: settings.daily_token_limit, // Alias for dailyLimit
      supported_docs: settings.supported_docs
    };

    try {
      const endpoint = getUpdatePersonaSettingsEndpoint(personaId);

      // Use PATCH to match your backend router
      await axios.patch(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Settings updated successfully!");
    } catch (err: any) {
      console.error("Payload sent:", payload);
      const details = err.response?.data?.detail;
      console.error("422 Details:", details);

      if (Array.isArray(details)) {
        toast.error(`Field Error: ${details[0].loc[1]} - ${details[0].msg}`);
      } else {
        toast.error("Failed to save settings. Check browser console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const publicLink = `${currentOrigin}/p/public/${personaId}`;
  const embedCode = `<script src="${currentOrigin}/widget.js" data-id="${personaId}" defer></script>`;

  return (
    /* INCREASED WIDTH: max-w-6xl for much larger display area */
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto bg-white rounded-[40px] border border-gray-100 shadow-xl">

      <div className="flex justify-between items-center border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Persona Configuration</h2>
          <p className="text-base text-gray-400 font-medium">Manage behavior, limits, and deployment settings.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className={`w-3 h-3 rounded-full ${settings.is_public ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {settings.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Behavior Card */}
        <div className="space-y-8 p-10 bg-gray-50/50 rounded-[32px] border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200"><Zap size={24} /></div>
             <h3 className="text-xl font-bold text-gray-800">Model Behavior</h3>
           </div>

           <div className="space-y-3">
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Max Response Tokens</label>
             <input
               type="number"
               value={settings.max_tokens}
               onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value) || 0})}
               className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-black outline-none transition-all"
             />
           </div>

           <div className="space-y-4">
             <div className="flex justify-between items-end">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Temperature ({settings.temperature})</label>
             </div>
             <input
               type="range" min="0" max="1" step="0.1"
               value={settings.temperature}
               onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
               className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
             />
           </div>
        </div>

        {/* Security Card */}
        <div className="space-y-8 p-10 bg-gray-50/50 rounded-[32px] border border-gray-100">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200"><ShieldCheck size={24} /></div>
             <h3 className="text-xl font-bold text-gray-800">Usage Limits</h3>
           </div>

           <div className="space-y-3">
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Daily Token Limit</label>
             <input
               type="number"
               value={settings.daily_token_limit}
               onChange={(e) => setSettings({...settings, daily_token_limit: parseInt(e.target.value) || 0})}
               className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-black outline-none transition-all"
             />
             <div className="flex gap-2 items-center text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <Info size={16} />
                <p className="text-xs font-bold leading-tight">Safety quota per persona per 24 hours.</p>
             </div>
           </div>
        </div>

        {/* Document Support Section - SPANS FULL WIDTH */}
        <div className="lg:col-span-2 space-y-8 p-10 bg-gray-50/50 rounded-[32px] border border-gray-100">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200"><FileJson size={24} /></div>
             <h3 className="text-xl font-bold text-gray-800">Support Documents</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {['pdf', 'docx', 'txt', 'csv'].map((ext) => (
              <button
                key={ext}
                type="button"
                onClick={() => {
                  const updated = settings.supported_docs.includes(ext)
                    ? settings.supported_docs.filter(d => d !== ext)
                    : [...settings.supported_docs, ext];
                  setSettings({ ...settings, supported_docs: updated });
                }}
                className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-sm ${
                  settings.supported_docs.includes(ext)
                  ? 'bg-black text-white scale-105'
                  : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-300'
                }`}
              >
                .{ext.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sharing Section */}
      <div className="pt-10 border-t border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500 text-white rounded-[24px] shadow-lg shadow-emerald-100"><Share2 size={32} /></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Deployment & Sharing</h3>
              <p className="text-sm text-gray-400 font-medium">Enable public access to share your persona.</p>
            </div>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, is_public: !s.is_public }))}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ${settings.is_public ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${settings.is_public ? 'translate-x-11' : 'translate-x-1'}`} />
          </button>
        </div>

        {settings.is_public && (
          <div className="grid gap-8 animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-gray-50 rounded-[32px] border border-gray-100">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">Public Chat URL</label>
              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border-2 border-gray-50 shadow-sm">
                <Globe size={24} className="text-gray-300 ml-2" />
                <input readOnly value={publicLink} className="flex-1 bg-transparent text-lg font-bold text-indigo-600 outline-none" />
                <Button className="bg-gray-900 text-white px-8 h-14 rounded-xl font-bold hover:bg-black" onClick={() => { navigator.clipboard.writeText(publicLink); toast.success("Link Copied!"); }}>
                  COPY LINK
                </Button>
              </div>
            </div>

            <div className="p-10 bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 block">Website Widget Script</label>
              <div className="bg-black/40 p-8 rounded-2xl border border-white/5 backdrop-blur-md mb-8">
                <code className="text-sm text-emerald-400 font-mono break-all leading-relaxed">{embedCode}</code>
              </div>
              <Button className="w-full py-8 bg-white text-black hover:bg-gray-100 text-xl font-black rounded-2xl" onClick={() => { navigator.clipboard.writeText(embedCode); toast.success("Snippet Copied!"); }}>
                COPY WIDGET CODE
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FINAL SAVE BUTTON */}
      <div className="flex justify-end pt-10">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="group flex items-center gap-6 px-20 py-8 bg-black text-white text-2xl font-black rounded-[32px] shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} />}
          {loading ? 'SAVING...' : 'SAVE ALL SETTINGS'}
        </button>
      </div>
    </div>
  );
};

export default PersonaSettings;