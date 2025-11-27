import React from 'react';
import { ProcessingState, ProcessingStep } from '../types';
import { LoaderIcon } from './Icons';

interface LoadingScreenProps {
  state: ProcessingState;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ state }) => {
  const steps = [
    { step: ProcessingStep.UPLOADING, label: "Processing Video" },
    { step: ProcessingStep.ANALYZING_VIDEO, label: "Analyzing Screen Recording (Vision)" },
    { step: ProcessingStep.GENERATING_COURSE, label: "Designing Course Content (Reasoning)" },
    { step: ProcessingStep.GENERATING_AUDIO, label: "Producing AI Podcast (Audio)" },
  ];

  const currentIdx = steps.findIndex(s => s.step === state.step);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-xl mx-auto mt-10 transition-colors">
      <div className="mb-8 relative">
        <div className="w-20 h-20 bg-blue-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
            <LoaderIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Building Your Course</h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8">AI is transforming your video into an interactive learning experience.</p>

      <div className="w-full space-y-4">
        {steps.map((s, idx) => {
          let statusColor = "text-slate-400 dark:text-slate-600";
          let bgClass = "";
          let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-600" />;
          
          if (idx < currentIdx) {
            statusColor = "text-green-600 dark:text-green-400 font-medium";
            icon = <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center" />;
          } else if (idx === currentIdx) {
            statusColor = "text-blue-600 dark:text-blue-400 font-bold";
            bgClass = "bg-blue-50 dark:bg-blue-900/20";
            icon = <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
          }

          return (
            <div key={s.step} className={`flex items-center space-x-4 p-4 rounded-xl transition-colors ${bgClass}`}>
              {icon}
              <span className={`text-sm ${statusColor}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
