
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessedResult, Quote } from "../types";

// List of available icons that the Home component can render
const AVAILABLE_ICONS = [
  'Heart', 'Zap', 'User', 'Star', 'Brain', 'Grid', 'Briefcase', 'Dumbbell', 
  'Utensils', 'Plane', 'Book', 'Music', 'Palette', 'Leaf', 'Smartphone', 
  'DollarSign', 'Sun', 'Moon', 'Coffee', 'Smile', 'Camera', 'Code', 'Gamepad', 
  'Headphones', 'Home', 'Key', 'Lock', 'Map', 'Rocket', 'ShoppingCart', 
  'Terminal', 'Truck', 'Video', 'Wallet', 'Watch', 'Wrench', 'Laptop', 'Car', 
  'Baby', 'Dog', 'Cat', 'Flower'
];

const processImages = async (
  imageFiles: File[],
  availableCategories: string[]
): Promise<ProcessedResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Convert files to base64
  const parts = await Promise.all(
    imageFiles.map(async (file) => {
      return new Promise<{ inlineData: { mimeType: string; data: string } }>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(",")[1];
            resolve({
              inlineData: {
                mimeType: file.type,
                data: base64String,
              },
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      );
    })
  );

  const categoriesString = availableCategories.join(", ");

  const prompt = `
    Analyze these images which are likely screenshots of a TikTok or Instagram quote carousel.
    1. Extract all legible text that looks like a quote, aphorism, or meaningful statement. Ignore UI elements like time, battery, app icons, navigation bars, captions, comments, or watermarks.
    2. Classify the overall theme into EXACTLY ONE of these categories: ${categoriesString}. If none fit perfectly, pick the closest one or 'Other'.
    3. Generate a short, punchy sub-category title (max 5 words) that summarizes the vibe (e.g., "Late Night Thoughts", "Gym Grind", "Healing Era") based on the text content and visual theme.
    4. Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [...parts, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: availableCategories,
            },
            subCategoryTitle: {
              type: Type.STRING,
            },
            quotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["category", "subCategoryTitle", "quotes"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText) as ProcessedResult;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process images. Please try again.");
  }
};

const findRelevantQuotes = async (
  query: string,
  quotes: Quote[]
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Simplify quotes to save tokens
  const simplifiedQuotes = quotes.map((q) => ({ id: q.id, text: q.text }));

  const prompt = `
    User Situation/Intent: "${query}"
    
    Task:
    1. Analyze the user's situation or intent.
    2. Search the provided quotes list for the best matches.
    3. Select 3-5 quotes that are most relevant, witty, or helpful for this specific situation.
    4. Return ONLY a JSON array of the matching quote IDs, ordered by relevance (best match first).

    Quotes:
    ${JSON.stringify(simplifiedQuotes)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as string[];
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};

const suggestCategoryStyle = async (categoryName: string): Promise<{ icon: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Select the most appropriate icon for a category named "${categoryName}" from the following list:
    ${AVAILABLE_ICONS.join(', ')}

    Return ONLY the exact string from the list in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             icon: { type: Type.STRING, enum: AVAILABLE_ICONS }
          }
        }
      }
    });
    
    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    return { icon: result.icon || 'Grid' };
  } catch (e) {
    console.error("AI Icon Error", e);
    return { icon: 'Grid' };
  }
};

export const geminiService = {
  processImages,
  findRelevantQuotes,
  suggestCategoryStyle
};
