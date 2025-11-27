import React, { useState, useEffect } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { CourseView } from './components/CourseView';
import { LoadingScreen } from './components/LoadingScreen';
import { Branding, CourseContent, ProcessingState, ProcessingStep } from './types';
import { analyzeVideoContent, generateCourseMaterials, generatePodcastAudio } from './services/geminiService';
import { MoonIcon, SunIcon } from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({ step: ProcessingStep.IDLE, message: '' });
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const processVideo = async (file: File, userBranding: Branding) => {
    try {
      setBranding(userBranding);
      
      // Step 1: Analyze
      setState({ step: ProcessingStep.ANALYZING_VIDEO, message: 'AI is watching your video...' });
      const analysis = await analyzeVideoContent(file);
      console.log("Analysis Complete:", analysis);

      // Step 2: Generate Content
      setState({ step: ProcessingStep.GENERATING_COURSE, message: 'Constructing lesson plan and script...' });
      const content = await generateCourseMaterials(analysis, userBranding);
      setCourseContent(content);
      console.log("Content Generated:", content);

      // Step 3: Generate Audio
      setState({ step: ProcessingStep.GENERATING_AUDIO, message: 'Recording AI Podcast...' });
      const audioData = await generatePodcastAudio(content.podcastScript);
      setAudioUrl(audioData);

      // Finish
      setState({ step: ProcessingStep.COMPLETED, message: 'Done!' });

    } catch (error: any) {
      console.error(error);
      setState({ 
        step: ProcessingStep.ERROR, 
        message: 'Something went wrong.', 
        error: error.message || "Unknown error occurred" 
      });
    }
  };

  // Common Header
  const Header = () => (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">NF</div>
        <span className="font-bold text-slate-800 dark:text-white tracking-tight">No Face Course Builder</span>
      </div>
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>
    </header>
  );

  if (state.step === ProcessingStep.IDLE || state.step === ProcessingStep.ERROR) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
         <Header />
         {state.step === ProcessingStep.ERROR && (
           <div className="bg-red-100 text-red-700 p-4 text-center border-b border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
             Error: {state.error}. Please try again with a shorter video or different file.
           </div>
         )}
         <div className="flex-1 flex flex-col justify-center">
            <VideoUploader onUpload={processVideo} />
         </div>
         
         <div className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
           <p>Powered by Google Gemini 2.5 Flash & Gemini 3 Pro</p>
         </div>
      </div>
    );
  }

  if (state.step !== ProcessingStep.COMPLETED) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen state={state} />
        </div>
      </div>
    );
  }

  if (courseContent && branding) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CourseView content={courseContent} audioUrl={audioUrl} branding={branding} />
      </div>
    );
  }

  return null;
};

export default App;
