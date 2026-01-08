// src/components/AddResourceModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthProvider';
import {
  getUploadKnowledgeEndpoint,
  getCrawlWebsiteEndpoint,
  getGoogleDriveInitiateEndpoint,
  getGmailInitiateEndpoint
} from '@/configurations/api';
import { toast } from 'react-hot-toast';

interface AddResourceModalProps {
  personaId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ personaId, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'upload' | 'integration' | 'website'>('upload');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async () => {
    if (!fileToUpload || !token) return;
    setIsLoading(true);
    const endpoint = getUploadKnowledgeEndpoint(personaId);

    const formData = new FormData();
    formData.append('files', fileToUpload);

    try {
      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success("File uploaded successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    } finally {
      setIsLoading(false);
    }
  };

const handleWebsiteCrawl = async () => {
  if (!websiteUrl || !token) return;
  setIsLoading(true);
  const endpoint = getCrawlWebsiteEndpoint(personaId);

  try {
    // CHANGE THIS LINE: Change 'url' to 'start_url'
    await axios.post(endpoint, { start_url: websiteUrl }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    toast.success("Crawl started!");
    onSuccess();
    onClose();
  } catch (error) {
    toast.error("Failed to start crawl.");
  } finally {
    setIsLoading(false);
  }
};

  // ⭐️ UPDATED: Logic for Google Drive and Gmail Integration
  const handleIntegration = async (type: 'gmail' | 'google_drive' | 'notion') => {
    if (!token) return;
    setIsLoading(true);

    try {
        let endpoint = "";
        if (type === 'google_drive') {
            endpoint = getGoogleDriveInitiateEndpoint(personaId);
        } else if (type === 'gmail') {
            // Reusing the same service logic for Gmail
            endpoint = getGmailInitiateEndpoint(personaId);
        }

        if (endpoint) {
            const response = await axios.post(endpoint, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const { auth_url } = response.data;
            if (auth_url) {
                // Redirect to Google Consent Screen
                window.location.href = auth_url;
            }
        } else {
            toast.error(`${type} integration not implemented yet.`);
        }
    } catch (error) {
        console.error("Integration Error:", error);
        toast.error("Failed to connect to service.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">Add Knowledge Resource</h2>

            <div className="flex border-b mb-4">
                <button onClick={() => setSelectedTab('upload')} className={`flex-1 py-2 ${selectedTab === 'upload' ? 'border-b-2 border-blue-500 font-bold' : ''}`}>Upload</button>
                <button onClick={() => setSelectedTab('website')} className={`flex-1 py-2 ${selectedTab === 'website' ? 'border-b-2 border-blue-500 font-bold' : ''}`}>Website</button>
                <button onClick={() => setSelectedTab('integration')} className={`flex-1 py-2 ${selectedTab === 'integration' ? 'border-b-2 border-blue-500 font-bold' : ''}`}>Integrations</button>
            </div>

            {selectedTab === 'upload' && (
                <div className="space-y-4">
                    <input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
                    <button onClick={handleFileUpload} disabled={!fileToUpload || isLoading} className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400">
                        {isLoading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            )}

            {selectedTab === 'website' && (
                <div className="space-y-4">
                    <input type="text" placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full border p-2 rounded" />
                    <button onClick={handleWebsiteCrawl} disabled={!websiteUrl || isLoading} className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400">
                        {isLoading ? 'Crawling...' : 'Crawl Website'}
                    </button>
                </div>
            )}

            {selectedTab === 'integration' && (
                <div className="border p-4 rounded bg-gray-50 space-y-3">
                    <p className="text-sm text-gray-600">Sync data automatically from your cloud accounts.</p>
                    <button onClick={() => handleIntegration('gmail')} disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isLoading ? 'Connecting...' : 'Connect Gmail'}
                    </button>
                    <button onClick={() => handleIntegration('google_drive')} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isLoading ? 'Connecting...' : 'Connect Google Drive'}
                    </button>
                    <button onClick={() => handleIntegration('notion')} disabled={isLoading} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                        Connect Notion
                    </button>
                </div>
            )}

            <button onClick={onClose} className="mt-6 w-full text-gray-500 hover:underline">Cancel</button>
        </div>
    </div>
  );
};

export default AddResourceModal;