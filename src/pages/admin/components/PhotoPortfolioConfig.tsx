import React, { useState, useEffect } from 'react';

export interface PhotoPortfolioConfigProps {
  companyId: number;
  projectTypeId: number;
}

export interface PhotoData {
  CompanyDiscoveryPhotoID: number;
  PhotoURL: string;
}

const PhotoPortfolioConfig: React.FC<PhotoPortfolioConfigProps> = ({ companyId, projectTypeId }) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discovery-config/${companyId}/photos/${projectTypeId}`);
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error("Failed to load photos", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, [companyId, projectTypeId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/discovery-config/${companyId}/photos/${projectTypeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PhotoURL: newPhotoUrl.trim() })
      });
      const newPhoto = await response.json();
      setPhotos([...photos, newPhoto]);
      setNewPhotoUrl('');
    } catch (error) {
      console.error("Failed to add photo", error);
    } finally {
        setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/discovery-config/${companyId}/photos/${projectTypeId}/${id}`, {
        method: 'DELETE'
      });
      setPhotos(photos.filter(p => p.CompanyDiscoveryPhotoID !== id));
    } catch (error) {
      console.error("Failed to delete photo", error);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading photo portfolio...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Photo Portfolio</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Upload and manage photos for the Style Board interaction for this project type.</p>
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={newPhotoUrl}
            onChange={e => setNewPhotoUrl(e.target.value)}
            placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isAdding || !newPhotoUrl.trim()}
            className="px-5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer disabled:bg-blue-400"
          >
            {isAdding ? 'Adding...' : 'Add Photo'}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              No photos configured. Add an image URL above.
            </div>
          ) : (
            photos.map((photo) => (
              <div key={photo.CompanyDiscoveryPhotoID} className="group relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/50 aspect-video">
                <img src={photo.PhotoURL} alt="Portfolio" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.CompanyDiscoveryPhotoID)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded shadow-sm transition-colors cursor-pointer"
                  >
                    Delete Photo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default PhotoPortfolioConfig;
