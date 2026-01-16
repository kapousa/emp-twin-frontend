import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, FileText, UserCheck, ArrowLeft, Shield } from 'lucide-react';
import axios from 'axios';
import {useAuth} from "@/contexts/AuthProvider.tsx";
import {getRoomDetailsEndpoint} from "@/configurations/api.ts";


const RoomDetails = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState<any>(null);
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true); // or false

  useEffect(() => {
  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(getRoomDetailsEndpoint(roomId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(res.data);
    } catch (err) {
      toast.error("Could not load boardroom details");
    } finally {
      setLoading(false);
    }
  };

  if (roomId && token) {
    fetchRoomDetails();
  }
}, [roomId, token]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-sm mb-8">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="space-y-8">
        {/* Title & Objective */}
        <section className="bg-white p-8 rounded-[32px] border shadow-sm">
          <div className="flex items-center gap-3 text-[#E11D48] mb-4">
            <Target size={24} />
            <h2 className="font-black uppercase tracking-widest text-xs">Primary Objective</h2>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{room?.room_name}</h1>
          <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl">
            {room?.topic || "No objective defined for this boardroom."}
          </p>
        </section>
        <button
  onClick={() => navigate(`/room/${roomId}/chat`)}
  className="w-full py-6 bg-[#E11D48] text-white rounded-[32px] font-black flex items-center justify-center gap-3 shadow-xl shadow-red-100 hover:scale-[1.02] transition-all"
>
  <Play size={20} fill="currentColor" />
  START SESSION
</button>
        {/* Assigned Experts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[32px] border shadow-sm">
            <div className="flex items-center gap-3 text-blue-600 mb-6">
              <UserCheck size={20} />
              <h2 className="font-black uppercase tracking-widest text-xs">The Board</h2>
            </div>
            <div className="space-y-4">
              {room?.members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold">
                    {m.persona_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black">{m.persona_name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{m.persona_role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="bg-white p-8 rounded-[32px] border shadow-sm">
            <div className="flex items-center gap-3 text-orange-600 mb-6">
              <FileText size={20} />
              <h2 className="font-black uppercase tracking-widest text-xs">Resources</h2>
            </div>
            <div className="text-center py-10">
              <Shield className="mx-auto text-gray-200 mb-2" size={32} />
              <p className="text-xs font-bold text-gray-400 italic">Security protected documents</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoomDetails;