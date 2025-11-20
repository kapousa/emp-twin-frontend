// src/pages/KnowledgeListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';
// --- Custom Imports ---
import { useAuth } from '@/contexts/AuthProvider'; 
import { KnowledgeResource } from '../types/knowledge'; // Removed KnowledgeFileType import as it's unused
// ⭐️ Only import necessary endpoint and remove getFullApiUrl
import { getKnowledgeResourcesEndpoint, getReprocessKnowledgeEndpoint, getDeleteKnowledgeEndpoint, getUploadKnowledgeEndpoint } from '@/configurations/api';
import KnowledgeTable from '../components/KnowledgeTable';
import AddResourceModal from '../components/AddResourceModal';
// Removed unused Checkbox import

// ⭐️ RECOMMENDED: Initialize axios with the base URL once (ideally in a separate config file)
// For this fix, we'll assume `axios` is configured globally or that the
// backend API is accessible via a relative path from the current domain.

const KnowledgeListPage: React.FC = () => {
  const { personaId } = useParams<{ personaId: string }>(); 
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersonaName] = useState("Hatem Gad"); 
  const { token } = useAuth(); // Removed unused 'user' property

  
  // 1. Fetch Data Function (Authenticated)
  const fetchKnowledge = useCallback(async () => {
    if (!personaId || !token) {
        setIsLoading(false);
        console.warn("Authentication token or Persona ID is missing. Cannot fetch resources.");
        return; 
    }
    
    setIsLoading(true);
    
    try {
      // ⭐️ FIX: Get the relative path/endpoint directly. We rely on Axios/browser environment
      // to handle the base URL implicitly or through global configuration.
      const endpoint = getKnowledgeResourcesEndpoint(personaId); 

      // ⭐️ Use the 'endpoint' (relative path) in the axios request
      const response = await axios.get<KnowledgeResource[]>(
        endpoint,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      // Filter the response to exclude 'TEXT' files
      const filteredData = response.data.filter(
        (r) => r.type !== 'TEXT'
      );

      setKnowledgeList(filteredData);

    } catch (error) {
      console.error("Failed to fetch knowledge list:", error);
      // Display error notification
    } finally {
      setIsLoading(false);
    }
  }, [personaId, token]); 

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  // 2. Action Handlers (Authenticated)
  
  // ⭐️ NOTE: We need a way to get the full URL for the other actions
  // (delete, reprocess, replace) since they are using getFullApiUrl.
  // If you want to eliminate getFullApiUrl entirely, you must adapt these.
  // Assuming, for now, that only the main fetch was problematic:
  
  const handleDelete = async (resourceId: string) => {
    if (window.confirm("Are you sure you want to delete this resource? This will permanently remove all associated knowledge.")) {
      try {
        // We will assume for now that direct endpoint works or you have another way to get the full URL
        const deleteEndpoint = getDeleteKnowledgeEndpoint(personaId!, resourceId);

        // Optimistically update status to show 'DELETING'
        setKnowledgeList(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'DELETING', message: 'Deletion in progress...' } : r));

        await axios.delete(deleteEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Final optimistic update: remove item from list 
        setKnowledgeList(prev => prev.filter(r => r.id !== resourceId));

      } catch (error) {
        alert("Failed to delete resource. Please try again.");
        fetchKnowledge(); // Re-fetch to revert the status update on failure
      }
    }
  };

  const handleReprocess = async (resourceId: string) => {
    try {
      const reprocessEndpoint = getReprocessKnowledgeEndpoint(personaId!, resourceId);

      // Optimistic update status to show 'PENDING'
      setKnowledgeList(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'PENDING', message: 'Reprocessing initiated.' } : r));
      
      await axios.post(reprocessEndpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
    } catch (error) {
      alert("Failed to reprocess resource.");
      fetchKnowledge();
    }
  };
  
  const handleReplace = async (resourceId: string, file: File) => {
    try {
      const uploadEndpoint = getUploadKnowledgeEndpoint(personaId!);
      const formData = new FormData();
      formData.append('files', file);

      // Optimistic update status to show 'PROCESSING'
      setKnowledgeList(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'PROCESSING', name: file.name, message: 'Replacing content...' } : r));

      await axios.post(uploadEndpoint, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${token}` 
        },
      });

      alert(`Successfully submitted replacement for ${file.name}. Processing in background.`);
      
    } catch (error) {
      alert("Failed to replace resource. Please re-check file type.");
      fetchKnowledge(); // Re-fetch on failure
    }
  };

  const handleViewDetails = (resource: KnowledgeResource) => {
    alert(
        `Resource Details:\n` +
        `Name: ${resource.name}\n` +
        `Type: ${resource.type}\n` +
        `Status: ${resource.status}\n` +
        `Chunks: ${resource.chunk_count}\n` +
        `Last Updated: ${resource.last_updated_at ? new Date(resource.last_updated_at).toLocaleString() : 'N/A'}\n` +
        `Message: ${resource.message || 'N/A'}\n` +
        (resource.error_details ? `Error: ${resource.error_details}` : '')
    );
  };

  if (!personaId) {
    return <div className="p-4 text-red-600">Error: Persona ID not provided.</div>;
  }
  
  if (!token) {
    return <div className="p-4 text-red-600">Authentication Required. Please log in.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{selectedPersonaName}'s Knowledge Base 🧠</h1>
        <p className="text-sm text-gray-500 mt-1">Home &gt; Your Digital Copies &gt; {selectedPersonaName} &gt; Knowledge Base</p>
      </header>
      
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md"
        >
          + Add New Resource
        </button>
      </div>

      <div className="content-area">
        {isLoading && knowledgeList.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-600">Loading knowledge resources...</p>
          </div>
        ) : (
          <KnowledgeTable
            knowledgeList={knowledgeList}
            onAction={{
              delete: handleDelete,
              reprocess: handleReprocess,
              replace: handleReplace,
              viewDetails: handleViewDetails,
            }}
          />
        )}
      </div>

      <AddResourceModal 
        personaId={personaId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchKnowledge} // Refresh the list after successful modal action
      />
    </div>
  );
};

export default KnowledgeListPage;