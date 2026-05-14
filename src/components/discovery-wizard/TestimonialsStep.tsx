import React from 'react';

export interface TestimonialData {
  TestimonialID: number;
  ClientName: string;
  Quote: string;
  Rating: number;
}

export interface TestimonialsStepProps {
  testimonials: TestimonialData[];
  onNext: () => void;
  onBack: () => void;
}

const TestimonialsStep: React.FC<TestimonialsStepProps> = ({ testimonials, onNext, onBack }) => {
  return (
    <div className="flex flex-col max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          See What Our Clients Say
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          We pride ourselves on delivering excellent service and results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 px-2">
        {testimonials.map((t) => (
          <div key={t.TestimonialID} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(t.Rating || 5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic text-lg leading-relaxed mb-6">
                "{t.Quote}"
              </p>
            </div>
            <p className="text-slate-900 dark:text-slate-50 font-bold">
              — {t.ClientName}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 shadow-md transition-all cursor-pointer"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
export default TestimonialsStep;
