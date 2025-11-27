import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';
import { Branding } from '../types';

interface VideoUploaderProps {
  onUpload: (file: File, branding: Branding) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courseName, setCourseName] = useState("My New Course");
  const [primaryColor, setPrimaryColor] = useState("#2563EB"); // Default Blue
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file, { courseName, primaryColor });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">No Face Course Builder</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          The ultimate tool for course creators. Turn raw screen recordings into polished lessons, quizzes, and podcasts instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
            <input 
              type="text" 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="e.g. Master Figma in 10 Minutes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-20 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-1 bg-white dark:bg-slate-900"
              />
              <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">{primaryColor}</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div 
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
            file 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/*" 
            className="hidden" 
          />
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                 <UploadIcon className="w-7 h-7" />
              </div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">{file.name}</p>
              <p className="text-sm text-blue-500 dark:text-blue-300 mb-4">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button 
                type="button"
                className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                Remove video
              </button>
            </div>
          ) : (
             <>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <UploadIcon className="w-8 h-8" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">Drop your screen recording here</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Supports MP4, WebM, MOV</p>
            </>
          )}
        </div>

        <button 
          type="submit"
          disabled={!file}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
            file 
              ? 'hover:shadow-xl' 
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-500'
          }`}
          style={file ? { background: primaryColor } : {}}
        >
          Build My Course
        </button>
      </form>
    </div>
  );
};
