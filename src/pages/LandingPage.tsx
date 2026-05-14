import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, FileCheck, Users, Target } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 pb-12 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-100 dark:bg-blue-900/60 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-emerald-50 dark:bg-emerald-900/40 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full mx-auto relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-4 leading-tight">
            Plan Your Renovation Project <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">With Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            A free guided experience to help you craft your vision, identify your needs, and prepare for your home renovation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Target size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Clear Scope</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pinpoint exactly what you want to achieve with your project, ensuring no detail is overlooked.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Users size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">For Homeowners</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Designed specifically for homeowners to easily communicate their ideas to contractors.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <FileCheck size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Instant Insights</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Receive a comprehensive report of your preferences and an estimated budget instantly.</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate('/start')}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 dark:bg-blue-500 text-white font-bold text-xl rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg dark:shadow-none hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Next
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
