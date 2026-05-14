import React, { useState, useEffect } from 'react';

export interface StoryConfigFormProps {
  companyId: number;
  projectTypeId: number;
}

export interface StoryConfig {
  StoryText: string;
  AuthorName?: string;
  AuthorPhotoUrl?: string;
  RenovationPhotoUrl?: string;
}

const StoryConfigForm: React.FC<StoryConfigFormProps> = ({ companyId, projectTypeId }) => {
  const [stories, setStories] = useState<StoryConfig[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discovery-config/${companyId}/story/${projectTypeId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setStories(data);
        } else if (data && data.StoryText) {
          // Fallback legacy format
          setStories([data]);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Failed to load story config", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [companyId, projectTypeId]);

  const updateStory = (index: number, key: keyof StoryConfig, value: string) => {
    const newStories = [...stories];
    newStories[index] = { ...newStories[index], [key]: value };
    setStories(newStories);
  };

  const addStory = () => {
    setStories([...stories, { StoryText: '', AuthorName: '', AuthorPhotoUrl: '', RenovationPhotoUrl: '' }]);
  };

  const removeStory = (index: number) => {
    const newStories = [...stories];
    newStories.splice(index, 1);
    setStories(newStories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setIsSaving(true);
    
    // Filter out empty stories before saving
    const validStories = stories.filter(s => s.StoryText && s.StoryText.trim() !== '');

    try {
      await fetch(`/api/admin/discovery-config/${companyId}/story/${projectTypeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validStories)
      });
      setStories(validStories);
      setSaveStatus({ type: 'success', message: 'Stories updated successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to update stories.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading story settings...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Homeowner Stories (Optional)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Provide stories or testimonials from previous homeowners about their experience.</p>
        </div>
        <button type="button" onClick={addStory} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-sm rounded hover:bg-blue-100 dark:bg-blue-900/60">
          + Add Testimonial
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {stories.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            No testimonials yet. Click "Add Testimonial" to create one.
          </div>
        )}

        {stories.map((story, index) => (
          <div key={index} className="space-y-4 pt-6 first:pt-0 border-t first:border-0 border-slate-200 dark:border-slate-700 relative">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded -mx-2">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm px-2">Testimonial {index + 1}</h4>
              <button type="button" onClick={() => removeStory(index)} className="text-red-500 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded">
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Homeowner Name</label>
                <input 
                  type="text"
                  value={story.AuthorName || ''} 
                  onChange={e => updateStory(index, 'AuthorName', e.target.value)} 
                  placeholder="e.g. 'Sarah & John'"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Homeowner Photo URL</label>
                <input 
                  type="url"
                  value={story.AuthorPhotoUrl || ''} 
                  onChange={e => updateStory(index, 'AuthorPhotoUrl', e.target.value)} 
                  placeholder="e.g. 'https://images.unsplash.com/...'"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Renovation Photo URL (Large)</label>
              <input 
                type="url"
                value={story.RenovationPhotoUrl || ''} 
                onChange={e => updateStory(index, 'RenovationPhotoUrl', e.target.value)} 
                placeholder="e.g. 'https://images.unsplash.com/...'"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Story Text</label>
              <textarea 
                rows={4} 
                value={story.StoryText} 
                onChange={e => updateStory(index, 'StoryText', e.target.value)} 
                placeholder="e.g. 'We loved working with this contractor on our kitchen remodel...'"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y" 
                required
              />
            </div>
          </div>
        ))}

        {saveStatus && <div className={`text-sm font-medium p-2 rounded ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{saveStatus.message}</div>}

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700 mt-6">
          <button type="submit" disabled={isSaving || stories.length === 0} className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded cursor-pointer disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Stories'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StoryConfigForm;
