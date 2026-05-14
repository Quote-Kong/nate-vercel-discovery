import React, { useState, useEffect } from 'react';

export interface BrandingSettingsFormProps {
  companyId: number;
}

const BrandingSettingsForm: React.FC<BrandingSettingsFormProps> = ({ companyId }) => {
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [baseTextSize, setBaseTextSize] = useState('text-base');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // In a real app this would fetch branding settings from an API
    setIsLoading(true);
    setTimeout(() => {
      // Fake initial load
      setPrimaryColor('#2563eb');
      setFontFamily('font-sans');
      setBaseTextSize('text-base');
      setLogoUrl('');
      setIsLoading(false);
    }, 500);
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      // Mock saving to backend
      await new Promise(resolve => setTimeout(resolve, 800));
      setSaveStatus({ type: 'success', message: 'Branding settings saved successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-16 text-slate-500 dark:text-slate-400 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Branding Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize the appearance of the Project Discovery client-facing wizard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="logoUrl" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Company Logo (URL)
          </label>
          <input
            type="text"
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow"
            placeholder="https://example.com/logo.png"
          />
          <p className="text-xs text-slate-400">
            Provide a URL to your company's logo. It will be displayed at the top of the wizard.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="primaryColor" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Primary Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow uppercase font-mono text-sm"
              placeholder="#000000"
            />
          </div>
          <p className="text-xs text-slate-400">
            Used for primary buttons, active states, and highlights.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="fontFamily" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Typography (Font Family)
          </label>
          <select
            id="fontFamily"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow"
          >
            <option value="font-sans">Modern Sans-Serif (Default)</option>
            <option value="font-serif">Elegant Serif</option>
            <option value="font-mono">Technical Monospace</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="baseTextSize" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Base Text Size
          </label>
          <select
            id="baseTextSize"
            value={baseTextSize}
            onChange={(e) => setBaseTextSize(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-500 outline-none transition-shadow"
          >
            <option value="text-sm">Small</option>
            <option value="text-base">Normal (Default)</option>
            <option value="text-lg">Large</option>
          </select>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mt-8">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Preview</h3>
          <div className={`p-6 bg-white dark:bg-slate-900 rounded-lg border shadow-sm ${fontFamily}`}>
            <div className="flex items-center gap-4 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="h-10 object-contain" />
              ) : (
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-slate-400 text-xs font-bold">LOGO</div>
              )}
              <div>
                <h4 className="text-lg font-bold" style={{ color: primaryColor }}>Lead Magnet Preview</h4>
                <p className={`text-slate-500 dark:text-slate-400 ${baseTextSize}`}>The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
            <button
              style={{ backgroundColor: primaryColor }}
              className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm w-full transition-opacity hover:opacity-90 ${baseTextSize}`}
            >
              Continue to the Next Step
            </button>
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
            {isSaving ? 'Saving...' : 'Save Branding Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandingSettingsForm;
