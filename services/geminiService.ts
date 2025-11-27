import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CourseContent, Branding, PodcastSegment } from "../types";
import { fileToGenerativePart, base64ToUint8Array, createWavHeader } from "../utils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the video to understand actions and teaching points.
 * Uses gemini-2.5-flash for efficient video understanding.
 */
export const analyzeVideoContent = async (videoFile: File): Promise<string> => {
  const videoPart = await fileToGenerativePart(videoFile);
  
  const prompt = `
    Analyze this screen recording in extreme detail for an educational course.
    
    1. Identify the software or website being used.
    2. List every distinct action taken (e.g., "User clicked the 'Settings' button in the top right").
    3. Identify the key teaching points or goal of this workflow.
    4. Provide a step-by-step breakdown of the process demonstrated.
    
    Be objective and thorough. This analysis will be used to write a lesson script.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [videoPart, { text: prompt }],
    },
  });

  if (!response.text) {
    throw new Error("Failed to analyze video content.");
  }
  
  return response.text;
};

/**
 * Step 2: Generate the Course Content (Script, Lesson, Quiz, Flashcards).
 * Uses gemini-3-pro-preview for high-quality reasoning and content creation.
 */
export const generateCourseMaterials = async (
  videoAnalysis: string, 
  branding: Branding
): Promise<CourseContent> => {
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Catchy title for the course" },
      summary: { type: Type.STRING, description: "A 2-sentence summary of what the student will learn" },
      lessonMarkdown: { type: Type.STRING, description: "A comprehensive formatted text lesson (in Markdown) explaining the concepts and steps detailed in the analysis. Use headers, bullet points, and bold text." },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          },
          required: ["question", "answer"]
        }
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" }
          },
          required: ["question", "options", "correctIndex"]
        }
      },
      podcastScript: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            speaker: { type: Type.STRING, enum: ["Host", "Expert"] },
            text: { type: Type.STRING, description: "Spoken dialogue. Casual, short sentences, interjections." }
          },
          required: ["speaker", "text"]
        }
      }
    },
    required: ["title", "summary", "lessonMarkdown", "flashcards", "quiz", "podcastScript"]
  };

  const prompt = `
    You are the producer of a viral, high-energy educational podcast.
    
    Context:
    We need to turn this screen recording analysis into a "NotebookLM" style deep-dive podcast episode.
    
    Video Analysis:
    ${videoAnalysis}
    
    CAST:
    1. HOST (Puck): High energy, curious, barely knowledgeable. Asks "dumb" questions. Reacts with "Whoa", "No way", "Wait, really?".
    2. EXPERT (Kore): Chill, authoritative but friendly. Uses metaphors. Explains things simply.
    
    SCRIPT RULES:
    - NO "Welcome to the podcast". Jump STRAIGHT into a hook or a question.
    - NO robotic lists ("First click X, then Y").
    - USE METAPHORS. (e.g., "It's like the keys to the castle", "Think of it as a digital backpack").
    - SHORT TURNS. Keep dialogue snappy. 1-2 sentences max per turn.
    - INTERRUPTIONS. The Host should interrupt with questions.
    - FOCUS on the "Aha!" moment and the value, not just the clicks.
    - Length: Keep it to about 12-15 exchanges maximum to keep it punchy.
    
    Task:
    Generate the JSON response with the Course Title, Lesson, Flashcards, Quiz, and this conversational Podcast Script.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate course materials.");
  }

  return JSON.parse(response.text) as CourseContent;
};

/**
 * Step 3: Generate Audio for the Podcast.
 * Uses gemini-2.5-flash-preview-tts with Multi-Speaker config.
 * Handles PCM output by converting to WAV.
 */
export const generatePodcastAudio = async (script: PodcastSegment[]): Promise<string> => {
  if (!script || script.length === 0) {
    throw new Error("Script is empty");
  }

  // Format explicitly for Multi-Speaker TTS model
  const transcript = `TTS the following conversation between Host and Expert:\n` + 
    script.map(s => `${s.speaker}: ${s.text}`).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: {
      parts: [{ text: transcript }]
    },
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Host',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } // Energetic
            },
            {
              speaker: 'Expert',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Calm/Authoritative
            }
          ]
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("Failed to generate audio. The model might be overloaded.");
  }

  // Convert raw PCM (from Gemini) to WAV (for browser playback)
  const pcmData = base64ToUint8Array(base64Audio);
  const wavHeader = createWavHeader(pcmData.length);
  
  // Concatenate header and data
  const wavFile = new Uint8Array(wavHeader.length + pcmData.length);
  wavFile.set(wavHeader, 0);
  wavFile.set(pcmData, wavHeader.length);

  const blob = new Blob([wavFile], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};
