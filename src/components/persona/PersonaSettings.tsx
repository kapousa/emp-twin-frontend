import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { getPersonaDetailsEndpoint, getUpdatePersonaSettingsEndpoint } from '@/configurations/api';
import { Save, Zap, ShieldCheck, Sliders, FileJson } from 'lucide-react';

const PersonaSettings = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    status_mode: 'normal',
    max_tokens: 500,
    temperature: 0.7,
    supported_docs: ['pdf', 'docx', 'txt'],
    daily_token_limit: 10000 // Default value
  });

  // ⭐️ FIXED: Loading logic now maps daily_token_limit from backend
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      if (!personaId || !token) return;
      try {
        const response = await axios.get(getPersonaDetailsEndpoint(personaId), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          console.log("Loaded from backend:", response.data);
          setSettings({
            status_mode: response.data.status_mode || 'normal',
            max_tokens: response.data.max_tokens || 500,
            temperature: response.data.temperature || 0.7,
            supported_docs: response.data.supported_docs || ['pdf', 'docx'],
            // ⭐️ This was the missing line:
            daily_token_limit: response.data.daily_token_limit || 10000
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    fetchCurrentSettings();
  }, [personaId, token]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // ⭐️ Cast all values to correct types for FastAPI (int/float/string)
      const payload = {
        status_mode: String(settings.status_mode),
        max_tokens: parseInt(String(settings.max_tokens), 10),
        temperature: parseFloat(String(settings.temperature)),
        supported_docs: settings.supported_docs,
        daily_token_limit: parseInt(String(settings.daily_token_limit), 10)
      };

      await axios.patch(getUpdatePersonaSettingsEndpoint(personaId!), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success("All settings saved!");
    } catch (err: any) {
      console.error("Save Error:", err.response?.data);
      toast.error("Failed to save. Check console for validation errors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Availability & Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Availability Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={20}/></div>
            <h4 className="font-bold text-gray-800">Persona Mode</h4>
          </div>
          <select
            className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            value={settings.status_mode}
            onChange={(e) => setSettings({...settings, status_mode: e.target.value})}
          >
            <option value="normal">Standard (Default)</option>
            <option value="meeting">Meeting (Concise)</option>
            <option value="vacation">Out of Office</option>
          </select>
        </div>

        {/* Token Limits Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Zap size={20}/></div>
            <h4 className="font-bold text-gray-800">Token Limits</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Max / Response</label>
              <input
                type="number"
                value={settings.max_tokens}
                onChange={(e) => setSettings({...settings, max_tokens: e.target.value})}
                className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Global</label>
              <input
                type="number"
                value={settings.daily_token_limit}
                onChange={(e) => setSettings({...settings, daily_token_limit: e.target.value})}
                className="w-full p-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-orange-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Creativity Slider Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Sliders size={20}/></div>
          <h4 className="font-bold text-gray-800">Response Style (Temperature)</h4>
        </div>
        <input
          type="range" min="0" max="1" step="0.1"
          value={settings.temperature}
          onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
          className="w-full h-2 bg-gray-100 rounded-lg accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-4 uppercase tracking-widest">
          <span>Precise</span>
          <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Level: {settings.temperature}</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Document Formats Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FileJson size={20}/></div>
          <h4 className="font-bold text-gray-800">Allowed Files</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {['pdf', 'docx', 'txt', 'csv', 'xlsx'].map((ext) => {
            const isActive = settings.supported_docs.includes(ext);
            return (
              <button
                key={ext}
                onClick={() => {
                  const docs = isActive
                    ? settings.supported_docs.filter(d => d !== ext)
                    : [...settings.supported_docs, ext];
                  setSettings({...settings, supported_docs: docs});
                }}
                className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
                  isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                }`}
              >
                .{ext.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 px-12 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black active:scale-[0.95] transition-all disabled:bg-gray-400"
        >
          {loading ? "Syncing..." : <><Save size={18}/> Save All Changes</>}
        </button>
      </div>
    </div>
  );
};

export default PersonaSettings;