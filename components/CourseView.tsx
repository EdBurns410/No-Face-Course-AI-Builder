import React, { useState } from 'react';
import { CourseContent, Branding } from '../types';
import { BookIcon, MicIcon, LayersIcon, BrainIcon, PlayIcon, PauseIcon, DownloadIcon } from './Icons';

interface CourseViewProps {
  content: CourseContent;
  audioUrl: string | null;
  branding: Branding;
}

type Tab = 'lesson' | 'podcast' | 'flashcards' | 'quiz';

export const CourseView: React.FC<CourseViewProps> = ({ content, audioUrl, branding }) => {
  const [activeTab, setActiveTab] = useState<Tab>('lesson');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadContent = () => {
    switch (activeTab) {
      case 'lesson':
        const lessonBlob = new Blob([`# ${content.title}\n\n${content.summary}\n\n${content.lessonMarkdown}`], { type: 'text/markdown' });
        const lessonUrl = URL.createObjectURL(lessonBlob);
        const a = document.createElement('a');
        a.href = lessonUrl;
        a.download = `${content.title.replace(/\s+/g, '_')}_Lesson.md`;
        a.click();
        URL.revokeObjectURL(lessonUrl);
        break;
      case 'podcast':
        if (audioUrl) {
          const a = document.createElement('a');
          a.href = audioUrl;
          // The audio is generated as WAV (raw PCM wrapper), so we download as .wav
          a.download = `${content.title.replace(/\s+/g, '_')}_Podcast.wav`;
          a.click();
        }
        break;
      case 'flashcards':
        const fcBlob = new Blob([JSON.stringify(content.flashcards, null, 2)], { type: 'application/json' });
        const fcUrl = URL.createObjectURL(fcBlob);
        const fcLink = document.createElement('a');
        fcLink.href = fcUrl;
        fcLink.download = `${content.title.replace(/\s+/g, '_')}_Flashcards.json`;
        fcLink.click();
        URL.revokeObjectURL(fcUrl);
        break;
      case 'quiz':
        const quizBlob = new Blob([JSON.stringify(content.quiz, null, 2)], { type: 'application/json' });
        const quizUrl = URL.createObjectURL(quizBlob);
        const quizLink = document.createElement('a');
        quizLink.href = quizUrl;
        quizLink.download = `${content.title.replace(/\s+/g, '_')}_Quiz.json`;
        quizLink.click();
        URL.revokeObjectURL(quizUrl);
        break;
    }
  };

  const bgPrimaryStyle = { backgroundColor: branding.primaryColor };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg truncate text-slate-800 dark:text-white" title={content.title}>{content.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">Course Content</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            active={activeTab === 'lesson'} 
            onClick={() => setActiveTab('lesson')} 
            icon={<BookIcon />} 
            label="Text Lesson" 
            color={branding.primaryColor}
          />
          <SidebarItem 
            active={activeTab === 'podcast'} 
            onClick={() => setActiveTab('podcast')} 
            icon={<MicIcon />} 
            label="AI Podcast" 
            color={branding.primaryColor}
          />
          <SidebarItem 
            active={activeTab === 'flashcards'} 
            onClick={() => setActiveTab('flashcards')} 
            icon={<LayersIcon />} 
            label="Flashcards" 
            color={branding.primaryColor}
          />
          <SidebarItem 
            active={activeTab === 'quiz'} 
            onClick={() => setActiveTab('quiz')} 
            icon={<BrainIcon />} 
            label="Quiz" 
            color={branding.primaryColor}
          />
        </nav>
        
        {audioUrl && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Now Playing</p>
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition hover:opacity-90 shadow-md"
                style={bgPrimaryStyle}
               >
                 {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
               </button>
               <div className="overflow-hidden">
                 <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Course Podcast</div>
                 <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Host & Expert</div>
               </div>
            </div>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-10 relative">
        <div className="max-w-4xl mx-auto pb-10">
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{activeTab}</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                {activeTab === 'lesson' && "Mastery Guide"}
                {activeTab === 'podcast' && "Audio Deep Dive"}
                {activeTab === 'flashcards' && "Concept Reinforcement"}
                {activeTab === 'quiz' && "Final Assessment"}
              </h2>
            </div>
            <button 
              onClick={downloadContent}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm text-sm font-medium"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download {activeTab === 'lesson' ? 'MD' : activeTab === 'podcast' ? 'WAV' : 'JSON'}</span>
            </button>
          </div>

          {activeTab === 'lesson' && <LessonContent content={content} branding={branding} />}
          {activeTab === 'podcast' && <PodcastContent content={content} isPlaying={isPlaying} onToggle={togglePlay} branding={branding} />}
          {activeTab === 'flashcards' && <FlashcardsContent content={content} branding={branding} />}
          {activeTab === 'quiz' && <QuizContent content={content} branding={branding} />}
        </div>
      </main>
    </div>
  );
};

// Sub-components

const SidebarItem = ({ active, onClick, icon, label, color }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
    }`}
  >
    <div className={active ? '' : 'opacity-70'} style={active ? { color } : {}}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const LessonContent = ({ content, branding }: { content: CourseContent, branding: Branding }) => (
  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn transition-colors">
    <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">{content.title}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">{content.summary}</p>
    </div>
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-white prose-a:text-blue-600 prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-p:text-slate-700 dark:prose-p:text-slate-300">
      {content.lessonMarkdown.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl mt-8 mb-4">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl mt-8 mb-4 border-l-4 pl-4" style={{borderColor: branding.primaryColor}}>{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg mt-6 mb-3 font-semibold">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2 list-disc">{line.replace('- ', '')}</li>;
        if (line.trim() === '') return <div key={i} className="h-4"></div>;
        return <p key={i} className="mb-4 leading-7">{line.replace(/\*\*(.*?)\*\*/g, (_, p1) => p1)}</p>;
      })}
    </div>
  </div>
);

const PodcastContent = ({ content, isPlaying, onToggle, branding }: any) => (
  <div className="animate-fadeIn">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex items-center justify-between transition-colors">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Listen to the Episode</h2>
        <p className="text-slate-500 dark:text-slate-400">An in-depth conversation covering the key takeaways.</p>
      </div>
      <button 
        onClick={onToggle}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105"
        style={{ backgroundColor: branding.primaryColor }}
      >
        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 ml-1" />}
      </button>
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Transcript</h3>
      {content.podcastScript.map((seg: any, idx: number) => (
        <div key={idx} className={`flex space-x-4 p-5 rounded-xl transition-colors ${seg.speaker === 'Host' ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50'}`}>
          <div className="shrink-0">
             <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm`}
              style={{ backgroundColor: seg.speaker === 'Host' ? branding.primaryColor : '#64748b' }}
             >
               {seg.speaker[0]}
             </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">{seg.speaker}</div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{seg.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FlashcardsContent = ({ content, branding }: { content: CourseContent, branding: Branding }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentCard((p) => (p + 1) % content.flashcards.length), 300);
  };
  
  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentCard((p) => (p - 1 + content.flashcards.length) % content.flashcards.length), 300);
  };

  const card = content.flashcards[currentCard];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fadeIn">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Concepts</h2>
        <p className="text-slate-500 dark:text-slate-400">Card {currentCard + 1} of {content.flashcards.length}</p>
      </div>

      <div 
        className={`flip-card w-full max-w-xl h-80 cursor-pointer group ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-card-inner shadow-2xl rounded-2xl">
          {/* Front */}
          <div className="flip-card-front bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-10 text-center transition-colors">
             <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Question</div>
             <p className="text-2xl font-semibold text-slate-800 dark:text-white">{card.question}</p>
             <div className="absolute bottom-6 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition">Click to flip</div>
          </div>
          {/* Back */}
          <div 
            className="flip-card-back rounded-2xl flex flex-col items-center justify-center p-10 text-center text-white"
            style={{ backgroundColor: branding.primaryColor }}
          >
             <div className="text-sm font-bold text-white/70 uppercase tracking-widest mb-6">Answer</div>
             <p className="text-xl font-medium leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6 mt-12">
        <button onClick={prevCard} className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm font-medium">
          ← Previous
        </button>
        <button onClick={nextCard} className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm font-medium">
          Next Card →
        </button>
      </div>
    </div>
  );
};

const QuizContent = ({ content, branding }: { content: CourseContent, branding: Branding }) => {
  const [answers, setAnswers] = useState<number[]>(new Array(content.quiz.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (showResults) return;
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const score = answers.reduce((acc, ans, idx) => acc + (ans === content.quiz[idx].correctIndex ? 1 : 0), 0);

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Check</h2>
        <p className="text-slate-500 dark:text-slate-400">Test your understanding of the material.</p>
      </div>

      <div className="space-y-6">
        {content.quiz.map((q, qIdx) => (
          <div key={qIdx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">{qIdx + 1}. {q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[qIdx] === oIdx;
                const isCorrect = q.correctIndex === oIdx;
                let cardClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                
                if (showResults) {
                  if (isCorrect) cardClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300";
                  else if (isSelected) cardClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
                  else cardClass = "opacity-50 border-slate-100 dark:border-slate-800 dark:opacity-30";
                } else if (isSelected) {
                   cardClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${cardClass}`}
                    style={isSelected && !showResults ? { borderColor: branding.primaryColor } : {}}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center pb-12">
        {!showResults ? (
          <button 
            onClick={() => setShowResults(true)}
            disabled={answers.includes(-1)}
            className="py-4 px-10 rounded-xl font-bold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            style={{ backgroundColor: branding.primaryColor }}
          >
            Submit Quiz
          </button>
        ) : (
           <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg w-full">
             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-3">Final Score</p>
             <div className="text-5xl font-black text-slate-900 dark:text-white mb-4">{score} / {content.quiz.length}</div>
             <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">{score === content.quiz.length ? "Perfect Score! You're a pro." : "Good effort! Review the lesson and try again."}</p>
             <button 
                onClick={() => { setShowResults(false); setAnswers(new Array(content.quiz.length).fill(-1)); }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
             >
               Retake Quiz
             </button>
           </div>
        )}
      </div>
    </div>
  );
};
