import React, { useState } from 'react';
import BudgetConfigForm from './BudgetConfigForm';
import PainPointsConfigList from './PainPointsConfigList';
import PhotoPortfolioConfig from './PhotoPortfolioConfig';
import StoryConfigForm from './StoryConfigForm';

export interface ProjectTypeSettingsPanelProps {
  companyId: number;
  projectTypeId: number;
  projectTypeName: string;
}

const ProjectTypeSettingsPanel: React.FC<ProjectTypeSettingsPanelProps> = ({ 
  companyId, projectTypeId, projectTypeName 
}) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{projectTypeName} Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure budget limits, pain points, portfolio photos, and homeowner stories specific to this project type.
        </p>
      </div>

      <div className="space-y-12">
        <BudgetConfigForm companyId={companyId} projectTypeId={projectTypeId} />
        
        <PainPointsConfigList companyId={companyId} projectTypeId={projectTypeId} />
        
        <PhotoPortfolioConfig companyId={companyId} projectTypeId={projectTypeId} />

        <StoryConfigForm companyId={companyId} projectTypeId={projectTypeId} />
      </div>
    </div>
  );
};
export default ProjectTypeSettingsPanel;
