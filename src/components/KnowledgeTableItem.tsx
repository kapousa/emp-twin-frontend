// src/components/KnowledgeTableItem.tsx

import React, { useRef } from 'react';
import { KnowledgeResource, KnowledgeFileStatus } from '../types/knowledge';

interface KnowledgeTableItemProps {
  resource: KnowledgeResource;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onViewDetails: (resource: KnowledgeResource) => void;
}

// Simple Status Badge Component
const StatusBadge: React.FC<{ status: KnowledgeFileStatus }> = ({ status }) => {
  const statusColors: { [key in KnowledgeFileStatus]: string } = {
    PROCESSED: 'text-green-600 bg-green-100',
    PROCESSING: 'text-blue-600 bg-blue-100',
    PENDING: 'text-yellow-600 bg-yellow-100',
    FAILED: 'text-red-600 bg-red-100',
    DELETING: 'text-gray-600 bg-gray-100',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>{status}</span>;
};

const KnowledgeTableItem: React.FC<KnowledgeTableItemProps> = ({
  resource,
  onDelete,
  onReprocess,
  onReplace,
  onViewDetails,
}) => {
  const isActionDisabled = resource.status === 'PROCESSING' || resource.status === 'DELETING';

  // ⭐️ FIX: Safely access resource.type with a check (?. is best practice, but a full check works too)
  // Ensure resource.type is a string before calling .includes()
  const resourceType = resource.type || ''; // Fallback to empty string if null/undefined

  const isIntegration = 
    resourceType.includes('GMAIL') || 
    resourceType === 'WEBSITE' || 
    resourceType.includes('DRIVE') ||
    resourceType.includes('NOTION'); // Added NOTION for completeness

  const showReprocessRefresh = resource.status === 'FAILED' || isIntegration;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onReplace(resource.id, event.target.files[0]);
    }
  };

  return (
    <tr key={resource.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{resource.name}</td>
      <td className="p-4">{resource.type}</td>
      <td className="p-4"><StatusBadge status={resource.status} /></td>
      {/* Ensure last_updated_at is not null before creating Date object */}
      <td className="p-4">{resource.last_updated_at ? new Date(resource.last_updated_at).toLocaleDateString() : 'N/A'}</td>
      <td className="p-4">{resource.chunk_count}</td>
      <td className="p-4 space-x-2 flex items-center">
        <button onClick={() => onViewDetails(resource)} className="text-blue-500 hover:text-blue-700">View</button>

        {showReprocessRefresh && (
          <button
            onClick={() => onReprocess(resource.id)}
            disabled={isActionDisabled}
            className={`text-sm ${isActionDisabled ? 'text-gray-400' : 'text-purple-500 hover:text-purple-700'}`}
          >
            {isIntegration ? 'Refresh' : 'Reprocess'}
          </button>
        )}
        
        {/* Replace is only available for direct file uploads (not integrations or raw text) */}
        {!isIntegration && resource.type !== 'TEXT' && (
            <>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    // Note: In a real app, you might restrict to the original file type
                    disabled={isActionDisabled}
                />
                <button 
                    onClick={handleReplaceClick} 
                    disabled={isActionDisabled}
                    className={`text-sm ${isActionDisabled ? 'text-gray-400' : 'text-yellow-600 hover:text-yellow-800'}`}
                >
                    Replace
                </button>
            </>
        )}

        <button
          onClick={() => onDelete(resource.id)}
          disabled={isActionDisabled}
          className={`text-sm ${isActionDisabled ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default KnowledgeTableItem;