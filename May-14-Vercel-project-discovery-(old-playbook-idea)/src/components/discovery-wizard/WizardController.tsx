import React, { useState } from 'react';
import ProjectTypeStep from './ProjectTypeStep';
import PainPointsStep from './PainPointsStep';
import BudgetSliderStep from './BudgetSliderStep';
import StyleBoardStep from './StyleBoardStep';

export default function WizardController({ companyId, initialConfig }: { companyId: number, initialConfig: any }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [projectTypeId, setProjectTypeId] = useState<number | null>(null);
  const [painPoints, setPainPoints] = useState<number[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number] | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Fetched nested configurations
  const [painPointOptions, setPainPointOptions] = useState<any[]>([]);
  const [budgetConfig, setBudgetConfig] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const fetchPainPoints = async (typeId: number) => {
    const r = await fetch(`/api/discovery-config/${companyId}/pain-points/${typeId}`);
    return r.json();
  };
  
  const fetchBudgetConfig = async (typeId: number) => {
    const r = await fetch(`/api/discovery-config/${companyId}/budget-config/${typeId}`);
    return r.json();
  };

  const fetchPhotos = async (typeId: number) => {
    const r = await fetch(`/api/discovery-config/${companyId}/photos/${typeId}`);
    return r.json();
  };

  const submitPayload = async (finalAnnotations: any[]) => {
    setLoading(true);
    try {
      await fetch('/api/discovery-config/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          projectTypeId,
          painPoints,
          budgetMin: budgetRange?.[0],
          budgetMax: budgetRange?.[1],
          annotations: finalAnnotations
        })
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectTypeNext = async (id: number) => {
    setProjectTypeId(id);
    setLoading(true);
    try {
      const opts = await fetchPainPoints(id);
      setPainPointOptions(opts);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePainPointsNext = async (selectedIds: number[]) => {
    setPainPoints(selectedIds);
    setLoading(true);
    try {
      const bConf = await fetchBudgetConfig(projectTypeId!);
      setBudgetConfig(bConf);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetNext = async (range: [number, number]) => {
    setBudgetRange(range);
    setLoading(true);
    try {
      const ph = await fetchPhotos(projectTypeId!);
      setPhotos(ph);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (finalAnnotations: any[]) => {
    setAnnotations(finalAnnotations);
    await submitPayload(finalAnnotations);
  };

  if (submitted) {
    return (
      <div className="p-16 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">{initialConfig.thankYouMessage}</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">Your personalized vision board is being generated and sent to you!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <div className="p-4 md:p-8">
        {step === 0 && (
          <ProjectTypeStep 
            welcomeMessage={initialConfig.welcomeMessage}
            projectTypes={initialConfig.projectTypes}
            onNext={handleProjectTypeNext}
          />
        )}
        {step === 1 && (
          <PainPointsStep 
            options={painPointOptions}
            onNext={handlePainPointsNext}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <BudgetSliderStep 
            config={budgetConfig}
            onNext={handleBudgetNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StyleBoardStep 
            photos={photos}
            onFinish={handleFinish}
            onBack={() => setStep(2)}
          />
        )}
      </div>
      {/* Progress Footer */}
      <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}
