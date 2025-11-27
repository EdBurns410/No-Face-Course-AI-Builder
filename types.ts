export interface Branding {
  courseName: string;
  primaryColor: string;
  logoUrl?: string; // Optional user logo
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PodcastSegment {
  speaker: 'Host' | 'Expert';
  text: string;
}

export interface CourseContent {
  title: string;
  summary: string;
  lessonMarkdown: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  podcastScript: PodcastSegment[];
}

export enum ProcessingStep {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING_VIDEO = 'ANALYZING_VIDEO',
  GENERATING_COURSE = 'GENERATING_COURSE',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingState {
  step: ProcessingStep;
  message: string;
  error?: string;
}
