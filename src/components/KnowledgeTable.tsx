// src/components/KnowledgeTable.tsx

import React from 'react';
import KnowledgeTableItem from './KnowledgeTableItem';
import { KnowledgeResource } from '../types/knowledge';

interface KnowledgeTableProps {
  knowledgeList: KnowledgeResource[];
  onAction: {
    delete: (id: string) => void;
    reprocess: (id: string) => void;
    replace: (id: string, file: File) => void;
    viewDetails: (resource: KnowledgeResource) => void;
  };
}

const KnowledgeTable: React.FC<KnowledgeTableProps> = ({ knowledgeList, onAction }) => {
  if (knowledgeList.length === 0) {
    return <p className="p-4 text-gray-500">This persona does not have any knowledge resources yet. Click "Add Resource" to begin!</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chunks</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {knowledgeList.map((resource) => (
            <KnowledgeTableItem
              key={resource.id}
              resource={resource}
              onDelete={onAction.delete}
              onReprocess={onAction.reprocess}
              onReplace={onAction.replace}
              onViewDetails={onAction.viewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KnowledgeTable;