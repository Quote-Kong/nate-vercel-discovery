import React, { useState, useEffect } from 'react';
import GlobalSettingsForm from './components/GlobalSettingsForm';
import ProjectTypeSettingsPanel from './components/ProjectTypeSettingsPanel';
import BrandingSettingsForm from './components/BrandingSettingsForm';
import ProjectTypesConfigList from './components/ProjectTypesConfigList';
import QuoteKongSettingsForm from './components/QuoteKongSettingsForm';

export interface ProjectTypeData {
  ProjectTypeID: number;
  ProjectTypeName: string;
  SubAreas?: string;
}

export interface ProjectDiscoverySettingsProps {
  companyId: number;
}

const ProjectDiscoverySettings: React.FC<ProjectDiscoverySettingsProps> = ({ 
  companyId
}) => {
  const [activeTab, setActiveTab] = useState<string | number>('global');
  const [projectTypes, setProjectTypes] = useState<ProjectTypeData[]>([]);

  // Mock checking if the user is a Quote Kong employee for demonstrating the conditional tab
  const isQuoteKongEmployee = true;

  useEffect(() => {
    fetch(`/api/discovery-config/${companyId}`)
      .then(res => res.json())
      .then(data => {
        if (data.projectTypes) {
          setProjectTypes(data.projectTypes);
        }
      });
  }, [companyId]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Project Discovery Information
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure the Lead Magnet survey your clients will use to submit project details.
          </p>
        </div>
        <button
          onClick={() => window.location.href = `/api/admin/database-schema/export`}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
          Export Database Schema
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar (Tabs) */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            
            <button
              onClick={() => setActiveTab('global')}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${activeTab === 'global' 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50 border border-transparent'
                }
              `}
              role="tab"
            >
              <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Global Settings
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${activeTab === 'branding' 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50 border border-transparent'
                }
              `}
              role="tab"
            >
              <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Branding Settings
            </button>

            <button
              onClick={() => setActiveTab('project-types')}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${activeTab === 'project-types' 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50 border border-transparent'
                }
              `}
              role="tab"
            >
              <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Project Types
            </button>

            {isQuoteKongEmployee && (
              <button
                onClick={() => setActiveTab('quotekong')}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                  ${activeTab === 'quotekong' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50 border border-transparent'
                  }
                `}
                role="tab"
              >
                <svg className="mr-3 h-5 w-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Quote Kong Settings
              </button>
            )}

            <div className="pt-4 pb-2">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project Specific
              </h3>
            </div>

            {projectTypes.map((type) => (
              <button
                key={type.ProjectTypeID}
                onClick={() => setActiveTab(type.ProjectTypeID)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                  ${activeTab === type.ProjectTypeID 
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50 border border-transparent'
                  }
                `}
                role="tab"
              >
                <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {type.ProjectTypeName}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {activeTab === 'global' ? (
            <GlobalSettingsForm companyId={companyId} />
          ) : activeTab === 'branding' ? (
            <BrandingSettingsForm companyId={companyId} />
          ) : activeTab === 'project-types' ? (
            <ProjectTypesConfigList 
              companyId={companyId} 
              projectTypes={projectTypes} 
              onChange={setProjectTypes} 
            />
          ) : activeTab === 'quotekong' && isQuoteKongEmployee ? (
            <QuoteKongSettingsForm companyId={companyId} />
          ) : (
            <ProjectTypeSettingsPanel 
              companyId={companyId} 
              projectTypeId={activeTab as number} 
              projectTypeName={projectTypes.find(p => p.ProjectTypeID === activeTab)?.ProjectTypeName || ''}
            />
          )}
        </main>

      </div>
    </div>
  );
};

export default ProjectDiscoverySettings;
