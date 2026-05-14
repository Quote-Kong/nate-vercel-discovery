import React, { useState } from 'react';
import { ProjectTypeData } from '../ProjectDiscoverySettings';

interface ProjectTypesConfigListProps {
  companyId: number;
  projectTypes: ProjectTypeData[];
  onChange: (types: ProjectTypeData[]) => void;
}

const ProjectTypesConfigList: React.FC<ProjectTypesConfigListProps> = ({ companyId, projectTypes, onChange }) => {
  const [newProjectTypeName, setNewProjectTypeName] = useState('');
  const [newSubAreas, setNewSubAreas] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubAreas, setEditSubAreas] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTypeName.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/discovery-config/${companyId}/project-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ProjectTypeName: newProjectTypeName.trim(),
          SubAreas: newSubAreas.trim() 
        })
      });
      const newType = await response.json();
      onChange([...projectTypes, newType]);
      setNewProjectTypeName('');
      setNewSubAreas('');
    } catch (error) {
      console.error("Failed to add project type", error);
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (type: ProjectTypeData) => {
    setEditingId(type.ProjectTypeID);
    setEditName(type.ProjectTypeName);
    setEditSubAreas(type.SubAreas || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditSubAreas('');
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const updates = { ProjectTypeName: editName.trim(), SubAreas: editSubAreas.trim() };
      await fetch(`/api/admin/discovery-config/${companyId}/project-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      onChange(projectTypes.map(p => p.ProjectTypeID === id ? { ...p, ...updates } : p));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update project type", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/discovery-config/${companyId}/project-types/${id}`, {
        method: 'DELETE'
      });
      onChange(projectTypes.filter(p => p.ProjectTypeID !== id));
    } catch (error) {
      console.error("Failed to delete project type", error);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Project Types Management</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage the project types clients can select in the Lead Magnet. Note: Deleting a project type will also remove its associated configuration.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={newProjectTypeName}
              onChange={e => setNewProjectTypeName(e.target.value)}
              placeholder="e.g., Basement Finishing"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              value={newSubAreas}
              onChange={e => setNewSubAreas(e.target.value)}
              placeholder="Sub areas (comma-separated, optional)"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newProjectTypeName.trim()}
            className="px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:bg-blue-400 mt-2 sm:mt-0"
          >
            {isAdding ? 'Adding...' : 'Add Project Type'}
          </button>
        </form>

        <div className="space-y-3">
          {projectTypes.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">No project types configured. Add one above.</div>
          ) : (
            projectTypes.map((type) => (
              <div key={type.ProjectTypeID} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded gap-4">
                {editingId === type.ProjectTypeID ? (
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded w-full"
                      placeholder="Project Name"
                    />
                    <input 
                      type="text" 
                      value={editSubAreas}
                      onChange={e => setEditSubAreas(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm w-full"
                      placeholder="Sub areas (comma-separated)"
                    />
                    <div className="flex gap-2">
                       <button onClick={() => handleSaveEdit(type.ProjectTypeID)} className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline">Save</button>
                       <button onClick={cancelEditing} className="text-slate-500 dark:text-slate-400 font-semibold text-sm hover:underline">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{type.ProjectTypeName}</span>
                      {type.SubAreas && (
                        <span className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sub areas: {type.SubAreas}</span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditing(type)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-300 text-sm font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(type.ProjectTypeID)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default ProjectTypesConfigList;
