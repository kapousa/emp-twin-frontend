// src/components/AddResourceModal.tsx

import React, { useState } from 'react';
import axios from 'axios'; // ⭐️ Import axios
import { useAuth } from '@/contexts/AuthProvider'; // ⭐️ Import Auth Context
// ⭐️ Import the necessary API helpers
import { getUploadKnowledgeEndpoint, getCrawlWebsiteEndpoint, getFullApiUrl } from '@/configurations/api'; 

interface AddResourceModalProps {
  personaId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ personaId, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth(); // ⭐️ Get the authentication token
  const [selectedTab, setSelectedTab] = useState<'upload' | 'integration' | 'website'>('upload');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async () => {
    if (!fileToUpload || !token) return;
    setIsLoading(true);
    
    // ⭐️ FIX 1: Construct the full, absolute URL using the helper
    const endpoint = getUploadKnowledgeEndpoint(personaId);
    //const fullUrl = getFullApiUrl(endpoint); 
    
    const formData = new FormData();
    formData.append('files', fileToUpload);

    try {
      // ⭐️ FIX 2: Use axios instead of native fetch, and include Auth header
      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}`, // 🔑 CRITICAL: Add the token
        },
      });

      onSuccess();
      onClose();
      alert('File upload initiated. Status will update shortly.');
      
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload resource. Check console for details.');
    } finally {
      setIsLoading(false);
      setFileToUpload(null);
    }
  };
  
  const handleWebsiteCrawl = async () => {
    if (!websiteUrl || !token) return;
    setIsLoading(true);
    
    // ⭐️ FIX 1: Construct the full, absolute URL using the helper
    const endpoint = getCrawlWebsiteEndpoint(personaId);
    // const fullUrl = getFullApiUrl(endpoint);
    
    try {
        // ⭐️ FIX 2: Use axios instead of native fetch, and include Auth header
        await axios.post(endpoint, 
            { start_url: websiteUrl, name: `Crawl: ${websiteUrl}` }, // Request Body
            {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // 🔑 CRITICAL: Add the token
                },
            }
        );

        onSuccess();
        onClose();
        alert('Website crawl initiated. Check the list for status updates.');
        
    } catch (error) {
        console.error('Crawl Error:', error);
        alert('Failed to initiate website crawl. Check console for details.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleIntegration = (service: string) => {
    // This part is unchanged as it's a placeholder
    alert(`Initiating OAuth flow for ${service}. Please check the console for the next step (API call to backend needed).`);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-1/3 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Add New Knowledge Resource</h2>
        
        <div className="flex border-b mb-4">
          <button 
            onClick={() => setSelectedTab('upload')} 
            className={`py-2 px-4 ${selectedTab === 'upload' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
            disabled={isLoading}
          >
            File Upload
          </button>
          <button 
            onClick={() => setSelectedTab('website')} 
            className={`py-2 px-4 ${selectedTab === 'website' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
            disabled={isLoading}
          >
            Web Crawler
          </button>
          <button 
            onClick={() => setSelectedTab('integration')} 
            className={`py-2 px-4 ${selectedTab === 'integration' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
            disabled={isLoading}
          >
            Integrations
          </button>
        </div>

        {/* --- Tab Panels --- */}
        <div className="space-y-4">
            {selectedTab === 'upload' && (
            <div className="border p-4 rounded bg-gray-50 space-y-3">
                <p className="text-sm text-gray-600">Upload files (PDF, DOCX, CSV, HTML) to enrich this persona.</p>
                <input type="file" onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500"/>
                <button 
                    onClick={handleFileUpload} 
                    disabled={!fileToUpload || isLoading || !token}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                >
                    {isLoading ? 'Uploading...' : 'Start Ingestion'}
                </button>
            </div>
            )}

            {selectedTab === 'website' && (
                <div className="border p-4 rounded bg-gray-50 space-y-3">
                    <p className="text-sm text-gray-600">Start a recursive crawl of a website's content.</p>
                    <input 
                        type="url" 
                        placeholder="https://example.com/docs"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <button 
                        onClick={handleWebsiteCrawl} 
                        disabled={!websiteUrl || isLoading || !token}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                    >
                        {isLoading ? 'Crawling...' : 'Crawl Website'}
                    </button>
                </div>
            )}

            {selectedTab === 'integration' && (
            <div className="border p-4 rounded bg-gray-50 space-y-3">
                <p className="text-sm text-gray-600">Connect to external services for continuous data synchronization.</p>
                <button onClick={() => handleIntegration('gmail')} disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">Connect Gmail</button>
                <button onClick={() => handleIntegration('google_drive')} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">Connect Google Drive</button>
                <button onClick={() => handleIntegration('notion')} disabled={isLoading} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">Connect Notion</button>
            </div>
            )}
        </div>

        <button onClick={onClose} className="mt-6 w-full text-gray-500 hover:text-gray-700">Close</button>
      </div>
    </div>
  );
};

export default AddResourceModal;