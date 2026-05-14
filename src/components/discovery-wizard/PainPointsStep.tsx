import React, { useState } from 'react';

export interface PainPointOption {
  PainPointOptionID: number;
  PainPointText: string;
}

export interface PainPointsStepProps {
  options: PainPointOption[];
  onNext: (selectedIds: number[]) => void;
  onBack: () => void;
}

const PainPointsStep: React.FC<PainPointsStepProps> = ({ options, onNext, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          What is currently not working for you?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Select all the items you would like us to address in this project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.PainPointOptionID);
          return (
            <div
              key={option.PainPointOptionID}
              onClick={() => toggleSelection(option.PainPointOptionID)}
              className={`
                cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 flex items-center
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 shadow-md' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:border-slate-600 hover:shadow-sm'
                }
              `}
            >
              <div className={`
                mr-4 flex h-6 w-6 items-center justify-center rounded border-2
                ${isSelected ? 'bg-blue-600 dark:bg-blue-500 border-blue-600' : 'border-slate-300 dark:border-slate-600'}
              `}>
                {isSelected && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-lg font-medium ${isSelected ? 'text-blue-800 dark:text-blue-200' : 'text-slate-700 dark:text-slate-300'}`}>
                {option.PainPointText}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={() => onNext(selectedIds)}
          disabled={selectedIds.length === 0}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white transition-all cursor-pointer
            ${selectedIds.length > 0 
              ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 shadow-md' 
              : 'bg-slate-300 cursor-not-allowed'
            }
          `}
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
export default PainPointsStep;
