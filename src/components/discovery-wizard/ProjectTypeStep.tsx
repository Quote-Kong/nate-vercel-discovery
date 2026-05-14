import React, { useState } from 'react';

export interface ProjectTypeData {
  ProjectTypeID: number;
  ProjectTypeName: string;
}

export interface ProjectTypeStepProps {
  welcomeMessage: string;
  projectTypes: ProjectTypeData[];
  onNext: (selectedTypeId: number) => void;
}

const ProjectTypeStep: React.FC<ProjectTypeStepProps> = ({ 
  welcomeMessage, 
  projectTypes, 
  onNext 
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  return (
    <div className="flex flex-col max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {welcomeMessage}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          What type of project are you planning?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {projectTypes.map((type) => {
          const isSelected = selectedTypeId === type.ProjectTypeID;
          return (
            <div
              key={type.ProjectTypeID}
              onClick={() => setSelectedTypeId(type.ProjectTypeID)}
              className={`
                cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-lg font-medium
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-600 hover:shadow-sm'
                }
              `}
              role="button"
              tabIndex={0}
            >
              {type.ProjectTypeName}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={() => selectedTypeId && onNext(selectedTypeId)}
          disabled={selectedTypeId === null}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white transition-all
            ${selectedTypeId !== null 
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
export default ProjectTypeStep;
