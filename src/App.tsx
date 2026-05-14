import React, { useState, useRef, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { Menu, X, Sun, Moon } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { Reorder, motion, AnimatePresence } from 'motion/react';
import ProjectDiscoverySettings from './pages/admin/ProjectDiscoverySettings';
import { getProjectTypeId } from './utils/projectTypeMapper';
import { COUNTRIES, CANADA_PROVINCES, USA_STATES } from './utils/countries';

// ==========================================
// TYPES & INTERFACES
// ==========================================
type WizardData = {
  projectType: string;
  projectSubTypes: Record<string, string[]>;
  homeContext: string;
  painPoints: string[];
  triggerEvent: string;
  styleNotes: any[];
  clientPhotos: { type: 'upload' | 'link', src: string, name?: string, note?: string, likes?: {id: string, x: number, y: number, text: string}[] }[];
  priorities: string[];
  priorityChangesCount: number;
  concerns: string[];
  timeline: string;
  budgetMin: number;
  budgetMax: number;
  requirementsScales: number[];
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    country: string;
    howDidYouHearAboutUs?: string;
  };
  additionalNotes: string;
  metrics: {
    testimonialsViewed: number[];
    timeSpentPerTestimonial: Record<number, number>;
    timeSpentPerStep: Record<number, number>;
  };
};

// ==========================================
// REUSABLE UI COMPONENTS
// ==========================================

type QuestionOption = string | { label: string; subOptions: string[] };

// A generic step for single or multi-select questions (Handles Steps 1, 2, 3, 4, 7, 8)
const QuestionStep = ({
  title,
  subtitle,
  options,
  isMulti = false,
  currentValue,
  onUpdate,
  allowOther = true,
  subSelections = {},
  onUpdateSubSelections,
}: {
  title: string;
  subtitle: string;
  options: QuestionOption[];
  isMulti?: boolean;
  currentValue: string | string[];
  onUpdate: (val: any) => void;
  allowOther?: boolean;
  subSelections?: Record<string, string[]>;
  onUpdateSubSelections?: (val: Record<string, string[]>) => void;
}) => {
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState("");

  const optionLabels = options.map(o => typeof o === 'string' ? o : o.label);

  // Initialize "Other" state based on currentValue
  useEffect(() => {
    if (isMulti) {
      const currentArr = (currentValue as string[]) || [];
      const customValues = currentArr.filter((val) => !optionLabels.includes(val));
      if (customValues.length > 0) {
        setShowOther(true);
        setOtherText(customValues[0]);
      }
    } else {
      const val = currentValue as string;
      if (val && !optionLabels.includes(val)) {
        setShowOther(true);
        setOtherText(val);
      }
    }
  }, []); // Only run once on mount for initialization

  const toggleMulti = (opt: string) => {
    const current = (currentValue as string[]) || [];
    if (current.includes(opt)) {
      onUpdate(current.filter((item) => item !== opt));
      if (onUpdateSubSelections && subSelections[opt]) {
        const newSub = { ...subSelections };
        delete newSub[opt];
        onUpdateSubSelections(newSub);
      }
    } else {
      onUpdate([...current, opt]);
    }
  };

  const toggleSubMulti = (parentOpt: string, subOpt: string) => {
    if (!onUpdateSubSelections) return;
    const currentSubs = subSelections[parentOpt] || [];
    const newSubs = currentSubs.includes(subOpt) 
      ? currentSubs.filter(o => o !== subOpt)
      : [...currentSubs, subOpt];
    
    onUpdateSubSelections({
      ...subSelections,
      [parentOpt]: newSubs
    });
  };

  const handleSelectSingle = (opt: string) => {
    // If standard option selected, uncheck 'Other'
    if (showOther) {
      setShowOther(false);
      setOtherText("");
    }
    if (currentValue !== opt) {
      onUpdate(opt);
      if (onUpdateSubSelections) onUpdateSubSelections({});
    }
  };

  const handleToggleOther = () => {
    if (showOther) {
      // Disabling other
      setShowOther(false);
      setOtherText("");
      if (isMulti) {
        const currentArr = (currentValue as string[]) || [];
        onUpdate(currentArr.filter((val) => optionLabels.includes(val)));
      } else {
        onUpdate("");
      }
    } else {
      // Enabling other
      setShowOther(true);
      if (!isMulti) {
        // Clear standard single selection if moving focus to other
        onUpdate("");
        if (onUpdateSubSelections) onUpdateSubSelections({});
      }
    }
  };

  const handleOtherTextBlur = () => {
    if (!showOther) return;
    
    if (isMulti) {
      const currentArr = (currentValue as string[]) || [];
      const standardVals = currentArr.filter((val) => optionLabels.includes(val));
      if (otherText.trim()) {
        onUpdate([...standardVals, otherText.trim()]);
      } else {
        onUpdate(standardVals);
      }
    } else {
      onUpdate(otherText.trim());
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {options.map((optObj) => {
          const opt = typeof optObj === 'string' ? optObj : optObj.label;
          const subOptions = typeof optObj === 'string' ? undefined : optObj.subOptions;
          const isSelected = isMulti
            ? (currentValue as string[])?.includes(opt)
            : currentValue === opt;
            
          return (
            <div key={opt} className={`rounded-xl border-2 transition-all ${
              isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40 shadow-sm p-3 md:p-4" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 p-3 md:p-4"
            }`}>
              <div 
                className="flex items-center cursor-pointer w-full"
                onClick={() => (isMulti ? toggleMulti(opt) : handleSelectSingle(opt))}
              >
                <div
                  className={`w-5 h-5 mr-3 flex-shrink-0 border-2 flex items-center justify-center ${
                    isMulti ? "rounded" : "rounded-full"
                  } ${isSelected ? "border-blue-600 bg-blue-600 dark:bg-blue-500" : "border-slate-300 dark:border-slate-600"}`}
                >
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`font-medium ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-slate-700 dark:text-slate-300"}`}>
                  {opt}
                </span>
              </div>
              
              {isSelected && subOptions && onUpdateSubSelections && (
                <div className="pl-8 mt-3 space-y-2 border-t border-blue-100 dark:border-blue-900 pt-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Select areas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subOptions.map(subOpt => {
                      const isSubSelected = subSelections[opt]?.includes(subOpt);
                      return (
                        <div 
                          key={subOpt} 
                          onClick={(e) => { e.stopPropagation(); toggleSubMulti(opt, subOpt); }}
                          className={`cursor-pointer px-2 py-1.5 rounded border flex items-center text-xs transition-colors ${
                            isSubSelected ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:bg-blue-900/60'
                          }`}
                        >
                          <div className={`w-3 h-3 mr-2 rounded border flex items-center justify-center flex-shrink-0 ${isSubSelected ? 'border-white' : 'border-blue-400'}`}>
                            {isSubSelected && <span className="text-[8px] leading-none block">✓</span>}
                          </div>
                          {subOpt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Other Option */}
        {allowOther && (
          <div
            className={`cursor-pointer p-3 md:p-4 rounded-xl border-2 transition-all flex flex-col justify-center min-h-[56px] md:min-h-[64px] ${
              showOther
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600"
            }`}
          >
            <div className="flex items-center w-full" onClick={handleToggleOther}>
              <div
                className={`w-5 h-5 mr-3 flex-shrink-0 border-2 flex items-center justify-center ${
                  isMulti ? "rounded" : "rounded-full"
                } ${showOther ? "border-blue-600 bg-blue-600 dark:bg-blue-500" : "border-slate-300 dark:border-slate-600"}`}
              >
                {showOther && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`font-medium ${showOther ? "text-blue-800 dark:text-blue-200" : "text-slate-700 dark:text-slate-300"}`}>
                Other
              </span>
            </div>
            
            {showOther && (
              <div className="pl-9 mt-3 w-full" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Please specify..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onBlur={handleOtherTextBlur}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Simplified Budget Slider Step (Step 9)
const BudgetStep = ({ data, onUpdate }: { data: WizardData; onUpdate: (min: number, max: number) => void }) => {
  const [config, setConfig] = useState({
    SliderTrackMin: 0,
    SliderTrackMax: 300000,
    DefaultHandleMin: 20000,
    DefaultHandleMax: 40000,
    StepAmount: 1000,
  });

  useEffect(() => {
    // Attempt to map project type text to ID, default to 1 (Kitchen Remodel)
    const projectTypeId = getProjectTypeId(data.projectType);
    
    // Assume companyId is 1 for now
    fetch(`/api/discovery-config/1/budget-config/${projectTypeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("API not ok");
        return res.json();
      })
      .then((apiConfig) => {
        if (apiConfig) {
          setConfig({
            SliderTrackMin: apiConfig.SliderTrackMin ?? 0,
            SliderTrackMax: apiConfig.SliderTrackMax ?? 300000,
            DefaultHandleMin: apiConfig.DefaultHandleMin ?? 20000,
            DefaultHandleMax: apiConfig.DefaultHandleMax ?? 40000,
            StepAmount: apiConfig.StepAmount ?? 1000,
          });
        }
      })
      .catch((err) => {
        console.warn("Could not fetch budget config, using defaults.");
      });
  }, [data.projectType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const scaleMarks = [
    config.SliderTrackMin,
    Math.round(config.SliderTrackMin + (config.SliderTrackMax - config.SliderTrackMin) * 0.16),
    Math.round(config.SliderTrackMin + (config.SliderTrackMax - config.SliderTrackMin) * 0.33),
    Math.round(config.SliderTrackMin + (config.SliderTrackMax - config.SliderTrackMin) * 0.5),
    Math.round(config.SliderTrackMin + (config.SliderTrackMax - config.SliderTrackMin) * 0.66),
    Math.round(config.SliderTrackMin + (config.SliderTrackMax - config.SliderTrackMin) * 0.83),
    config.SliderTrackMax
  ];

  const [editMin, setEditMin] = useState(false);
  const [editMax, setEditMax] = useState(false);
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");

  const handleMinSubmit = () => {
    let newMin = parseInt(tempMin.replace(/[^0-9]/g, ''));
    if (isNaN(newMin)) newMin = config.DefaultHandleMin;
    newMin = Math.round(newMin / config.StepAmount) * config.StepAmount;
    newMin = Math.max(config.SliderTrackMin, Math.min(newMin, (data.budgetMax || config.DefaultHandleMax) - config.StepAmount));
    onUpdate(newMin, data.budgetMax || config.DefaultHandleMax);
    setEditMin(false);
  };

  const handleMaxSubmit = () => {
    let newMax = parseInt(tempMax.replace(/[^0-9]/g, ''));
    if (isNaN(newMax)) newMax = config.DefaultHandleMax;
    newMax = Math.round(newMax / config.StepAmount) * config.StepAmount;
    newMax = Math.max((data.budgetMin || config.DefaultHandleMin) + config.StepAmount, Math.min(newMax, config.SliderTrackMax));
    onUpdate(data.budgetMin || config.DefaultHandleMin, newMax);
    setEditMax(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full min-h-[400px] bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl shadow-xl border border-gray-200 font-sans tracking-wide flex justify-center items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-10">
        
        {/* Header Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            What is your expected investment?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            A well-executed renovation enhances your lifestyle and adds lasting value to your home. Since project costs can vary widely depending on materials and scope, tell us what you're comfortable investing.
          </p>
        </div>

        {/* Current Value Display */}
        <div className="flex justify-center items-center gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-900 rounded-2xl py-3 px-4 sm:px-8 shadow-sm relative overflow-hidden max-w-full w-full sm:w-auto mx-4 sm:mx-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate">Target Range</span>
            <span className="block text-[10px] sm:text-xs text-slate-400 font-medium mb-1">(Tap numbers to edit)</span>
            <div className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 sm:gap-4 whitespace-nowrap">
              {editMin ? (
                 <input 
                   type="number" 
                   pattern="[0-9]*" 
                   inputMode="numeric"
                   autoFocus
                   value={tempMin}
                   onChange={(e) => setTempMin(e.target.value)}
                   onBlur={handleMinSubmit}
                   onKeyDown={(e) => e.key === 'Enter' && handleMinSubmit()}
                   className="w-24 sm:w-32 bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-center outline-none focus:ring-2 focus:ring-blue-500"
                 />
              ) : (
                <span 
                  className="tracking-tight cursor-pointer hover:text-blue-600 dark:text-blue-400 transition-colors border-b-2 border-transparent hover:border-blue-300"
                  onClick={() => {
                    setTempMin((data.budgetMin || config.DefaultHandleMin).toString());
                    setEditMin(true);
                  }}
                  title="Click to edit minimum budget"
                >
                  {formatCurrency(data.budgetMin || config.DefaultHandleMin)}
                </span>
              )}
              <span className="text-slate-300 font-light mx-1 sm:mx-0">—</span>
              {editMax ? (
                 <input 
                   type="number" 
                   pattern="[0-9]*" 
                   inputMode="numeric"
                   autoFocus
                   value={tempMax}
                   onChange={(e) => setTempMax(e.target.value)}
                   onBlur={handleMaxSubmit}
                   onKeyDown={(e) => e.key === 'Enter' && handleMaxSubmit()}
                   className="w-24 sm:w-32 bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-center outline-none focus:ring-2 focus:ring-blue-500"
                 />
              ) : (
                <span 
                  className="tracking-tight cursor-pointer hover:text-blue-600 dark:text-blue-400 transition-colors border-b-2 border-transparent hover:border-blue-300"
                  onClick={() => {
                    setTempMax((data.budgetMax || config.DefaultHandleMax).toString());
                    setEditMax(true);
                  }}
                  title="Click to edit maximum budget"
                >
                  {formatCurrency(data.budgetMax || config.DefaultHandleMax)}
                  {data.budgetMax >= config.SliderTrackMax ? '+' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="px-2 sm:px-8 pb-4">
          <p className="text-slate-400 text-center mb-6 text-sm font-medium tracking-wide uppercase">
            Adjust the slider below
          </p>
          
          <div className="relative pt-6 pb-6">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-8 cursor-pointer"
              min={config.SliderTrackMin}
              max={config.SliderTrackMax}
              step={config.StepAmount}
              value={[data.budgetMin || config.DefaultHandleMin, data.budgetMax || config.DefaultHandleMax]}
              onValueChange={(val: number[]) => onUpdate(val[0], val[1])}
            >
              <Slider.Track className="relative grow rounded-full h-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden">
                <Slider.Range className="absolute bg-gradient-to-r from-blue-400 to-indigo-500 h-full" />
              </Slider.Track>
              
              <Slider.Thumb 
                className="block w-8 h-8 bg-white dark:bg-slate-900 border-[3px] border-blue-500 dark:border-blue-500 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-blue-50 dark:bg-blue-900/40 hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" 
                aria-label="Minimum Budget" 
              />
              <Slider.Thumb 
                className="block w-8 h-8 bg-white dark:bg-slate-900 border-[3px] border-indigo-500 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100" 
                aria-label="Maximum Budget" 
              />
            </Slider.Root>

            <div className="flex justify-between mt-6 text-slate-400 text-xs sm:text-sm font-medium relative -left-3 w-[calc(100%+1.5rem)]">
              {scaleMarks.map((mark) => (
                <div key={mark} className="flex flex-col items-center flex-1 text-center">
                  <div className="h-2 w-px bg-slate-300 mb-1"></div>
                  <span>{mark === config.SliderTrackMax ? formatCurrency(mark) + '+' : formatCurrency(mark)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


const defaultPriorities = [
  "Design and Style",
  "Function",
  "Quality Finishings",
  "Plenty of Work Space",
  "Trust / Dependability",
  "Design Collaboration",
  "Budget",
  "Other"
];

const PriorityRankingStep = ({
  title,
  subtitle,
  currentValue,
  onUpdate,
  onChangeCount
}: {
  title: string;
  subtitle: string;
  currentValue: string[];
  onUpdate: (val: string[]) => void;
  onChangeCount: () => void;
}) => {
  const [items, setItems] = useState<string[]>(
    currentValue.length > 0 ? currentValue : defaultPriorities
  );
  
  const originalOrderRef = useRef<string[]>([]);

  // Sync back to parent when items change
  React.useEffect(() => {
    onUpdate(items);
  }, [items]);

  const handleDragStart = () => {
    originalOrderRef.current = [...items];
  };

  const handleDragEnd = () => {
    const isDifferent = items.some((item, index) => item !== originalOrderRef.current[index]);
    if (isDifferent) {
      onChangeCount();
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
      onChangeCount();
    } else if (direction === 'down' && index < items.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
      setItems(newItems);
      onChangeCount();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full min-h-[400px] flex justify-center items-center font-sans tracking-wide">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 px-4 sm:px-8 py-6 sm:py-8 rounded-3xl shadow-xl border border-gray-200 mx-4">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal max-w-xl mx-auto">Drag and drop to reorder, or use the arrows to move items up and down.</p>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-3">
            {items.map((item, index) => (
              <Reorder.Item 
                key={item} 
                value={item}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="group flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 shadow-sm hover:border-slate-300 dark:border-slate-600 hover:shadow-md transition-all relative z-10"
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-400 px-2 flex items-center h-full transition-colors hidden sm:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                  </svg>
                </div>
                
                {/* Number Badge */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mx-2 sm:mx-4 transition-colors shrink-0 ${index === 0 ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' : index === 1 ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : index === items.length - 1 ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {index + 1}
                </div>
                
                {/* Item Text */}
                <div className="flex-1 text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base leading-tight pr-2">
                  {item}
                </div>
                
                {/* Action Arrows */}
                <div className="flex flex-col gap-1 ml-auto shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(index, 'up'); }}
                    disabled={index === 0}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(index, 'down'); }}
                    disabled={index === items.length - 1}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>

              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
};


const RequirementsScalesStep = ({ data, onUpdate }: { data: WizardData; onUpdate: (index: number, val: number) => void }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const scales = [
    { left: "We have all of the details planned", right: "We require design assistance" },
    { left: "Simple and functional", right: "Latest trends and design" },
    { left: "We just started this process", right: "We are confident about what we need" },
    { left: "We need ball park figures", right: "We need a detailed fixed cost" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full min-h-[400px] flex justify-center items-center font-sans tracking-wide">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 px-4 sm:px-8 py-6 sm:py-8 rounded-3xl shadow-xl border border-gray-200 mx-4 relative overflow-hidden">
        
        {/* Animated Hand/Cursor Demo Overlay */}
        <AnimatePresence>
          {!hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHasInteracted(true)}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900/60 backdrop-blur-[1px] cursor-pointer"
            >
              <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-2xl p-4 shadow-xl mb-4 text-center max-w-xs relative border-[3px] border-blue-400">
                <span className="font-bold">Drag the sliders to reflect your needs</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 dark:bg-blue-500 border-b-[3px] border-r-[3px] border-blue-400 rotate-45"></div>
              </div>
              <motion.div
                animate={{
                  x: [-60, 60, -60],
                  scale: [1, 0.9, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-slate-800 dark:text-slate-200 drop-shadow-lg"
              >
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-200 dark:border-slate-700 z-10 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                </div>
                <div className="absolute top-8 left-8 text-slate-800 dark:text-slate-200 drop-shadow-md">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2"><path d="M4 4l5.5 16.5L13 14l6-6-15-4z" /></svg>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center space-y-2 mb-8 sm:mb-10 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">
            Please adjust the following scales to reflect your requirements.
          </h2>
        </div>

        <div className="w-full space-y-8 sm:space-y-10 relative z-10">
          {scales.map((scale, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 group">
              {/* Mobile Labels */}
              <div className="flex w-full justify-between items-end px-2 sm:hidden text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 gap-2">
                <span className="text-left w-1/2 leading-tight">{scale.left}</span>
                <span className="text-right w-1/2 leading-tight">{scale.right}</span>
              </div>

              {/* Desktop Left Label */}
              <div className="hidden sm:block w-1/3 text-right text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-50">
                {scale.left}
              </div>
              
              <div className="flex-1 w-full relative h-[32px] flex items-center px-2 sm:px-0 mt-2 sm:mt-0" onPointerDown={() => setHasInteracted(true)}>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-8 cursor-pointer"
                  min={0}
                  max={100}
                  step={1}
                  value={[data.requirementsScales[index]]}
                  onValueChange={(val: number[]) => { setHasInteracted(true); onUpdate(index, val[0]); }}
                >
                  <Slider.Track className="relative grow rounded-full h-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                    <Slider.Range className="absolute bg-blue-500 h-full opacity-30" />
                  </Slider.Track>
                  
                  <Slider.Thumb 
                    className="block w-6 h-6 bg-white dark:bg-slate-900 border-[3px] border-blue-500 dark:border-blue-500 rounded-lg shadow-md hover:bg-blue-50 dark:bg-blue-900/40 hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100" 
                    aria-label="Value" 
                  />
                </Slider.Root>
                
                {/* Center Mark */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-slate-300 rounded-full pointer-events-none" />
              </div>

              {/* Desktop Right Label */}
              <div className="hidden sm:block w-1/3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-50">
                {scale.right}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const ClientPhotosStep = ({ currentValue, onUpdate }: { currentValue: { type: 'upload' | 'link', src: string, name?: string, note?: string, likes?: {id: string, x: number, y: number, text: string}[] }[], onUpdate: (val: any[]) => void }) => {
  const [linkInput, setLinkInput] = useState("");
  const activeInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeNoteId, setActiveNoteId] = useState<{idx: number, id: string} | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<{idx: number, id: string} | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files) as File[];
        const uploadedItems = [];
        
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (res.ok) {
            const data = await res.json();
            uploadedItems.push({
              type: 'upload' as const,
              src: data.url || URL.createObjectURL(file), // Fallback if url is missing
              name: file.name
            });
          } else {
            console.error('Failed to upload file:', file.name);
            // Fallback to local url if upload fails
            uploadedItems.push({
              type: 'upload' as const,
              src: URL.createObjectURL(file),
              name: file.name
            });
          }
        }
        onUpdate([...uploadedItems, ...currentValue]);
      } catch (err) {
        console.error('Error in upload process:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      onUpdate([{ type: 'link', src: linkInput.trim() }, ...currentValue]);
      setLinkInput("");
    }
  };

  const removePhoto = (index: number) => {
    const newArr = [...currentValue];
    newArr.splice(index, 1);
    onUpdate(newArr);
  };
  
  const handleDragStartNew = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'new');
    e.dataTransfer.setData('action', 'new');
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartMove = (e: React.DragEvent, id: string, idx: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', 'move');
    e.dataTransfer.setData('action', 'move');
    e.dataTransfer.setData('noteId', id);
    e.dataTransfer.setData('photoIdx', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
    setActiveNoteId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('action');
    if (!action) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newArr = [...currentValue];
    const item = newArr[idx];
    const likes = item.likes || [];
    
    if (action === 'new') {
      const newNote = {
        id: Math.random().toString(36).substring(7),
        x,
        y,
        text: "",
      };
      
      newArr[idx] = { ...item, likes: [...likes, newNote] };
      onUpdate(newArr);
      setActiveNoteId({idx, id: newNote.id});
    } else if (action === 'move') {
      const id = e.dataTransfer.getData('noteId');
      const originIdx = parseInt(e.dataTransfer.getData('photoIdx'), 10);
      
      if (originIdx === idx) {
         newArr[idx] = { 
           ...item, 
           likes: likes.map(note => note.id === id ? { ...note, x, y } : note) 
         };
      } else {
         const originItem = newArr[originIdx];
         const originLikes = originItem.likes || [];
         const noteToMove = originLikes.find(note => note.id === id);
         
         if (noteToMove) {
             newArr[originIdx] = {
                 ...originItem,
                 likes: originLikes.filter(note => note.id !== id)
             };
             
             newArr[idx] = {
                 ...item,
                 likes: [...likes, { ...noteToMove, x, y }]
             };
         }
      }
      
      onUpdate(newArr);
    }
  };

  const handleTouchStartMove = (e: React.TouchEvent, id: string, idx: number) => {
    e.stopPropagation();
    setDraggingNoteId({idx, id});
    setActiveNoteId(null);
  };

  const handleTouchMove = (e: React.TouchEvent, idx: number) => {
    if (draggingNoteId && draggingNoteId.idx === idx) {
      e.cancelable && e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      const newArr = [...currentValue];
      const item = newArr[idx];
      const likes = item.likes || [];
      
      newArr[idx] = { 
        ...item, 
        likes: likes.map(note => note.id === draggingNoteId.id ? { ...note, x: clampedX, y: clampedY } : note) 
      };
      onUpdate(newArr);
    }
  };

  const handleTouchEnd = () => {
    if (draggingNoteId) {
      setDraggingNoteId(null);
    }
  };
  
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newArr = [...currentValue];
      const item = newArr[idx];
      const likes = item.likes || [];
      
      const newNote = {
        id: Math.random().toString(36).substring(7),
        x,
        y,
        text: "",
      };
      
      newArr[idx] = { ...item, likes: [...likes, newNote] };
      onUpdate(newArr);
      setActiveNoteId({idx, id: newNote.id});
    } else {
      setActiveNoteId(null);
    }
  };
  
  useEffect(() => {
    if (activeNoteId && activeInputRef.current) {
      setTimeout(() => {
        activeInputRef.current?.focus();
      }, 50);
    }
  }, [activeNoteId]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto space-y-4 w-full text-left">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Share your inspiration</h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Upload photos of your space, inspiration pictures, or drop links to your Pinterest, Instagram, or Facebook.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upload or Take Photos</h3>
            <label className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg ${isUploading ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 cursor-not-allowed' : 'border-slate-300 dark:border-slate-600 cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:bg-slate-800'} transition-colors`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400">
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-8 w-8 mb-2 sm:mb-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-semibold">Click to upload or take photo</p>
                    <p className="text-[10px] sm:text-xs">PNG, JPG, HEIC</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} />
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">On mobile, you can use your camera directly.</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Add Links</h3>
            <div className="flex items-center gap-2">
              <input 
                type="url" 
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                placeholder="https://pinterest.com/..." 
                className="flex-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyDown={e => e.key === 'Enter' && handleAddLink()}
              />
              <button 
                onClick={handleAddLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shadow-sm"
              >
                Add Link
              </button>
            </div>
            <div className="flex gap-4 items-center justify-center pt-2 sm:pt-4 text-slate-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.795 2.135-4.795 4.604 0 .86.331 1.782.745 2.283.082.099.094.188.069.286-.078.32-.255 1.053-.29 1.205-.045.195-.152.239-.356.143-1.332-.617-2.164-2.557-2.164-4.116 0-3.354 2.436-6.438 7.03-6.438 3.692 0 6.559 2.628 6.559 6.134 0 3.668-2.311 6.618-5.522 6.618-1.077 0-2.092-.56-2.44-1.222l-.666 2.537c-.24 .915-.89 2.062-1.328 2.76A10.012 10.012 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
          </div>
        </div>

        {currentValue.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Added Media</h4>
              <div 
                draggable
                onDragStart={handleDragStartNew}
                className="shrink-0 px-3 py-1.5 rounded-lg font-bold cursor-grab active:cursor-grabbing bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 text-sm border-[2px] border-blue-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                Drag to Pin Like
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentValue.map((item, idx) => (
                <div key={idx} className="relative group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
                  <button 
                    onClick={() => removePhoto(idx)} 
                    className="absolute top-2 right-2 z-30 p-1.5 bg-white dark:bg-slate-900/90 text-red-600 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  
                  <div 
                    className="aspect-video relative bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 cursor-crosshair group/imgContainer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onTouchMove={(e) => handleTouchMove(e, idx)}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => handleImageClick(e, idx)}
                  >
                  {item.type === 'upload' ? (
                    <img src={item.src} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 p-2 w-full h-full">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate w-full px-4 break-all text-center">{item.src}</span>
                    </div>
                  )}
                  
                  {(item.likes || []).map((note, _noteIdx) => {
                    const isActive = activeNoteId?.id === note.id;
                    return (
                      <div
                        key={note.id}
                        style={{ top: `${note.y}%`, left: `${note.x}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                        onClick={(e) => { e.stopPropagation(); setActiveNoteId(isActive ? null : {idx, id: note.id}); }}
                      >
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStartMove(e, note.id, idx)}
                          onTouchStart={(e) => handleTouchStartMove(e, note.id, idx)}
                          className={`relative px-1.5 py-1 rounded-md font-bold text-[9px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all flex items-center gap-1 cursor-grab active:cursor-grabbing border
                            ${isActive 
                              ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-400 z-20 shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
                              : 'bg-blue-500/95 backdrop-blur-sm text-white border-blue-300/50 hover:bg-blue-600 dark:bg-blue-500'
                            }
                          `}
                        >
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-black border-[2px] border-blue-600 shadow-sm pointer-events-none">
                            {_noteIdx + 1}
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                          Like
                        </div>
                      </div>
                    )
                  })}
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
                    <textarea 
                      placeholder="General notes about this..."
                      value={item.note || ""}
                      onChange={(e) => {
                        const newArr = [...currentValue];
                        newArr[idx] = { ...newArr[idx], note: e.target.value };
                        onUpdate(newArr);
                      }}
                      className="w-full text-sm resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      rows={2}
                    />

                    {(item.likes || []).map((note, noteIdx) => {
                       const isActive = activeNoteId?.id === note.id;
                       return (
                         <div key={note.id} className={`flex gap-2 items-start p-2 rounded-lg border transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent'}`}>
                           <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                             {noteIdx + 1}
                           </div>
                           <div className="flex-1">
                             <textarea 
                               ref={isActive ? activeInputRef : null}
                               placeholder="Why do you like this? (optional)"
                               value={note.text || ""}
                               onChange={(e) => {
                                  const newArr = [...currentValue];
                                  const likes = [...(newArr[idx].likes || [])];
                                  likes[noteIdx] = { ...likes[noteIdx], text: e.target.value };
                                  newArr[idx] = { ...newArr[idx], likes };
                                  onUpdate(newArr);
                               }}
                               onFocus={() => setActiveNoteId({idx, id: note.id})}
                               className="w-full text-sm resize-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                               rows={1}
                             />
                           </div>
                           <button 
                             onClick={() => {
                                const newArr = [...currentValue];
                                const likes = [...(newArr[idx].likes || [])];
                                likes.splice(noteIdx, 1);
                                newArr[idx] = { ...newArr[idx], likes };
                                onUpdate(newArr);
                                if (isActive) setActiveNoteId(null);
                             }}
                             className="text-slate-400 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                           </button>
                         </div>
                       );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const PHOTO_COLLECTIONS: Record<string, { url: string; description: string }[]> = {
  "Kitchen Remodel": [
    { url: "/kitchen/1.jpg", description: "White Cabinets with Butcher Block Counters" },
    { url: "/kitchen/2.jpg", description: "Light Wood Kitchen with Island" },
    { url: "/kitchen/3.jpg", description: "Rustic Stone Archways and Dark Wood" },
    { url: "/kitchen/4.jpg", description: "Minimalist Dark Cabinets" },
    { url: "/kitchen/5.jpg", description: "Modern Kitchen with Glass Roof" },
    { url: "/kitchen/6.jpg", description: "Wood Cabinets with Large Granite Backsplash" },
    { url: "/kitchen/7.jpg", description: "White Cabinets with Dark Wood Island" },
    { url: "/kitchen/8.jpg", description: "Warm Wood Cabinets with Long Island" },
  ],
  "Bathroom Remodel": [
    { url: "/bathroom/1.jpg", description: "Beige Bathroom with Pedestal Sink" },
    { url: "/bathroom/2.jpg", description: "Luxurious Corner Tub & Plants" },
    { url: "/bathroom/3.jpg", description: "Stepped Round Tub in Warm Colors" },
    { url: "/bathroom/4.jpg", description: "Large Tub with Dual Sink Vanity" },
    { url: "/bathroom/5.jpg", description: "Modern Shower and Vanity" },
    { url: "/bathroom/6.jpg", description: "Blue Striped Accent Wall Bathroom" },
    { url: "/bathroom/7.jpg", description: "Blue Striped Accent Wall Sink View" },
    { url: "/bathroom/8.jpg", description: "Light Blue Tiled Bathroom" },
    { url: "/bathroom/9.jpg", description: "Modern Living Area (User Uploaded)" },
    { url: "/bathroom/10.jpg", description: "Square Tub and Wood Vanity" },
    { url: "/bathroom/11.jpg", description: "Wood Tiled Bathroom with Bidet" },
    { url: "/bathroom/12.jpg", description: "Black and White Mosaic Bathroom" },
    { url: "/bathroom/13.jpg", description: "Wood Floating Vanity Bathroom" },
    { url: "/bathroom/14.jpg", description: "White and Blue Accented Bathroom" },
    { url: "/bathroom/15.jpg", description: "Light Blue Bathroom View" },
  ],
  "Basement Finishing": [
    { url: "/basement/theater.jpg", description: "Home Theater" },
    { url: "/basement/bar.jpg", description: "Basement Bar" },
    { url: "/basement/fireplace.jpg", description: "Fireplace & Stairs" },
    { url: "/basement/office.jpg", description: "Basement Office" },
    { url: "/basement/ping-pong.jpg", description: "Ping Pong Room" },
    { url: "/basement/family-room.jpg", description: "Family Room" },
    { url: "/basement/Depositphotos_8701920_m.jpg", description: "Basement Interior" },
    { url: "/basement/Depositphotos_8702011_m.jpg", description: "Finished Basement" },
  ],
  "Home Addition": Array.from({length: 10}).map((_, i) => ({
    url: `https://loremflickr.com/1600/900/house,addition,exterior/all?lock=${i+1}`,
    description: `Home Addition Inspiration ${i+1}`
  })),
  "Whole Home": Array.from({length: 10}).map((_, i) => ({
    url: `https://loremflickr.com/1600/900/house,interior,design/all?lock=${i+1}`,
    description: `Whole Home Inspiration ${i+1}`
  })),
  "Additional Dwelling Unit (ADU)": Array.from({length: 10}).map((_, i) => ({
    url: `https://loremflickr.com/1600/900/house,tiny,adu/all?lock=${i+1}`,
    description: `ADU Inspiration ${i+1}`
  })),
  "Exterior Home": Array.from({length: 10}).map((_, i) => ({
    url: `https://loremflickr.com/1600/900/exterior,house/all?lock=${i+1}`,
    description: `Exterior Home Inspiration ${i+1}`
  })),
  "Deck / Fence": [
    { url: "/fence/1.png", description: "Fence Style Options 1" },
    { url: "/fence/2.png", description: "Fence Style Options 2" },
    { url: "/fence/3.png", description: "Fence Style Options 3" }
  ]
};

const PhotoLikeStep = ({ currentValue, onUpdate, projectType, photoIndex, setPhotoIndex }: { currentValue: any[], onUpdate: (val: any[]) => void, projectType: string, photoIndex: number, setPhotoIndex: (val: number) => void }) => {
  const activeInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);

  const photos = PHOTO_COLLECTIONS[projectType] || PHOTO_COLLECTIONS["Kitchen Remodel"];
  const currentPhoto = photos[photoIndex];

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleDragStartNew = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'new');
    e.dataTransfer.setData('action', 'new');
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartMove = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', 'move');
    e.dataTransfer.setData('action', 'move');
    e.dataTransfer.setData('noteId', id);
    e.dataTransfer.effectAllowed = 'move';
    setActiveNoteId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('action');
    if (!action) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (action === 'new') {
      const newNote = {
        id: Math.random().toString(36).substring(7),
        x,
        y,
        text: "",
        photoIndex
      };
      onUpdate([...currentValue, newNote]);
      setActiveNoteId(newNote.id);
    } else if (action === 'move') {
      const id = e.dataTransfer.getData('noteId');
      onUpdate(currentValue.map(note => note.id === id ? { ...note, x, y } : note));
    }
  };

  const handleTouchStartMove = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    setDraggingNoteId(id);
    setActiveNoteId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingNoteId) {
      e.cancelable && e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      onUpdate(currentValue.map(note => note.id === draggingNoteId ? { ...note, x: clampedX, y: clampedY } : note));
    }
  };

  const handleTouchEnd = () => {
    if (draggingNoteId) {
      setDraggingNoteId(null);
    }
  };

  const handleUpdateNote = (id: string, text: string) => {
    onUpdate(currentValue.map(note => note.id === id ? { ...note, text } : note));
  };
  
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUpdate(currentValue.filter(note => note.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newNote = {
        id: Math.random().toString(36).substring(7),
        x,
        y,
        text: "",
        photoIndex
      };
      onUpdate([...currentValue, newNote]);
      setActiveNoteId(newNote.id);
    } else {
      setActiveNoteId(null);
    }
  };

  useEffect(() => {
    if (activeNoteId && activeInputRef.current) {
      setTimeout(() => {
        activeInputRef.current?.focus();
      }, 50);
    }
  }, [activeNoteId]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full flex flex-col items-center font-sans tracking-wide">
      {/* Top Header Section */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 md:px-0">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Style Discovery</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium leading-relaxed">
            Drag the Like Button onto the photo. Explain what you like about it (optional)
          </p>
        </div>
        
        {/* The Draggable Origin Button */}
        <div 
          draggable
          onDragStart={handleDragStartNew}
          className="shrink-0 px-5 py-2.5 rounded-xl font-bold cursor-grab active:cursor-grabbing bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105 border-[3px] border-blue-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          Like
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[40px] shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-[calc(100vh-240px)] md:min-h-[400px]">
        
        {/* Left: Image Area */}
        <div 
          className="relative w-full md:w-3/5 lg:w-2/3 bg-slate-100 dark:bg-slate-800 overflow-hidden h-[300px] sm:h-[400px] md:h-full cursor-crosshair flex-shrink-0 group/imgContainer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
        >
          {/* Instructional Animation overlay */}
          <AnimatePresence>
            {currentValue.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 pointer-events-none bg-slate-900/30 flex items-center justify-center backdrop-blur-[1px]"
              >
                <motion.div 
                  animate={{ 
                    y: [0, 80, 80, 0], 
                    x: [0, -30, -30, 0], 
                    scale: [1, 0.95, 0.95, 1],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="flex flex-col items-center justify-center -mt-10"
                >
                  <div
                    className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 dark:bg-blue-500 text-white shadow-xl flex items-center justify-center gap-2 border-[3px] border-blue-400 z-30 relative"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                    Like
                    {/* Animated Cursor */}
                    <div className="absolute -bottom-6 -right-4 text-slate-800 dark:text-slate-200 drop-shadow-md">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2"><path d="M4 4l5.5 16.5L13 14l6-6-15-4z" /></svg>
                    </div>
                  </div>
                  <div 
                    className="mt-6 text-white font-bold text-lg md:text-xl drop-shadow-md text-center max-w-xs"
                  >
                    Click or Drag to add a Like
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carousel Controls */}
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setPhotoIndex(Math.max(0, photoIndex - 1)); setActiveNoteId(null); }} 
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white dark:bg-slate-900/80 hover:bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-full shadow-lg transition-all disabled:opacity-30 disabled:hover:bg-white dark:bg-slate-900/80 opacity-0 group-hover/imgContainer:opacity-100" 
            disabled={photoIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setPhotoIndex(Math.min(photos.length - 1, photoIndex + 1)); setActiveNoteId(null); }} 
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white dark:bg-slate-900/80 hover:bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-full shadow-lg transition-all disabled:opacity-30 disabled:hover:bg-white dark:bg-slate-900/80 opacity-0 group-hover/imgContainer:opacity-100" 
            disabled={photoIndex === photos.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <img src={currentPhoto.url} alt={currentPhoto.description} className="w-full h-full object-cover select-none pointer-events-none" />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
            {photoIndex + 1} / {photos.length}
          </div>

          {/* Pins */}
          {currentValue.filter(note => note.photoIndex === undefined || note.photoIndex === photoIndex).map((note, index) => {
            const isActive = activeNoteId === note.id;
            return (
              <div
                key={note.id}
                style={{ top: `${note.y}%`, left: `${note.x}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                onClick={(e) => { e.stopPropagation(); setActiveNoteId(isActive ? null : note.id); }}
              >
                {/* The Draggable Like Button */}
                <div 
                  draggable
                  onDragStart={(e) => handleDragStartMove(e, note.id)}
                  onTouchStart={(e) => handleTouchStartMove(e, note.id)}
                  className={`relative px-1.5 py-1 rounded-md font-bold text-[9px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all flex items-center gap-1 cursor-grab active:cursor-grabbing border
                    ${isActive 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-400 z-20 shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
                      : 'bg-blue-500/95 backdrop-blur-sm text-white border-blue-300/50 hover:bg-blue-600 dark:bg-blue-500'
                    }
                  `}
                >
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-black border-[2px] border-blue-600 shadow-sm pointer-events-none">
                    {index + 1}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                  Like
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Sidebar Notes */}
        <div className="w-full md:w-2/5 lg:w-1/3 bg-slate-50 dark:bg-slate-900/50 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 h-[300px] md:h-full">
          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {currentValue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 py-8 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                <p className="text-sm font-medium">Your pinned ideas will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6 pb-12 relative">
                <div className="absolute left-[15px] top-8 bottom-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                
                {[...currentValue].reverse().map((note, reversedIndex) => {
                  const isActive = activeNoteId === note.id;
                  const index = currentValue.length - 1 - reversedIndex;
                  return (
                    <div 
                      key={note.id}
                      className="group/card relative pl-12 transition-all cursor-pointer"
                      onClick={() => {
                        setActiveNoteId(note.id);
                        if (note.photoIndex !== undefined) setPhotoIndex(note.photoIndex);
                      }}
                    >
                      {/* Number Node */}
                      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 transition-colors z-10 
                        ${isActive ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 group-hover/card:border-blue-400 group-hover/card:text-blue-500'}`}>
                        {index + 1}
                      </div>
                      
                      {/* Content Card */}
                      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all relative overflow-hidden
                        ${isActive ? 'border-blue-500 dark:border-blue-500 shadow-md ring-4 ring-blue-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:shadow-md'}
                      `}>
                        {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                        
                        <div className="flex-1 flex flex-col gap-3">
                          {isActive ? (
                            <div className="space-y-3">
                              <textarea
                                ref={activeInputRef}
                                placeholder="What do you love about this?"
                                value={note.text}
                                onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                                className="w-full text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 resize-none h-28 transition-all"
                              />
                              <div className="flex justify-between items-center">
                                {deletingNoteId === note.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-red-600">Delete note?</span>
                                    <button onClick={(e) => handleDeleteNote(note.id, e)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-700 transition">Yes</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeletingNoteId(null); }} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition">Cancel</button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setDeletingNoteId(note.id); }}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    Remove
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveNoteId(null); setDeletingNoteId(null); }}
                                  className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-4">
                              <p className={`text-sm leading-relaxed flex-1 ${note.text ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                                {note.text || "No description provided. Tap to add details."}
                              </p>
                              
                              {deletingNoteId === note.id ? (
                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                  <button onClick={(e) => handleDeleteNote(note.id, e)} className="text-[11px] font-bold bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition">Delete</button>
                                  <button onClick={(e) => { e.stopPropagation(); setDeletingNoteId(null); }} className="text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-300 transition">Cancel</button>
                                </div>
                              ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingNoteId(note.id); }}
                                  className={`p-1.5 shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/card:opacity-100 focus:opacity-100 mt-0.5`}
                                  aria-label="Delete note"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};


const ContactInfoStep = ({ data, onUpdate }: { data: WizardData; onUpdate: (val: any) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'additionalNotes') {
      onUpdate({ ...data, additionalNotes: e.target.value });
    } else if (e.target.name === 'country') {
      onUpdate({ ...data, contactInfo: { ...data.contactInfo, country: e.target.value, stateProvince: "" } });
    } else {
      onUpdate({ ...data, contactInfo: { ...data.contactInfo, [e.target.name]: e.target.value } });
    }
  };

  const [promptText, setPromptText] = useState("What would you like to let us know about?");

  useEffect(() => {
    fetch('/api/discovery-config/1/contact-prompt')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(config => {
        if (config && config.promptText) {
          setPromptText(config.promptText);
        }
      })
      .catch((e) => console.warn('Failed to load contact prompt prompt text', e));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full min-h-[400px] flex items-center justify-center font-sans py-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-200 mx-4">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Tell us about yourself</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base">Where should we send your custom report?</p>
          <p className="text-red-500/80 text-xs font-medium mt-1">* Required fields</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
            <input type="text" name="firstName" value={data.contactInfo.firstName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="John" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
            <input type="text" name="lastName" value={data.contactInfo.lastName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Doe" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={data.contactInfo.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="john@example.com" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
            <input type="tel" name="phone" value={data.contactInfo.phone} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="(555) 123-4567" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Street Address</label>
            <input type="text" name="streetAddress" value={data.contactInfo.streetAddress} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="123 Main St" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Country</label>
            <select name="country" value={data.contactInfo.country || ""} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100" required>
              <option value="" disabled>Select Country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City <span className="text-red-500">*</span></label>
            <input type="text" name="city" value={data.contactInfo.city} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="City" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State / Province</label>
            {data.contactInfo.country === "Canada" ? (
              <select name="stateProvince" value={data.contactInfo.stateProvince} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100">
                <option value="" disabled>Select Province</option>
                {CANADA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : data.contactInfo.country === "United States" ? (
              <select name="stateProvince" value={data.contactInfo.stateProvince} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100">
                <option value="" disabled>Select State</option>
                {USA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input type="text" name="stateProvince" value={data.contactInfo.stateProvince} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="State/Region" />
            )}
          </div>
          <div className="space-y-1 sm:col-span-2 mt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 block">How did you hear about us?</label>
            <select name="howDidYouHearAboutUs" value={data.contactInfo.howDidYouHearAboutUs || ""} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
              <option value="" disabled>Select an option</option>
              <option value="Google Search">Google Search</option>
              <option value="Social Media (Facebook/Instagram/etc.)">Social Media (Facebook/Instagram/etc.)</option>
              <option value="Friend or Family Referral">Friend or Family Referral</option>
              <option value="Saw a Truck or Sign">Saw a Truck or Sign</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2 mt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{promptText}</label>
            <textarea name="additionalNotes" value={data.additionalNotes || ""} onChange={handleChange} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y" placeholder="Any additional details..." />
          </div>
        </div>
      </div>
    </div>
  );
};


const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const StyleNotesVisualizer = ({ notes, projectType }: { notes: any[], projectType: string }) => {
  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.photoIndex]) acc[note.photoIndex] = [];
    acc[note.photoIndex].push(note);
    return acc;
  }, {} as Record<number, any[]>);

  const photos = PHOTO_COLLECTIONS[projectType] || PHOTO_COLLECTIONS["Kitchen Remodel"];

  if (Object.keys(groupedNotes).length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
      {Object.entries(groupedNotes as Record<string, any[]>).map(([photoIndexStr, photoNotes]) => {
        const photoIndex = Number(photoIndexStr);
        const photo = photos[photoIndex];
        if (!photo) return null;

        return (
          <div key={photoIndex} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
              <img src={photo.url} alt={photo.description} className="absolute inset-0 w-full h-full object-cover" />
              {photoNotes.map((note, i) => (
                <div 
                  key={note.id || i}
                  className="absolute w-8 h-8 -ml-4 -mt-4 bg-blue-600 dark:bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center font-bold border-2 border-white cursor-help group"
                  style={{ left: `${note.x}%`, top: `${note.y}%` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                  {note.text && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 w-max max-w-[200px] text-wrap shadow-xl">
                      {note.text}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {photoNotes.some((n: any) => n.text) && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <ul className="space-y-2 text-sm">
                  {photoNotes.map((note: any, i: number) => 
                     note.text ? (
                       <li key={note.id || i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                         <span className="text-blue-500 mt-0.5 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg></span>
                         <span>"{note.text}"</span>
                       </li>
                     ) : null
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


const PoweredByFooter = () => (
  <div className="w-full flex items-center justify-center py-6 text-slate-400 text-xs sm:text-sm font-medium gap-2 select-none bg-transparent">
    <span>Powered by</span>
    <a href="https://www.quotekong.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
      <img src="/quote-kong-logo.png" alt="" className="h-5 w-auto object-contain" onError={(e) => {
        // Fallback context if image isn't uploaded yet
        e.currentTarget.style.display = 'none';
      }} />
      <span className="font-bold text-slate-500 dark:text-slate-400 tracking-tight">Quote Kong</span>
    </a>
  </div>
);

const ReportPreview = ({ data, onReset }: { data: WizardData; onReset: () => void }) => {
  const [activeTab, setActiveTab] = useState<'contractor' | 'user'>('contractor');

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-900/50 font-sans flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Lead Processing Complete</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Here is a preview of the emails that will be sent via QuoteKong.</p>
          </div>
          <button 
            onClick={onReset}
            className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:bg-slate-900/50 transition-colors shadow-sm"
          >
            Start New Wizard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200 dark:bg-slate-700/60 p-1.5 rounded-xl mb-6 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('contractor')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'contractor' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:bg-slate-700/50'}`}
          >
            Contractor Report
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'user' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:bg-slate-700/50'}`}
          >
            Client Email
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Email Header Sim */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-4 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex-1 truncate">
              {activeTab === 'contractor' 
                ? `Subject: 🚨 HOT LEAD: ${data.projectType} in ${data.contactInfo.city} - ${data.contactInfo.firstName} ${data.contactInfo.lastName}` 
                : `Subject: We've received your request! Let's build your dream ${data.projectType}`}
            </div>
          </div>

          <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            {activeTab === 'contractor' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">New {data.projectType} Lead</h2>
                  <p className="text-slate-600 dark:text-slate-400">Generated seamlessly via QuoteKong.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/40 p-5 rounded-xl border border-blue-100 dark:border-blue-900">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Client Details
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p><strong className="text-slate-900 dark:text-slate-50">Name:</strong> {data.contactInfo.firstName} {data.contactInfo.lastName}</p>
                      <p><strong className="text-slate-900 dark:text-slate-50">Phone:</strong> {data.contactInfo.phone}</p>
                      <p><strong className="text-slate-900 dark:text-slate-50">Email:</strong> {data.contactInfo.email}</p>
                      <p><strong className="text-slate-900 dark:text-slate-50">Address:</strong> {data.contactInfo.streetAddress}, {data.contactInfo.city}, {data.contactInfo.stateProvince}</p>
                      {data.contactInfo.howDidYouHearAboutUs && <p><strong className="text-slate-900 dark:text-slate-50">Heard About Us Via:</strong> {data.contactInfo.howDidYouHearAboutUs}</p>}
                      {data.additionalNotes && <p><strong className="text-slate-900 dark:text-slate-50">Additional Notes:</strong> {data.additionalNotes}</p>}
                      {data.projectSubTypes[data.projectType] && data.projectSubTypes[data.projectType].length > 0 && (
                        <p><strong className="text-slate-900 dark:text-slate-50">Scope Details:</strong> {data.projectSubTypes[data.projectType].join(', ')}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/40 p-5 rounded-xl border border-emerald-100">
                    <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Finances & Timeline
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p><strong className="text-slate-900 dark:text-slate-50">Budget Range:</strong> {formatCurrency(data.budgetMin)} - {formatCurrency(data.budgetMax)}</p>
                      <p><strong className="text-slate-900 dark:text-slate-50">Timeline:</strong> {data.timeline}</p>
                      <p><strong className="text-slate-900 dark:text-slate-50">Home Context:</strong> {data.homeContext}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Project Drivers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Event</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{data.triggerEvent || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pain Points</h4>
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-medium">
                        {data.painPoints.length > 0 ? data.painPoints.map((p, i) => <li key={i}>{p}</li>) : <li>None specified</li>}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Concerns</h4>
                       <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-medium flex flex-wrap gap-x-6 gap-y-1">
                        {data.concerns.length > 0 ? data.concerns.map((c, i) => <li key={i}>{c}</li>) : <li>None specified</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Psychological Profile / Priorities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                        <span className="bg-amber-100 text-amber-800 py-0.5 px-2 rounded font-bold mr-2 text-xs">INSIGHT</span>
                        The client adjusted their priorities <strong className="text-slate-900 dark:text-slate-50">{data.priorityChangesCount} times</strong> before submitting.
                      </p>
                      <ol className="list-decimal list-inside text-slate-800 dark:text-slate-200 font-semibold space-y-1.5 ml-2 text-sm">
                        {data.priorities.map((p, i) => (
                          <li key={i} className={i === 0 ? "text-blue-700 dark:text-blue-300 text-base" : ""}>{p} <span className="text-xs text-slate-400 font-normal ml-1">{i === 0 ? "(#1 Most Important)" : ""}</span></li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Requirements Specs (<span className="text-blue-600 dark:text-blue-400 font-normal">Left 0</span> - <span className="text-blue-600 dark:text-blue-400 font-normal">Right 100</span>)</h4>
                      <div className="space-y-4">
                        <div className="text-xs">
                          <div className="flex justify-between mb-1 font-medium text-slate-700 dark:text-slate-300">
                            <span>Details Planned</span>
                            <span>Need Design Help</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.requirementsScales[0] || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="flex justify-between mb-1 font-medium text-slate-700 dark:text-slate-300">
                            <span>Simple & Functional</span>
                            <span>Latest Trends</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.requirementsScales[1] || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="flex justify-between mb-1 font-medium text-slate-700 dark:text-slate-300">
                            <span>Just Started</span>
                            <span>Confident in Needs</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.requirementsScales[2] || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="flex justify-between mb-1 font-medium text-slate-700 dark:text-slate-300">
                            <span>Need Ballpark Costs</span>
                            <span>Need Fixed Cost</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.requirementsScales[3] || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                    Engagement Metrics
                  </h3>
                  <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded border border-purple-200">
                        <p className="text-purple-600 font-semibold mb-1">Time on Testimonials</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
                          {Math.round(Object.values(data.metrics.timeSpentPerTestimonial).reduce((a,b) => a+b, 0) / 1000)}s
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded border border-purple-200">
                        <p className="text-purple-600 font-semibold mb-1">Testimonials Viewed</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
                          {data.metrics.testimonialsViewed.length}
                        </p>
                      </div>
                    </div>
                    {data.metrics.testimonialsViewed.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        View times: {Object.entries(data.metrics.timeSpentPerTestimonial).map(([idx, time]) => `Testimonial ${Number(idx)+1} (${Math.round(time/1000)}s)`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {data.styleNotes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Style Preferences & Likes</h3>
                    <StyleNotesVisualizer notes={data.styleNotes} projectType={data.projectType} />
                  </div>
                )}

                {data.clientPhotos.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Client Provided Inspiration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.clientPhotos.map((photo, i) => (
                        <div key={i} className="space-y-2">
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 aspect-video overflow-hidden bg-slate-50 dark:bg-slate-900/50 relative flex flex-col items-center justify-center text-center">
                            {photo.type === 'upload' ? (
                              <img src={photo.src} alt="Client Upload" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center space-y-2 p-2 w-full h-full">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                <a href={photo.src} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:text-blue-200 font-medium truncate w-full break-all hover:underline z-10 px-4" title={photo.src}>
                                  {photo.src}
                                </a>
                              </div>
                            )}

                            {(photo.likes || []).map((note, noteIdx) => (
                              <div 
                                key={note.id || noteIdx}
                                className="absolute w-8 h-8 -ml-4 -mt-4 bg-blue-600 dark:bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center font-bold border-2 border-white cursor-help group/pin"
                                style={{ left: `${note.x}%`, top: `${note.y}%` }}
                              >
                                <span>{noteIdx + 1}</span>
                                {note.text && (
                                  <div className="absolute hidden group-hover/pin:block top-full mt-2 left-1/2 -translate-x-1/2 min-w-[200px] max-w-xs bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-50 text-left pointer-events-none">
                                    {note.text}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 -mt-2"></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {(photo.note || (photo.likes && photo.likes.length > 0)) && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                              {photo.note && (
                                <p className="mb-2 italic border-b border-slate-200 dark:border-slate-700 pb-2">"{photo.note}"</p>
                              )}
                              {photo.likes && photo.likes.length > 0 && (
                                <ul className="space-y-1 mt-2">
                                  {photo.likes.map((note, noteIdx) => 
                                    note.text ? (
                                      <li key={note.id || noteIdx} className="flex gap-2 text-slate-700 dark:text-slate-300 items-start">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                          {noteIdx + 1}
                                        </div>
                                        <span className="flex-1 mt-0.5">"{note.text}"</span>
                                      </li>
                                    ) : null
                                  )}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Not a good fit?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-lg">If this lead doesn't align with your current services or availability, you can return it to Quote Kong so we can reassign it.</p>
                    <button
                      onClick={() => {
                        alert("In the live Quote Kong integration, this will send the lead back to Quote Kong and remove it from your dashboard.");
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM15 9l-6 6M9 9l6 6"/></svg>
                      This lead is not in our wheelhouse
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </div>
                  <h2 className="text-3xl font-serif text-slate-900 dark:text-slate-50 mb-2">Thank you, {data.contactInfo.firstName || "there"}!</h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400">We've successfully received your project details.</p>
                </div>

                <p>Hi {data.contactInfo.firstName},</p>
                <p>
                  Thank you for taking the time to share your vision with us. We're excited about the possibility of bringing your <strong>{data.projectType || "Remodel"}</strong> project to life!
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 my-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Your Project Summary</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0"><path d="M3 21h18"/><path d="M19 21v-4"/><path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"/><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/></svg>
                      <span><strong>Primary Goal:</strong> Solve {data.painPoints[0] ? `issues like ${data.painPoints[0].toLowerCase()}` : "existing layout and design challenges"}.</span>
                    </li>
                     <li className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span><strong>Target Timeline:</strong> {data.timeline || "Not specified"}.</span>
                    </li>
                    <li className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      <span><strong>Estimated Investment range:</strong> {formatCurrency(data.budgetMin)} - {formatCurrency(data.budgetMax)}.</span>
                    </li>
                    {data.styleNotes.length > 0 && (
                      <li className="flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 shrink-0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span><strong>Style Preferences:</strong> Noted {data.styleNotes.length} specific design ideas from the gallery.</span>
                      </li>
                    )}
                    {data.additionalNotes && (
                      <li className="flex gap-3">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 shrink-0"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                        <span><strong>Additional Notes:</strong> "{data.additionalNotes}"</span>
                      </li>
                    )}
                  </ul>
                </div>

                {data.styleNotes.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-900 rounded-xl p-6 my-6 shadow-sm">
                    <h3 className="font-bold text-blue-900 mb-0 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                      Your Style Preferences
                    </h3>
                    <StyleNotesVisualizer notes={data.styleNotes} projectType={data.projectType} />
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">What happens next?</h3>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</div>
                    <p className="pt-1">Our design and estimating team will review your requirements.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">2</div>
                    <p className="pt-1">We'll reach out to you within the next 48 hours at <strong>{data.contactInfo.phone || "your provided number"}</strong> to schedule a brief introductory call.</p>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Best regards,<br/><strong className="text-slate-800 dark:text-slate-200">The Preconstruction Team</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PoweredByFooter />
    </div>
  );
};

// ==========================================
// MASTER WIZARD CONTROLLER
// ==========================================

export function ProjectDiscoveryWizard({
  onStepChange
}: {
  onStepChange?: (step: number) => void;
} = {}) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("Thanks for your submission, someone will be in touch in the next 2 business days. You will also get an email of this report.");
  const [disabledSteps, setDisabledSteps] = useState<number[]>([]);
  const [disabledProjectTypes, setDisabledProjectTypes] = useState<string[]>([]);
  const [projectTypesConfig, setProjectTypesConfig] = useState<any[]>([]);
  const [stories, setStories] = useState<{ StoryText: string, AuthorName?: string, AuthorPhotoUrl?: string, RenovationPhotoUrl?: string }[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const totalSteps = 13;

  useEffect(() => {
    fetch('/api/discovery-config/1')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.disabledSteps) {
          setDisabledSteps(data.disabledSteps.split(',').map(Number));
        }
        if (data && data.projectTypes) {
          setProjectTypesConfig(data.projectTypes);
        }
        if (data && data.disabledProjectTypes && data.projectTypes) {
          const disabledIds = data.disabledProjectTypes.split(',');
          // map disabled IDs to project type names
          const names = data.projectTypes
            .filter((pt: any) => disabledIds.includes(pt.ProjectTypeID.toString()))
            .map((pt: any) => pt.ProjectTypeName);
          setDisabledProjectTypes(names);
        }
        if (data && data.thankYouMessage) {
          setThankYouMessage(data.thankYouMessage);
        }
      })
      .catch(e => console.warn('Failed to load global config', e));
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // Master State for all gathered data
  const [formData, setFormData] = useState<WizardData>({
    projectType: "",
    projectSubTypes: {},
    homeContext: "",
    painPoints: [],
    triggerEvent: "",
    styleNotes: [],
    clientPhotos: [],
    priorities: [],
    priorityChangesCount: 0,
    concerns: [],
    timeline: "",
    budgetMin: 15000,
    budgetMax: 50000,
    requirementsScales: [50, 50, 50, 50],
    contactInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      stateProvince: "",
      country: "Canada",
      howDidYouHearAboutUs: "",
    },
    additionalNotes: "",
    metrics: {
      testimonialsViewed: [],
      timeSpentPerTestimonial: {},
      timeSpentPerStep: {},
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('magic') === 'true') {
      try {
        const savedData = localStorage.getItem('quoteKong_formData');
        const savedSubmit = localStorage.getItem('quoteKong_isSubmitted');
        const savedStep = localStorage.getItem('quoteKong_step');
        if (savedData) {
          setFormData(JSON.parse(savedData));
        }
        if (savedSubmit === 'true') {
          setIsSubmitted(true);
        } else if (savedStep) {
          setStep(parseInt(savedStep));
        }
      } catch (e) {
        console.error("Failed to parse magic link data", e);
      }
      
      // Clean up URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('magic');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quoteKong_formData', JSON.stringify(formData));
    localStorage.setItem('quoteKong_isSubmitted', isSubmitted.toString());
    localStorage.setItem('quoteKong_step', step.toString());
  }, [formData, isSubmitted, step]);

  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFetchingStory, setIsFetchingStory] = useState(false);

  const subTypesString = (formData.projectSubTypes[formData.projectType] || []).join(',');
  const activePhotoCollections = useMemo(() => {
    let collections = [formData.projectType];
    const SUB_PROJECT_PHOTO_MAP: Record<string, string> = {
      "Kitchen": "Kitchen Remodel",
      "Bathroom": "Bathroom Remodel",
      "Basement": "Basement Finishing",
      "Addition": "Home Addition",
      "Deck": "Deck / Fence",
      "Fence": "Deck / Fence",
      "Patio": "Deck / Fence",
      "Kitchen Remodel": "Kitchen Remodel",
      "Bathroom Remodel": "Bathroom Remodel",
      "Basement Finishing": "Basement Finishing",
      "Home Addition": "Home Addition",
      "Deck / Fence": "Deck / Fence"
    };

    if (subTypesString) {
      const subTypes = subTypesString.split(',');
      const mapped = subTypes.map(st => SUB_PROJECT_PHOTO_MAP[st]).filter(Boolean);
      const uniqueMapped = Array.from(new Set(mapped));
      if (uniqueMapped.length > 0) {
        collections = uniqueMapped;
      }
    }
    return collections;
  }, [formData.projectType, subTypesString]);

  useEffect(() => {
    setCurrentPhotoIndex(0);
    setCurrentCollectionIndex(0);
  }, [activePhotoCollections]);

  useEffect(() => {
    if (!formData.projectType) return;
    
    const projectTypeId = getProjectTypeId(formData.projectType);

    setIsFetchingStory(true);
    setCurrentStoryIndex(0);
    fetch(`/api/discovery-config/1/story/${projectTypeId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStories(data.filter(s => s.StoryText));
        } else if (data && data.StoryText) {
          setStories([data]);
        } else {
          setStories([]);
        }
      })
      .catch((e) => {
        console.warn('Failed to fetch story', e);
        setStories([]);
      })
      .finally(() => {
        setIsFetchingStory(false);
      });
  }, [formData.projectType]);

  const updateForm = (key: keyof WizardData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const stepRef = React.useRef(step);
  const stepEntryRef = React.useRef(Date.now());
  const storyIndexRef = React.useRef(currentStoryIndex);
  const storyEntryRef = React.useRef(Date.now());

  useEffect(() => {
    if (stepRef.current !== step) {
      const prevStep = stepRef.current;
      const now = Date.now();
      const timeSpent = now - stepEntryRef.current;

      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          timeSpentPerStep: {
            ...prev.metrics.timeSpentPerStep,
            [prevStep]: (prev.metrics.timeSpentPerStep[prevStep] || 0) + timeSpent
          }
        }
      }));

      stepRef.current = step;
      stepEntryRef.current = now;
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && stories.length > 0) {
      setFormData(prev => {
        const viewed = new Set(prev.metrics.testimonialsViewed);
        viewed.add(currentStoryIndex);
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            testimonialsViewed: Array.from(viewed)
          }
        };
      });

      if (storyIndexRef.current !== currentStoryIndex) {
        const prevIndex = storyIndexRef.current;
        const now = Date.now();
        const timeSpent = now - storyEntryRef.current;
        
        setFormData(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            timeSpentPerTestimonial: {
              ...prev.metrics.timeSpentPerTestimonial,
              [prevIndex]: (prev.metrics.timeSpentPerTestimonial[prevIndex] || 0) + timeSpent
            }
          }
        }));

        storyIndexRef.current = currentStoryIndex;
        storyEntryRef.current = now;
      }
    }
  }, [currentStoryIndex, step, stories.length]);

  useEffect(() => {
    // When leaving step 2
    if (step === 2) {
      storyIndexRef.current = currentStoryIndex;
      storyEntryRef.current = Date.now();
    } else if (stepRef.current === 2) {
      const prevIndex = storyIndexRef.current;
      const now = Date.now();
      const timeSpent = now - storyEntryRef.current;
      
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          timeSpentPerTestimonial: {
            ...prev.metrics.timeSpentPerTestimonial,
            [prevIndex]: (prev.metrics.timeSpentPerTestimonial[prevIndex] || 0) + timeSpent
          }
        }
      }));
    }
  }, [step]);

  const handleSkipTestimonials = () => {
    if (step === 2) {
      setStep(getNextStep(2));
    }
  };

  const isOtherProject = !["Kitchen Remodel", "Bathroom Remodel", "Basement Finishing", "Home Addition", "Whole Home", "Additional Dwelling Unit (ADU)", "Exterior Home", "Deck / Fence"].includes(formData.projectType);

  const getNextStep = (current: number): number => {
    let next = current + 1;
    while (next <= totalSteps) {
      if (disabledSteps.includes(next)) {
         next++;
         continue;
      }
      if (next === 2 && stories.length === 0) {
         next++;
         continue;
      }
      if (next === 6 && isOtherProject) {
         next++;
         continue;
      }
      break;
    }
    return next;
  };

  const getPrevStep = (current: number): number => {
    let prev = current - 1;
    while (prev >= 1) {
      if (disabledSteps.includes(prev)) {
         prev--;
         continue;
      }
      if (prev === 2 && stories.length === 0) {
         prev--;
         continue;
      }
      if (prev === 6 && isOtherProject) {
         prev--;
         continue;
      }
      break;
    }
    return prev;
  };

  const handleNext = () => {
    if (step === 2 && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      return;
    }
    
    if (step === 6) {
      const currentCollection = activePhotoCollections[currentCollectionIndex] || activePhotoCollections[0];
      const currentPhotos = PHOTO_COLLECTIONS[currentCollection] || PHOTO_COLLECTIONS["Kitchen Remodel"];
      
      if (currentPhotoIndex < currentPhotos.length - 1) {
        setCurrentPhotoIndex((prev) => prev + 1);
        return;
      } else if (currentCollectionIndex < activePhotoCollections.length - 1) {
        setCurrentCollectionIndex((prev) => prev + 1);
        setCurrentPhotoIndex(0);
        return;
      }
    }
    
    const nextStep = getNextStep(step);
    if (nextStep <= totalSteps) {
      setStep(nextStep);
    } else {
      const now = Date.now();
      const timeSpent = now - stepEntryRef.current;
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          timeSpentPerStep: {
            ...prev.metrics.timeSpentPerStep,
            [step]: (prev.metrics.timeSpentPerStep[step] || 0) + timeSpent
          }
        }
      }));
      setIsSubmitted(true);
      setShowThankYouPopup(true);
    }
  };

  const handleBack = () => {
    if (step === 2 && currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      return;
    }
    
    if (step === 6) {
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1);
        return;
      } else if (currentCollectionIndex > 0) {
        setCurrentCollectionIndex((prev) => prev - 1);
        const prevCollection = activePhotoCollections[currentCollectionIndex - 1] || activePhotoCollections[0];
        const prevPhotos = PHOTO_COLLECTIONS[prevCollection] || PHOTO_COLLECTIONS["Kitchen Remodel"];
        setCurrentPhotoIndex(prevPhotos.length - 1);
        return;
      }
    }
    
    setStep(Math.max(1, getPrevStep(step)));
  };

  // Check if current step is valid to enable the "Next" button
  const isStepValid = () => {
    if (isFetchingStory) return false;
    if (step === 1 && !formData.projectType) return false;
    if (step === 3 && !formData.homeContext) return false;
    if (step === 4 && formData.painPoints.length === 0) return false;
    if (step === 5 && !formData.triggerEvent) return false;
    if (step === 10 && formData.concerns.length === 0) return false;
    if (step === 11 && !formData.timeline) return false;
    if (step === 13) {
       const info = formData.contactInfo;
       if (!info.firstName || !info.email || !info.city) return false;
    }
    return true; 
  };

  if (isSubmitted) {
    return (
      <>
        <ReportPreview data={formData} onReset={() => { setIsSubmitted(false); setStep(1); }} />
        <AnimatePresence>
          {showThankYouPopup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 relative"
              >
                <button 
                  onClick={() => setShowThankYouPopup(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Success!</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                  {thankYouMessage}
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => setShowThankYouPopup(false)}
                    className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                  >
                    View Report
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="h-full min-h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans flex flex-col relative">



      {/* Top Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
        <div 
          className="bg-blue-600 dark:bg-blue-500 h-2 transition-all duration-500 ease-out" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center p-4 md:p-6 overflow-y-auto w-full max-w-5xl mx-auto">
        
        {step === 1 && (
          <QuestionStep
            title="What type of project are you planning?"
            subtitle="Select the primary focus of your renovation."
            options={(projectTypesConfig.length > 0 ? projectTypesConfig.map(pt => {
              if (pt.SubAreas) {
                return {
                  label: pt.ProjectTypeName,
                  subOptions: pt.SubAreas.split(',').map((s: string) => s.trim()).filter(Boolean)
                };
              }
              return pt.ProjectTypeName;
            }) : [
              "Kitchen Remodel", 
              "Bathroom Remodel", 
              "Basement Finishing", 
              "Home Addition",
              {
                label: "Whole Home",
                subOptions: ["Kitchen", "Bathroom", "Basement", "Addition", "Living areas", "Bedrooms", "Hallways", "Other"]
              },
              {
                label: "Additional Dwelling Unit (ADU)",
                subOptions: ["Kitchen", "Bathroom", "Bedroom", "Laundry Room", "Garage", "Workshop", "Basement", "Other"]
              },
              {
                label: "Exterior Home",
                subOptions: ["Siding", "Roofing", "Windows", "Doors", "Painting"]
              },
              {
                label: "Deck / Fence",
                subOptions: ["Deck", "Fence", "Patio", "Pergola"]
              }
            ]).filter(opt => {
               const label = typeof opt === 'string' ? opt : opt.label;
               return !disabledProjectTypes.includes(label);
            })}
            currentValue={formData.projectType}
            onUpdate={(val) => updateForm("projectType", val)}
            subSelections={formData.projectSubTypes}
            onUpdateSubSelections={(val) => updateForm("projectSubTypes", val)}
          />
        )}

        {step === 2 && stories.length > 0 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">A word from recent homeowners</h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">See what past {formData.projectType || 'remodel'} clients had to say.</p>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 relative mb-3">
                <div 
                  className="flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${currentStoryIndex * 100}%)` }}
                >
                  {stories.map((story, index) => (
                    <div key={index} className="w-full shrink-0 flex flex-col items-center">
                      <div className="w-full p-6 md:p-8 relative overflow-hidden flex-1 flex flex-col justify-center">
                        <svg className="absolute top-4 left-4 text-blue-100 w-12 h-12 -z-10" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z"></path></svg>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                          {story.AuthorPhotoUrl && (
                            <div className="shrink-0 relative z-10 w-20 h-20 md:w-24 md:h-24">
                              <img 
                                src={story.AuthorPhotoUrl} 
                                alt={story.AuthorName || 'Homeowner'} 
                                className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl isolate"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 space-y-4 z-10 relative">
                            <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap font-medium">
                              "{story.StoryText}"
                            </div>
                            
                            {story.AuthorName && (
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-50 tracking-wide uppercase">
                                — {story.AuthorName}
                              </div>
                            )}
                          </div>
                        </div>

                        {story.RenovationPhotoUrl && (
                          <div className="mt-6 md:mt-8 -mx-6 md:-mx-8 -mb-6 md:-mb-8 h-40 sm:h-56 md:h-64 relative group shrink-0">
                            <img src={story.RenovationPhotoUrl} alt="Renovation Results" className="w-full h-full object-cover shadow-inner hover:scale-105 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="text-white text-sm font-medium drop-shadow-md">See the transformation</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {stories.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button 
                    onClick={() => setCurrentStoryIndex(Math.max(0, currentStoryIndex - 1))}
                    disabled={currentStoryIndex === 0}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex gap-2">
                    {stories.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentStoryIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentStoryIndex ? 'bg-slate-800' : 'bg-slate-300'}`}
                        aria-label={`Go to testimonial ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentStoryIndex(Math.min(stories.length - 1, currentStoryIndex + 1))}
                    disabled={currentStoryIndex === stories.length - 1}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Next testimonial"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-8">
              <button onClick={handleSkipTestimonials} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 font-medium underline transition-colors">
                Skip Testimonials
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <QuestionStep
            title="How long do you plan to stay in this home?"
            subtitle="This helps us recommend the right tier of materials and ROI."
            options={["1-3 Years (Selling Soon)", "4-10 Years (Growing Family)", "This is our Forever Home"]}
            currentValue={formData.homeContext}
            onUpdate={(val) => updateForm("homeContext", val)}
          />
        )}

        {step === 4 && (
          <QuestionStep
            title="What is currently not working for you?"
            subtitle="Select all the pain points you want us to solve. (Select multiple)"
            options={["Outdated appearance", "Lack of storage space", "Poor layout / Traffic flow", "Insufficient lighting", "Things are broken/leaking"]}
            isMulti={true}
            currentValue={formData.painPoints}
            onUpdate={(val) => updateForm("painPoints", val)}
          />
        )}

        {step === 5 && (
          <QuestionStep
            title="What influenced you to renovate now?"
            subtitle="The trigger event that started this process."
            options={["Just purchased the home", "Need more space for family", "Water damage / Necessary repair", "Just time for an update"]}
            currentValue={formData.triggerEvent}
            onUpdate={(val) => updateForm("triggerEvent", val)}
          />
        )}

        {step === 6 && (
          <div className="flex flex-col h-full w-full">
            <PhotoLikeStep 
              currentValue={formData.styleNotes}
              onUpdate={(val) => updateForm("styleNotes", val)}
              projectType={activePhotoCollections[currentCollectionIndex] || formData.projectType}
              photoIndex={currentPhotoIndex}
              setPhotoIndex={setCurrentPhotoIndex}
            />
            <div className="flex justify-center gap-4 mt-8 pb-4">
              {activePhotoCollections.length > 1 && (
                <button 
                  onClick={() => {
                    if (currentCollectionIndex < activePhotoCollections.length - 1) {
                      setCurrentCollectionIndex((prev) => prev + 1);
                      setCurrentPhotoIndex(0);
                    } else {
                      const isOtherProject = !["Kitchen Remodel", "Bathroom Remodel", "Basement Finishing", "Home Addition", "Whole Home", "Additional Dwelling Unit (ADU)", "Exterior Home", "Deck / Fence"].includes(formData.projectType);
                      setStep(isOtherProject ? 8 : 7);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Conclude {activePhotoCollections[currentCollectionIndex] || formData.projectType}
                </button>
              )}
              <button 
                onClick={() => {
                  const isOtherProject = !["Kitchen Remodel", "Bathroom Remodel", "Basement Finishing", "Home Addition", "Whole Home", "Additional Dwelling Unit (ADU)", "Exterior Home", "Deck / Fence"].includes(formData.projectType);
                  setStep(isOtherProject ? 8 : 7);
                }} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 font-medium underline transition-colors px-4 py-2"
              >
                Skip {activePhotoCollections.length > 1 ? 'All ' : ''}Photos
              </button>
            </div>
          </div>
        )}

        {step === 7 && (
          <ClientPhotosStep
            currentValue={formData.clientPhotos}
            onUpdate={(val) => updateForm("clientPhotos", val)}
          />
        )}

        {step === 8 && (
           <PriorityRankingStep
             title="Arrange the following items in order of importance to you"
             subtitle="Select (touch) any item, then tap arrows to move the item up or down."
             currentValue={formData.priorities}
             onUpdate={(val) => updateForm("priorities", val)}
             onChangeCount={() => updateForm("priorityChangesCount", formData.priorityChangesCount + 1)}
           />
        )}

        {step === 9 && (
          <RequirementsScalesStep
            data={formData}
            onUpdate={(index, val) => {
              const newScales = [...formData.requirementsScales];
              newScales[index] = val;
              updateForm("requirementsScales", newScales);
            }}
          />
        )}

        {step === 10 && (
          <QuestionStep
            title="Do you have any concerns?"
            subtitle="Select any worries you have so we can address them. (Select multiple)"
            options={["Going over budget", "Contractors making a mess/dust", "Taking longer than expected", "Making the wrong design choices"]}
            isMulti={true}
            currentValue={formData.concerns}
            onUpdate={(val) => updateForm("concerns", val)}
          />
        )}

        {step === 11 && (
          <QuestionStep
            title="When were you hoping to begin construction?"
            subtitle="Helps us align our production schedule."
            options={["ASAP", "1 to 3 months", "3 to 6 months", "Just exploring options for next year"]}
            currentValue={formData.timeline}
            onUpdate={(val) => updateForm("timeline", val)}
          />
        )}

        {step === 12 && (
          <BudgetStep 
            data={formData} 
            onUpdate={(min, max) => { updateForm("budgetMin", min); updateForm("budgetMax", max); }} 
          />
        )}

        {step === 13 && (
          <ContactInfoStep
            data={formData}
            onUpdate={(val) => setFormData(val)}
          />
        )}

      </div>

      {/* Bottom Navigation Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={handleBack}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700'}`}
        >
          ← Back
        </button>
        
        <div className="flex-1"></div>

        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`px-8 py-3 font-bold rounded-lg transition-all shadow-sm ${
            isStepValid() 
              ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 shadow-md' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {step === totalSteps 
            ? 'Finish & Submit 🎉' 
            : (step === 2 && currentStoryIndex < stories.length - 1 
                ? 'Next Testimonial →' 
                : (step === 6 && (
                    currentPhotoIndex < (PHOTO_COLLECTIONS[activePhotoCollections[currentCollectionIndex] || formData.projectType] || PHOTO_COLLECTIONS["Kitchen Remodel"]).length - 1 || 
                    currentCollectionIndex < activePhotoCollections.length - 1
                  )
                    ? 'Next Photo →'
                    : 'Next Step →'))}
        </button>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900/50 border-t-0 border-slate-200 dark:border-slate-700 -mt-2">
        <PoweredByFooter />
      </div>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const [isMagicLinkOpen, setIsMagicLinkOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMagicLinkInstruction, setShowMagicLinkInstruction] = useState(false);
  const [instructionCountdown, setInstructionCountdown] = useState(3);
  const [hasShownInstruction, setHasShownInstruction] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showMagicLinkInstruction && instructionCountdown > 0) {
      timer = setTimeout(() => {
        setInstructionCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showMagicLinkInstruction, instructionCountdown]);

  useEffect(() => {
    if (showMagicLinkInstruction && window.innerWidth < 640) {
      setIsMobileMenuOpen(false); // Magic link instruction will point to the header button instead of the menu on mobile now Since it is in the header
    }
  }, [showMagicLinkInstruction]);

  const handleMagicLinkClick = () => {
    if (showMagicLinkInstruction) {
        setShowMagicLinkInstruction(false);
    }
    setIsMagicLinkOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col font-sans relative">
        {/* Magic Link Instruction Overlay */}
        <AnimatePresence>
          {showMagicLinkInstruction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 relative"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Save your progress anytime!</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    If you want to save and continue this process later, just click the glowing <strong className="text-blue-600 dark:text-blue-400">"Send me magic link"</strong> button up above!
                  </p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => setShowMagicLinkInstruction(false)}
                    disabled={instructionCountdown > 0}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${instructionCountdown > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md'}`}
                  >
                    {instructionCountdown > 0 ? `Got it! (${instructionCountdown}s)` : "Got it!"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm relative ${showMagicLinkInstruction ? 'z-[60] pointer-events-none' : 'z-20'}`}>
          <div className="flex items-center space-x-3 shrink-0">
            {/* The Logo ALWAYS shows */}
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-sm text-white font-bold text-xl leading-none pt-1">
              QK
            </div>
            {/* Company Name hidden on mobile */}
            <span className="hidden sm:inline text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Quote Kong</span>
          </div>
          <div className="hidden sm:flex flex-wrap gap-4 text-sm sm:text-base items-center">
            {currentStep !== 13 && (
              <button 
                onClick={handleMagicLinkClick}
                className={`px-4 py-2 font-bold rounded-lg transition-all border flex items-center gap-2 ${
                  showMagicLinkInstruction ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 ring-4 ring-blue-500/50 shadow-blue-500/30 scale-105 z-50 text-blue-700 dark:text-blue-300 animate-pulse relative pointer-events-auto' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm pointer-events-auto'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Send me magic link
              </button>
            )}
            {location.pathname === '/project-discovery' && (
              <>
                <Link to="/" className={`text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 font-medium transition-colors ${showMagicLinkInstruction ? 'pointer-events-none opacity-50' : ''}`}>View as Homeowner</Link>
                <Link to="/project-discovery" className={`text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 font-medium transition-colors ${showMagicLinkInstruction ? 'pointer-events-none opacity-50' : ''}`}>Settings</Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 focus:outline-none transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${showMagicLinkInstruction ? 'pointer-events-none opacity-50' : ''}`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
          {/* Mobile Hamburger Button */}
          <div className="sm:hidden flex items-center space-x-2">
            {currentStep !== 13 && (
              <button 
                onClick={handleMagicLinkClick}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all border flex items-center gap-1.5 text-sm ${
                  showMagicLinkInstruction ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 ring-2 ring-blue-500/50 shadow-blue-500/30 scale-105 z-50 text-blue-700 dark:text-blue-300 animate-pulse relative pointer-events-auto' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm pointer-events-auto'
                }`}
                aria-label="Send me magic link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span>Save</span>
              </button>
            )}
            {location.pathname === '/project-discovery' && (
              <button 
                onClick={() => !showMagicLinkInstruction && setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 text-slate-600 dark:text-slate-400 focus:outline-none ${showMagicLinkInstruction ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:text-slate-900 dark:text-slate-50 pointer-events-auto'}`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 ml-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 focus:outline-none ${showMagicLinkInstruction ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'pointer-events-auto'}`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
          </div>
        </nav>
        
        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-[73px] bg-slate-900/30 backdrop-blur-sm z-40 sm:hidden"
              />
              {/* Menu Panel */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`sm:hidden fixed top-[73px] left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl px-4 py-8 z-50`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Company</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Quote Kong</span>
                </div>
                <div className="flex flex-col space-y-3">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 px-5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200 dark:border-slate-700 active:scale-[0.98]">View as Homeowner</Link>
                  <Link to="/project-discovery" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 px-5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200 dark:border-slate-700 mb-4 active:scale-[0.98]">Settings</Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/start" element={<ProjectDiscoveryWizard onStepChange={handleStepChange} />} />
            <Route path="/project-discovery" element={<ProjectDiscoverySettings companyId={1} />} />
          </Routes>
        </div>
      </div>
      <MagicLinkModal isOpen={isMagicLinkOpen} onClose={() => setIsMagicLinkOpen(false)} />
    </>
  );
}

const MagicLinkModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        {!sent ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Save Your Progress</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Enter your email and we'll send you a magic link so you can return right where you left off.</p>
            <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}>
              <input 
                type="email" 
                placeholder="you@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-4"
              />
              <button type="submit" className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                Send Magic Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Check your inbox!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">We've sent a magic link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.</p>
            <div className="space-y-3">
              <button onClick={() => {
                onClose();
                setTimeout(() => {
                  window.location.search = '?magic=true';
                }, 100);
              }} className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                Simulate clicking link in email
              </button>
              <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
