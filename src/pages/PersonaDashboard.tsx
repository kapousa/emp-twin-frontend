import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthProvider';
import { getPersonaDetailsEndpoint } from '@/configurations/api';
import { Database, Settings, ChevronLeft, User } from 'lucide-react';
import KnowledgeManager from '@/components/persona/KnowledgeManager';
import PersonaSettings from '@/components/persona/PersonaSettings';

const PersonaDashboard = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'knowledge' | 'settings'>('knowledge');
  const [persona, setPersona] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!personaId || !token) return;
      try {
        const res = await axios.get(getPersonaDetailsEndpoint(personaId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPersona(res.data);
      } catch (err) {
        console.error("Error fetching persona details:", err);
      }
    };
    fetchDetails();
  }, [personaId, token]);

  // Determine the avatar source
  const avatarSource = persona?.avatarPath || persona?.avatar;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Link to="/persona/list" className="flex items-center text-red-600 mb-6 hover:underline font-medium">
        <ChevronLeft size={18} /> Back to Personas
      </Link>

      {/* ⭐️ Updated Header with Avatar Support */}
      <header className="mb-8 flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          {avatarSource ? (
            <img
              src={avatarSource}
              alt={persona?.persona_name}
              className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-md">
              {persona?.persona_name?.charAt(0) || <User size={32} />}
            </div>
          )}
          {/* Status Dot */}
          <span className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full ${persona?.status === 'ready' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {persona?.persona_name || "Loading..."}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="px-2 py-0.5 bg-indigo-100 text-red-600 text-xs font-bold rounded uppercase tracking-wider">
               {persona?.persona_role || "Persona"}
             </span>
             <span className="text-gray-400 text-sm">•</span>
             <p className="text-gray-500 text-sm font-medium">Dashboard & Controls</p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8">
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`pb-4 px-2 flex items-center gap-2 font-bold transition-all ${
            activeTab === 'knowledge' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Database size={18} /> Knowledge Base
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 flex items-center gap-2 font-bold transition-all ${
            activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Settings size={18} /> Behavior Settings
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'knowledge' ? (
          <KnowledgeManager personaId={personaId!} />
        ) : (
          <PersonaSettings />
        )}
      </div>
    </div>
  );
};

export default PersonaDashboard;