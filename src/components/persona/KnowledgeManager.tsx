import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthProvider';
import { KnowledgeResource } from '../../types/knowledge';
import {
  getKnowledgeResourcesEndpoint,
  getReprocessKnowledgeEndpoint,
  getDeleteKnowledgeEndpoint
} from '@/configurations/api';
import KnowledgeTable from '../KnowledgeTable';
import AddResourceModal from '../AddResourceModal';
import { toast } from 'react-hot-toast';

interface KnowledgeManagerProps {
  personaId: string;
}

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ personaId }) => {
  const { token } = useAuth();
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchKnowledge = useCallback(async () => {
    if (!personaId || !token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(getKnowledgeResourcesEndpoint(personaId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKnowledgeList(response.data);
    } catch (error) {
      toast.error("Failed to load knowledge library.");
    } finally {
      setIsLoading(false);
    }
  }, [personaId, token]);

  useEffect(() => { fetchKnowledge(); }, [fetchKnowledge]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await axios.delete(getDeleteKnowledgeEndpoint(personaId, id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Resource removed.");
      fetchKnowledge();
    } catch (err) { toast.error("Delete failed."); }
  };

  const handleReprocess = async (id: string) => {
    try {
      await axios.post(getReprocessKnowledgeEndpoint(personaId, id), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Reprocessing started...");
      fetchKnowledge();
    } catch (err) { toast.error("Reprocess failed."); }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Knowledge Library</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
        >
          + Add New Resource
        </button>
      </div>

      <KnowledgeTable
        knowledgeList={knowledgeList}
        onAction={{
          delete: handleDelete,
          reprocess: handleReprocess,
          replace: () => setIsModalOpen(true),
          viewDetails: (id) => console.log(id)
        }}
      />

      <AddResourceModal
        personaId={personaId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchKnowledge}
      />
    </div>
  );
};

export default KnowledgeManager;