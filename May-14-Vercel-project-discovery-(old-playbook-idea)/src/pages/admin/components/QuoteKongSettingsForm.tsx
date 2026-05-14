import React from 'react';

interface QuoteKongSettingsFormProps {
  companyId: number;
}

const QuoteKongSettingsForm: React.FC<QuoteKongSettingsFormProps> = ({ companyId }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Quote Kong Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Super admin settings configured by Quote Kong staff.</p>
        </div>
        <div className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-purple-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Staff Only
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-800 dark:text-blue-200 text-sm flex gap-3 items-start">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-semibold mb-1">Internal Settings Only</p>
            <p>These settings are only visible to logged-in Quote Kong employees. Contractors cannot see or access this tab.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
            <select className="w-full sm:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subscription Tier</label>
            <select className="w-full sm:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="basic">Basic Plan</option>
              <option value="pro">Pro Plan</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Internal Notes</label>
            <textarea 
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
              placeholder="Notes visible only to Quote Kong team..."
            />
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
             <button
               type="button"
               onClick={() => alert('Settings saved')}
               className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
             >
               Save Internal Settings
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteKongSettingsForm;
