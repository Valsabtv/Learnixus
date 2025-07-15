

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { BookOpenIcon, SparklesIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon, ChevronLeftIcon, ChevronRightIcon, LightbulbIcon } from './IconComponents';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { Insight } from '../types';

const PLACEHOLDER_IMAGE_URL = 'learnixus_placeholder_image'; // Used if generation fails or as initial

interface ChapterContentViewProps {
  subjectName: string;
  chapterName: string;
  userStudyLevel: string;
  userName: string;
  ai: GoogleGenAI;
  onClose: () => void;
}

const ChapterContentView: React.FC<ChapterContentViewProps> = ({
  subjectName,
  chapterName,
  userStudyLevel,
  userName,
  ai,
  onClose,
}) => {
  const { theme } = useTheme();
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  const bgColor = theme === 'light' ? 'bg-slate-100' : theme === 'dark' ? 'bg-slate-900' : 'bg-black';
  const cardBgColor = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const textColor = theme === 'light' ? 'text-slate-700' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const headingColor = theme === 'light' ? 'text-slate-800' : theme === 'dark' ? 'text-slate-50' : 'text-gray-200';
  const subHeadingColor = theme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const borderColor = theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-700' : 'border-gray-800';
  const buttonBg = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const buttonFocusRing = `focus:ring-${accentColor}-300`;
  const secondaryButtonBg = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' : 'bg-gray-800 hover:bg-gray-700 text-gray-200';
  const secondaryButtonFocusRing = theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500';
  const errorColor = theme === 'light' ? 'text-red-600' : 'text-red-400';
  const errorBgColor = theme === 'light' ? 'bg-red-50' : 'bg-red-500/10';
  const errorBorderColor = theme === 'light' ? 'border-red-300' : 'border-red-500';
  const listDotColor = theme === 'light' ? `before:bg-${accentColor}-500` : `before:bg-${accentColor}-400`;
  const imagePlaceholderBg = theme === 'light' ? 'bg-slate-200' : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-800';
  const insightTitleColor = theme === 'light' ? `text-${accentColor}-700` : `text-${accentColor}-300`;

  const fetchChapterContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);
    setCurrentPageIndex(0);

    try {
      const prompt = `
        You are an AI assistant specializing in creating concise academic key insights for a student.
        The student is at the "${userStudyLevel}" study level.
        For the chapter titled "${chapterName}" in the subject "${subjectName}", generate exactly 5 key insights.

        **Output Format (Strict Adherence Required):**
        - Return the output as a **valid JSON string** that parses into an array of 5 objects.
        - Each object in the array must represent a single key insight and follow this structure:
          {
            "title": "string (short, plain text title for the insight)",
            "description": "string (2-4 lines max, plain text description of the insight)",
            "keyPoints": ["string (plain text key point 1, max 5 bullet points total)", "string (plain text key point 2)", "..."],
            "imageUrl": "string (ALWAYS use '${PLACEHOLDER_IMAGE_URL}' as the value for this field for all insights)"
          }
        - **Plain Text Only:** All string values within the JSON (title, description, keyPoints array elements) must be plain text.
        - **NO MARKDOWN:** Do not use any Markdown formatting (like *, **, _, etc.) within the string values.
        - **NO LATEX:** Do not use LaTeX for mathematical expressions. Describe them in plain text.
        - **Ensure the entire response is ONLY the JSON array string, nothing before or after.**

        **Content Guidelines for each insight:**
        - **Title:** Short and descriptive.
        - **Description:** 2-4 lines, explaining the core idea.
        - **Key Points:** Maximum 5 bullet points (strings in the array). Each point should be brief and highlight a crucial aspect.
        - **Difficulty & Complexity**: Tailor the insights to the "${userStudyLevel}". For higher levels (e.g., 'College/University', 'Working Professional'), focus on more nuanced or advanced concepts within the chapter. For lower levels (e.g., 'Primary School', 'Middle School'), simplify explanations and focus on core, foundational elements.
        - **ImageUrl:** Must ALWAYS be '${PLACEHOLDER_IMAGE_URL}'.
        - **Do NOT mention the student's name (e.g., "${userName}") in any content.**
        - Use minimal line breaks in descriptions and key points, only where semantically appropriate for plain text.

        **Example of the JSON array string the AI should output (ensure your output matches this structure and plain text requirement exactly):**
        "[{\\"title\\":\\"Concept A\\",\\"description\\":\\"Desc of A\\",\\"keyPoints\\":[\\"Point A1\\",\\"Point A2\\"],\\"imageUrl\\":\\"${PLACEHOLDER_IMAGE_URL}\\"}, {\\"title\\":\\"Concept B\\",\\"description\\":\\"Desc of B\\",\\"keyPoints\\":[\\"Point B1\\"],\\"imageUrl\\":\\"${PLACEHOLDER_IMAGE_URL}\\"}]"
        (This example has 2 insights, your output must have 5).

        **Vague Topic Handling:**
        - If the chapter title and subject are too vague to generate 5 meaningful key insights in the specified JSON format, respond with the exact text: "NOT_FOUND". Do not wrap "NOT_FOUND" in JSON or quotes.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      let rawText = response.text;

      if (rawText && rawText.trim().toUpperCase() === "NOT_FOUND") {
        setError(`Could not generate key insights for "${chapterName}". The topic might be too vague for a precise overview at the "${userStudyLevel}" level. Try adding more specific chapter details or notes.`);
        setInsights(null);
      } else if (rawText) {
        let jsonStr = rawText.trim();
        const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/si;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) {
          jsonStr = match[1].trim();
        }

        try {
          const parsedData: unknown = JSON.parse(jsonStr);
          if (Array.isArray(parsedData) &&
              parsedData.length > 0 &&
              parsedData.every(item =>
                typeof item === 'object' && item !== null &&
                'title' in item && typeof item.title === 'string' &&
                'description' in item && typeof item.description === 'string' &&
                'keyPoints' in item && Array.isArray(item.keyPoints) && item.keyPoints.every((kp: unknown) => typeof kp === 'string') &&
                ('imageUrl' in item ? typeof item.imageUrl === 'string' : true) 
              )
          ) {
            const insightsFromParse = (parsedData as Insight[]).map(item => ({
              ...item,
              imageUrl: PLACEHOLDER_IMAGE_URL, // Ensure it's always the placeholder
            }));
            setInsights(insightsFromParse);
            generateImagesForInsights(insightsFromParse);
          } else {
            console.error("Parsed JSON is not an array of valid Insight objects or is empty. Parsed data:", parsedData);
            throw new Error("Parsed JSON is not an array of valid Insight objects or is empty.");
          }
        } catch (parseError) {
          console.error("Failed to parse JSON response for chapter insights:", parseError, "\nRaw text from API:", rawText, "\nProcessed jsonStr for parsing:", jsonStr);
          setError("Failed to display chapter insights. The content received from the AI was not in the expected JSON format. Please try refreshing or regenerating the content if the issue persists.");
          setInsights(null);
        }
      } else {
        setError("No content was generated. The AI might not have enough information for this topic.");
        setInsights(null);
      }
    } catch (err) {
      console.error("Error fetching chapter insights:", err);
      if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))){
        setError("AI features are currently unavailable. The API key is invalid or missing.");
      } else {
        setError("An error occurred while fetching the chapter insights. Please try again later.");
      }
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  }, [ai, userName, userStudyLevel, chapterName, subjectName]);

  const generateImagesForInsights = async (currentInsights: Insight[]) => {
    for (let i = 0; i < currentInsights.length; i++) {
      try {
        const insight = currentInsights[i];
        const imagePrompt = `
          Create a visually appealing and educational image that represents the following concept:
          **Title:** ${insight.title}
          **Description:** ${insight.description}
          The image should be clear, concise, and relevant to the topic. 
          Style: digital illustration, vibrant colors, and a clean aesthetic.
        `;
        
        const response = await fetch(
            "https://api.deepai.org/api/text2img",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K", // Using a public example key
                },
                body: JSON.stringify({
                    text: imagePrompt,
                    grid_size: "1",
                }),
            }
        );

        const result = await response.json();
        const imageUrl = result.output_url;

        if (imageUrl) {
          setInsights(prevInsights => {
            if (!prevInsights) return null;
            const newInsights = [...prevInsights];
            newInsights[i].imageUrl = imageUrl;
            return newInsights;
          });
        }
      } catch (error) {
        console.error(`Failed to generate image for insight ${i}:`, error);
      }
    }
  };

  useEffect(() => {
    fetchChapterContent();
  }, [fetchChapterContent]);

  const totalInsights = insights ? insights.length : 0;
  const currentInsight = insights && insights.length > currentPageIndex ? insights[currentPageIndex] : null;

  return (
    <div className={`flex-1 flex flex-col ${bgColor} p-4 sm:p-6 lg:p-8 animate-fadeIn`}>
      <div className={`w-full max-w-3xl mx-auto ${cardBgColor} p-5 sm:p-6 rounded-xl shadow-xl border ${borderColor} flex flex-col`}>
        <div className="mb-5 text-center">
          <LightbulbIcon className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 ${subHeadingColor}`} />
          <h1 className={`text-xl sm:text-2xl font-bold ${headingColor}`}>{chapterName}</h1>
          <p className={`text-sm ${subHeadingColor} mt-1`}>Key Insights for: {subjectName}</p>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 mb-5 min-h-[300px] sm:min-h-[350px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <SparklesIcon className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 ${subHeadingColor} animate-pulse`} />
              <p className={`${textColor} text-base sm:text-lg font-medium`}>Generating Key Insights...</p>
              <p className={`${textColor} text-xs sm:text-sm`}>This might take a moment.</p>
            </div>
          )}
          {error && !isLoading && (
            <div className={`flex flex-col items-center justify-center h-full p-5 rounded-md ${errorBgColor} border ${errorBorderColor}`}>
              <ExclamationTriangleIcon className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${errorColor}`} />
              <p className={`${errorColor} text-base sm:text-lg font-semibold text-center`}>Error Generating Content</p>
              <p className={`${errorColor} text-xs sm:text-sm text-center mt-1.5`}>{error}</p>
            </div>
          )}
          {!isLoading && !error && currentInsight && (
            <div className={`${textColor} text-sm leading-relaxed space-y-4`}>
              <h2 className={`text-lg sm:text-xl font-semibold ${insightTitleColor} break-words`}>{currentInsight.title}</h2>
              <p className="whitespace-pre-wrap text-sm sm:text-base">{currentInsight.description}</p>
              
              <div className={`my-3 p-3 rounded-lg ${imagePlaceholderBg} flex flex-col items-center justify-center h-40 sm:h-48 shadow-inner`}>
                {currentInsight.imageUrl !== PLACEHOLDER_IMAGE_URL ? (
                  <img src={currentInsight.imageUrl} alt={currentInsight.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <BookOpenIcon className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${textColor} opacity-40`} />
                    <p className={`${textColor} text-xs sm:text-sm`}>Visual learning aid.</p>
                  </>
                )}
              </div>

              {currentInsight.keyPoints && currentInsight.keyPoints.length > 0 && (
                <div className="pt-1">
                  <h3 className={`text-base sm:text-lg font-semibold ${textColor} mb-1.5`}>Key Points:</h3>
                  <ul className="list-none pl-0 space-y-1.5">
                    {currentInsight.keyPoints.map((point, index) => (
                      <li key={index} className={`relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-2 before:h-2 ${listDotColor} before:rounded-full text-sm sm:text-base`}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
           {!isLoading && !error && !currentInsight && (!insights || insights.length === 0) && (
             <div className="flex flex-col items-center justify-center h-full py-8">
                <BookOpenIcon className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${textColor} opacity-50`} />
                <p className={`${textColor} text-base sm:text-lg`}>No insights available for this chapter yet.</p>
             </div>
           )}
        </div>

        {totalInsights > 1 && !isLoading && !error && (
          <div className="flex justify-between items-center mt-3 mb-1">
            <button
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className={`${secondaryButtonBg} font-semibold py-2 px-3.5 rounded-md text-xs shadow-sm hover:opacity-90 focus:outline-none focus:ring-1 ${secondaryButtonFocusRing} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
              aria-label="Previous insight"
            >
              <ChevronLeftIcon className="w-4 h-4"/> Previous
            </button>
            <p className={`${textColor} text-xs`}>
              Insight {currentPageIndex + 1} of {totalInsights}
            </p>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(totalInsights - 1, prev + 1))}
              disabled={currentPageIndex === totalInsights - 1}
              className={`${secondaryButtonBg} font-semibold py-2 px-3.5 rounded-md text-xs shadow-sm hover:opacity-90 focus:outline-none focus:ring-1 ${secondaryButtonFocusRing} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
              aria-label="Next insight"
            >
              Next <ChevronRightIcon className="w-4 h-4"/>
            </button>
          </div>
        )}

        <div className={`mt-auto pt-5 ${totalInsights > 1 && !isLoading && !error ? 'border-t-0' : `border-t ${borderColor}`}`}>
          <button
            onClick={onClose}
            className={`w-full sm:w-auto ${buttonBg} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:scale-[1.03] mx-auto`}
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Back to My Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterContentView;
