import React, { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

export interface BudgetConfigData {
  SliderTrackMin: number;
  SliderTrackMax: number;
  DefaultHandleMin: number;
  DefaultHandleMax: number;
  StepAmount: number;
}

export interface BudgetSliderStepProps {
  config: BudgetConfigData;
  onNext: (range: [number, number]) => void;
  onBack: () => void;
}

const BudgetSliderStep: React.FC<BudgetSliderStepProps> = ({ config, onNext, onBack }) => {
  const [range, setRange] = useState<[number, number]>([
    config.DefaultHandleMin, 
    config.DefaultHandleMax
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          What is your comfortable investment range?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          This helps us design a project that aligns with your financial expectations.
        </p>
      </div>

      <div className="flex justify-center items-baseline space-x-2 py-8">
        <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
          {formatCurrency(range[0])}
        </span>
        <span className="text-2xl font-medium text-slate-400 mx-4">to</span>
        <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
          {formatCurrency(range[1])}{range[1] === config.SliderTrackMax ? '+' : ''}
        </span>
      </div>

      <div className="px-8 pb-8">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-8"
          min={config.SliderTrackMin}
          max={config.SliderTrackMax}
          step={config.StepAmount}
          value={range}
          onValueChange={(val: number[]) => setRange([val[0], val[1]])}
        >
          <Slider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-[8px]">
            <Slider.Range className="absolute bg-blue-600 dark:bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-6 h-6 bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-md rounded-[10px] hover:bg-blue-50 dark:bg-blue-900/40 focus:outline-none focus:ring-4 focus:ring-blue-100" />
          <Slider.Thumb className="block w-6 h-6 bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-md rounded-[10px] hover:bg-blue-50 dark:bg-blue-900/40 focus:outline-none focus:ring-4 focus:ring-blue-100" />
        </Slider.Root>
        
        <div className="flex justify-between text-sm text-slate-400 mt-4 font-medium">
          <span>{formatCurrency(config.SliderTrackMin)}</span>
          <span>{formatCurrency(config.SliderTrackMax)}+</span>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={() => onNext(range)}
          className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 shadow-md transition-all cursor-pointer"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
export default BudgetSliderStep;
