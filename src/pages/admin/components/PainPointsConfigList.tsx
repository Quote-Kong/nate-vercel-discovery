import React, { useState, useEffect } from 'react';

export interface PainPointsConfigListProps {
  companyId: number;
  projectTypeId: number;
}

export interface PainPointOption {
  PainPointOptionID: number;
  PainPointText: string;
}

const PainPointsConfigList: React.FC<PainPointsConfigListProps> = ({ companyId, projectTypeId }) => {
  const [painPoints, setPainPoints] = useState<PainPointOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPainPointText, setNewPainPointText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchPainPoints = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discovery-config/${companyId}/pain-points/${projectTypeId}`);
        const data = await response.json();
        setPainPoints(data);
      } catch (error) {
        console.error("Failed to load pain points", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPainPoints();
  }, [companyId, projectTypeId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPainPointText.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/discovery-config/${companyId}/pain-points/${projectTypeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PainPointText: newPainPointText.trim() })
      });
      const newPoint = await response.json();
      setPainPoints([...painPoints, newPoint]);
      setNewPainPointText('');
    } catch (error) {
      console.error("Failed to add pain point", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/discovery-config/${companyId}/pain-points/${projectTypeId}/${id}`, {
        method: 'DELETE'
      });
      setPainPoints(painPoints.filter(p => p.PainPointOptionID !== id));
    } catch (error) {
      console.error("Failed to delete pain point", error);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading pain points...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Pain Points Configuration</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage the list of common issues clients select from for this project type.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newPainPointText}
            onChange={e => setNewPainPointText(e.target.value)}
            placeholder="e.g., Not enough cabinet space"
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isAdding || !newPainPointText.trim()}
            className="px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:bg-blue-400"
          >
            {isAdding ? 'Adding...' : 'Add Pain Point'}
          </button>
        </form>

        <div className="space-y-2">
          {painPoints.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">No pain points configured. Add one above.</div>
          ) : (
            painPoints.map((point) => (
              <div key={point.PainPointOptionID} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{point.PainPointText}</span>
                <button
                  onClick={() => handleDelete(point.PainPointOptionID)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default PainPointsConfigList;
