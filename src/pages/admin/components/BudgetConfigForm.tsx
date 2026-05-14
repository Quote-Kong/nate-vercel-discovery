import React, { useState, useEffect } from 'react';

export interface BudgetConfigFormProps {
  companyId: number;
  projectTypeId: number;
}

const BudgetConfigForm: React.FC<BudgetConfigFormProps> = ({ companyId, projectTypeId }) => {
  const [sliderTrackMin, setSliderTrackMin] = useState<number>(0);
  const [sliderTrackMax, setSliderTrackMax] = useState<number>(100000);
  const [defaultHandleMin, setDefaultHandleMin] = useState<number>(20000);
  const [defaultHandleMax, setDefaultHandleMax] = useState<number>(50000);
  const [stepAmount, setStepAmount] = useState<number>(1000);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/discovery-config/${companyId}/budget-config/${projectTypeId}`);
        const data = await response.json();
        if (data) {
          setSliderTrackMin(data.SliderTrackMin ?? 0);
          setSliderTrackMax(data.SliderTrackMax ?? 100000);
          setDefaultHandleMin(data.DefaultHandleMin ?? 20000);
          setDefaultHandleMax(data.DefaultHandleMax ?? 50000);
          setStepAmount(data.StepAmount ?? 1000);
        }
      } catch (error) {
        console.error("Failed to load budget config", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [companyId, projectTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveStatus(null);
    
    // Validation
    if (defaultHandleMin < sliderTrackMin) {
      setErrorMsg('Default Handle Min cannot be less than Slider Track Min.');
      return;
    }
    if (defaultHandleMax > sliderTrackMax) {
      setErrorMsg('Default Handle Max cannot be greater than Slider Track Max.');
      return;
    }
    if (defaultHandleMin > defaultHandleMax) {
      setErrorMsg('Default Handle Min cannot be greater than Default Handle Max.');
      return;
    }

    setIsSaving(true);
    try {
      await fetch(`/api/admin/discovery-config/${companyId}/budget/${projectTypeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SliderTrackMin: sliderTrackMin,
          SliderTrackMax: sliderTrackMax,
          DefaultHandleMin: defaultHandleMin,
          DefaultHandleMax: defaultHandleMax,
          StepAmount: stepAmount
        })
      });
      setSaveStatus({ type: 'success', message: 'Budget settings saved!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save budget settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading budget settings...</div>;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Budget Range Settings</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure the minimum and maximum constraints for the client slider.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Slider Track Minimum ($)</label>
            <input type="number" required value={sliderTrackMin} onChange={e => setSliderTrackMin(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Slider Track Maximum ($)</label>
            <input type="number" required value={sliderTrackMax} onChange={e => setSliderTrackMax(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Default Handle Minimum ($)</label>
            <input type="number" required value={defaultHandleMin} onChange={e => setDefaultHandleMin(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Default Handle Maximum ($)</label>
            <input type="number" required value={defaultHandleMax} onChange={e => setDefaultHandleMax(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step Amount ($)</label>
            <input type="number" required value={stepAmount} onChange={e => setStepAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {errorMsg && <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded">{errorMsg}</div>}
        {saveStatus && <div className={`text-sm font-medium p-2 rounded ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{saveStatus.message}</div>}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSaving} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded cursor-pointer">{isSaving ? 'Saving...' : 'Save Budget'}</button>
        </div>
      </form>
    </div>
  );
}
export default BudgetConfigForm;
