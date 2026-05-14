import React, { useState, useEffect } from 'react';

export interface GlobalSettingsFormProps {
  companyId: number;
}

const GlobalSettingsForm: React.FC<GlobalSettingsFormProps> = ({ companyId }) => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [contactPromptText, setContactPromptText] = useState('');
  const [disabledSteps, setDisabledSteps] = useState<string[]>([]);
  const [disabledProjectTypes, setDisabledProjectTypes] = useState<string[]>([]);
  const [availableProjectTypes, setAvailableProjectTypes] = useState<{ ProjectTypeID: number, ProjectTypeName: string }[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/discovery-config/${companyId}`);
        const data = await response.json();
        if (data) {
          setWelcomeMessage(data.welcomeMessage || '');
          setThankYouMessage(data.thankYouMessage || '');
          setContactPromptText(data.contactPromptText || '');
          setDisabledSteps(data.disabledSteps ? data.disabledSteps.split(',') : []);
          setDisabledProjectTypes(data.disabledProjectTypes ? data.disabledProjectTypes.split(',') : []);
          setAvailableProjectTypes(data.projectTypes || []);
        }
      } catch (error) {
        console.error("Failed to load global config", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await fetch(`/api/admin/discovery-config/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          welcomeMessage, 
          thankYouMessage, 
          contactPromptText, 
          disabledSteps: disabledSteps.join(','),
          disabledProjectTypes: disabledProjectTypes.join(',')
        })
      });
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
     window.location.href = `/api/admin/discovery-config/${companyId}/submissions/export`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-16 text-slate-500 dark:text-slate-400 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Global Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            These messages apply to all Project Discovery presentations, regardless of the project type.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="welcomeMessage" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Welcome Message (Slide 1)
          </label>
          <textarea
            id="welcomeMessage"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow resize-none"
            placeholder="e.g., Welcome to Quote Kong's interactive discovery process."
            required
          />
          <p className="text-xs text-slate-400">
            This is the first text the client will see when you hand them the tablet.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="thankYouMessage" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Thank You Message (Final Slide)
          </label>
          <textarea
            id="thankYouMessage"
            value={thankYouMessage}
            onChange={(e) => setThankYouMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow resize-none"
            placeholder="e.g., Thank you! We look forward to building your dream project."
            required
          />
          <p className="text-xs text-slate-400">
            Displayed after they complete the survey.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="contactPromptText" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Contact Form Prompt (Notes Section)
          </label>
          <textarea
            id="contactPromptText"
            value={contactPromptText}
            onChange={(e) => setContactPromptText(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow resize-none"
            placeholder="e.g., What would you like to let us know about?"
          />
          <p className="text-xs text-slate-400">
            Displayed above the notes section on the final contact info step.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <div>
            <h3 className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Active Wizard Steps</h3>
            <p className="text-xs text-slate-400 mt-1">
              Toggle specific steps on or off. Note: Required core steps (Project Type, Contact Info) cannot be disabled.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { id: '2', label: 'Success Stories / Testimonials' },
              { id: '3', label: 'Home Context' },
              { id: '4', label: 'Pain Points' },
              { id: '5', label: 'Trigger Event' },
              { id: '6', label: 'Style Preferences (Photos)' },
              { id: '7', label: 'Must Haves vs Nice-to-Haves' },
              { id: '8', label: 'Trade-offs (Priorities)' },
              { id: '9', label: 'Quality vs Time vs Cost' },
              { id: '10', label: 'Concerns' },
              { id: '11', label: 'Timeline' },
              { id: '12', label: 'Budget Range' }
            ].map(step => {
              const isEnabled = !disabledSteps.includes(step.id);
              return (
                <label key={step.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDisabledSteps(prev => prev.filter(id => id !== step.id));
                        } else {
                          setDisabledSteps(prev => [...prev, step.id]);
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 dark:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-blue-500"></div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <div>
            <h3 className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Active Project Types</h3>
            <p className="text-xs text-slate-400 mt-1">
              Toggle specific project types on or off. Disabled project types will not appear on the first page.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {availableProjectTypes.map(pt => {
              const strId = pt.ProjectTypeID.toString();
              const isEnabled = !disabledProjectTypes.includes(strId);
              return (
                <label key={pt.ProjectTypeID} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pt.ProjectTypeName}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDisabledProjectTypes(prev => prev.filter(id => id !== strId));
                        } else {
                          setDisabledProjectTypes(prev => [...prev, strId]);
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 dark:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-blue-500"></div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {saveStatus && (
          <div className={`p-3 rounded-md text-sm font-medium ${
            saveStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveStatus.message}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default GlobalSettingsForm;
