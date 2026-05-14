import React, { useState, useEffect } from 'react';
import WizardController from '../components/discovery-wizard/WizardController';

// Wizard wrapper fetching initial config
export default function WizardPage({ companyId }: { companyId: number }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/discovery-config/${companyId}`)
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Wizard...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">Failed to load configuration.</div>;

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <WizardController companyId={companyId} initialConfig={config} />
      </div>
    </div>
  );
}
