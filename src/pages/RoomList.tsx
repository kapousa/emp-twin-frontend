import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, MessageSquare, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ROOM_LIST_ENDPOINT, getRoomDeleteEndpoint } from '@/configurations/api';
import { useAuth } from '@/contexts/AuthProvider';

const RoomList = () => {
  const { token, logout } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  };

const fetchRooms = async () => {
    if (!token) return; // Don't fetch if no token

    setLoading(true);
    try {
      const res = await axios.get(ROOM_LIST_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` } // 3. Use token from hook
      });
      setRooms(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout(); // 4. Handle expired tokens like PersonaList does
        navigate('/login');
      }
      toast.error("Failed to load boardrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [token]);
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Are you sure you want to disband this boardroom?")) return;

    try {
      await axios.delete(getRoomDeleteEndpoint(roomId), authHeader);
      toast.success("Boardroom deleted");
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-[#E11D48]" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Boardrooms</h1>
          <p className="text-gray-400 font-medium mt-1">Manage your multi-agent strategy sessions.</p>
        </div>
        <Link
          to="/room/create"
          className="flex items-center gap-2 px-6 py-3 bg-[#E11D48] text-white font-black rounded-xl shadow-lg shadow-red-100 hover:scale-105 transition-all"
        >
          <Plus size={20} /> New Boardroom
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="inline-flex p-6 bg-red-50 rounded-full mb-4">
            <Users className="text-[#E11D48]" size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900">No Boardrooms Yet</h3>
          <p className="text-gray-400 max-w-xs mx-auto mt-2 mb-8">
            Create a room to let your AI specialists discuss your projects together.
          </p>
          <Link to="/room/create" className="text-[#E11D48] font-black uppercase tracking-widest text-xs hover:underline">
            Initialize your first board →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/room/${room.id}/start`}
              className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white transition-colors">
                  <MessageSquare size={24} />
                </div>
                <button
                  onClick={(e) => handleDelete(e, room.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{room.room_name}</h3>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white" />
                  ))}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   Specialists Active
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                  Created {new Date(room.created_at).toLocaleDateString()}
                </span>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-[#E11D48] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;